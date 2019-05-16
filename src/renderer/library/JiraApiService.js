const {app} = require('electron').remote;

let JiraClient = require('jira-connector'),
  path = require('path'),
  fs = require('fs'),
  dateFormat = require('dateformat');

let credentialsFile = path.join(app.getPath('userData'), 'credentials.json');

class JiraApiService {
  _jira = undefined;
  _jiraEmail = '';
  _jiraToken = '';
  _jiraHost = '';
  _eventEmitter = undefined;
  _apiRequestTimeout = 50;

  constructor(eventEmitter) {
    this._eventEmitter = eventEmitter;
  }

  autoAuth() {
    console.log(credentialsFile);
    let config = null;
    try {
      let credentials = fs.readFileSync(credentialsFile, "utf8");
      console.log(credentials);
      if (credentials.length) {
        config = JSON.parse(credentials);
      }
    } catch (ex) {
      console.warn(ex);
    }
    console.log(config);
    if (config && config.email !== undefined && config.token !== undefined && config.host !== undefined) {
      this.jiraAuth(config.email, config.token, config.host);
    } else {
      this._eventEmitter.emit('jira-auth-response', {
        status: 'noCredentials'
      });
    }
  };

  jiraAuth(email, token, host) {
    this._jiraEmail = email;
    this._jiraToken = token;
    this._jiraHost = host;

    this._jira = new JiraClient({
      host: host,
      basic_auth: {
        username: email,
        password: token
      }
    });

    console.log(this._jira);
    this.loadUser();
  };

  loadUser() {
    let myselfClient = this._jira.myself,
      self = this;

    myselfClient.getMyself({}, function (error, response) {
      if (error) {
        console.log(error);
        self._eventEmitter.emit('jira-auth-response', {
          status: 'wrongCredentials'
        });
      } else {
        JiraApiService.storeCredentials({
          email: self._jiraEmail,
          token: self._jiraToken,
          host: self._jiraHost
        });
        self._eventEmitter.emit('jira-user-response', {error, response})
      }
    });
  };

  loadBoards(startAt, boards) {
    let self = this;

    setTimeout(function () {
      let dashboardClient = self._jira.board;

      let promise = dashboardClient.getAllBoards({
        maxResults: 50,
        type: 'scrum',
        startAt: startAt
      });
      promise.then(
        result => {
          boards = boards.concat(result.values);
          if (result.total > startAt + 50) {
            startAt += 50;
            self.loadBoards(startAt, boards);
          } else {
            self._eventEmitter.emit('jira-boards-all-response', {boards});
            self._eventEmitter.emit('jira-boards-all-loaded-response', {result});
          }
        },
        error => {
          console.warn(error);
          self.loadBoards(startAt, boards);
        }
      )
    }, self._apiRequestTimeout);
  };

  boardIssuesRequest(params) {
    let self = this,
      dashboardClient = self._jira.board;

    // If we start loading backlog from beginning it could mean we switched the board, so we request also tasks from current sprint if exists
    if (params.startAt === 0) {
      let promise = dashboardClient.getSprintsForBoard({
        boardId: params.boardId,
        state: 'active'
      });

      promise.then(
        result => {
          if (result.values.length) {
            let sprintClient = self._jira.sprint;
            let promise = sprintClient.getSprintIssues({
              fields: 'issuetype, summary, sprint',
              maxResults: 1000,
              jql: 'issuetype not in subtaskIssueTypes()',
              sprintId: result.values[0].id
            });

            promise.then(
              result => {
                self._eventEmitter.emit('jira-boards-issues-response', {result, isSprint: true})
              },
              error => {
                self._eventEmitter.emit('jira-boards-issues-response', {error, isSprint: true})
              }
            )
          }
        }
      )
    }

    setTimeout(function () {
      let promise = dashboardClient.getIssuesForBacklog({
        maxResults: params.maxResults,
        startAt: params.startAt,
        boardId: params.boardId,
        fields: 'issuetype, summary',
        jql: 'issuetype not in subtaskIssueTypes()',
      });

      promise.then(
        result => {
          self._eventEmitter.emit('jira-boards-issues-response', {result})
        },
        error => {
          self._eventEmitter.emit('jira-boards-issues-response', {error})
        }
      )
    }, self._apiRequestTimeout);

  }

  pushWorklogs(worklogs) {
    let self = this,
      issueClient = jira.issue;
    worklogs.map(function (value, key) {
      value.worklog.started = dateFormat(value.worklog.started, "UTC:yyyy-mm-dd'T'HH:MM:ss.000+0000");
      issueClient.addWorkLog(value, function (error, response) {
        self._eventEmitter.emit('jira-issues-save-worklogs-response', {value, error, response})
      });
    });
  }

  static storeCredentials(arg = false) {
    console.log('store creds', arg);
    let data = '';
    if (arg) {
      data = JSON.stringify({
        email: arg.email,
        token: arg.token,
        host: arg.host
      });
    }

    try {
      fs.writeFileSync(credentialsFile, data, {
        flag: 'w+'
      });
    } catch (ex) {
      console.warn(ex);
    }
  };

}

export default JiraApiService;

