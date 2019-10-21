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
      dashboardClient = self._jira.board,
      sprintMaxResults = 1000;

    // If we start loading backlog from beginning it could mean we switched the board, so we request also tasks from current sprint if exists
    if (params.startAt === 0) {
      let promise = dashboardClient.getAllSprints({
        boardId: params.boardId,
        state: 'future,active'
      });

      promise.then(
        result => {
          if (result.values.length) {
            result.values.forEach(function(sprint, index) {
              let sprintClient = self._jira.sprint;
              let promise = sprintClient.getSprintIssues({
                fields: 'issuetype, summary, sprint',
                maxResults: sprintMaxResults,
                jql: 'issuetype not in subtaskIssueTypes()',
                sprintId: sprint.id
              });

              promise.then(
                result => {
                  self._eventEmitter.emit('jira-boards-issues-response', {
                    result,
                    rankingRange: index * sprintMaxResults,
                    isSprint: true
                  })
                },
                error => {
                  self._eventEmitter.emit('jira-boards-issues-response', {error})
                }
              )
            });
          }
        }
      )
    }

    setTimeout(function () {
      let promise = dashboardClient.getIssuesForBacklog({
        maxResults: params.maxResults,
        startAt: params.startAt,
        boardId: params.boardId,
        fields: ['issuetype', 'summary', 'sprint'],
        jql: 'issuetype not in subtaskIssueTypes()',
      });
      let rankingRange = 1000000 + params.startAt * 2;

      promise.then(
        result => {
          self._eventEmitter.emit('jira-boards-issues-response', {
            result,
            rankingRange: rankingRange
          })
        },
        error => {
          self._eventEmitter.emit('jira-boards-issues-response', {error})
        }
      )
    }, self._apiRequestTimeout);

  }

  pushWorklogs(worklogs) {
    let self = this,
      issueClient = self._jira.issue;

    worklogs.forEach(function (value) {
      let structure = JSON.parse(JSON.stringify(value));
      structure.worklog.started = dateFormat(structure.worklog.started, "UTC:yyyy-mm-dd'T'HH:MM:ss.000+0000");

      issueClient.addWorkLog(structure, function (error, response) {
        self._eventEmitter.emit('jira-issues-save-worklogs-response', {value, error, response})
      });
    });
  }

  static storeCredentials(arg = false) {
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

