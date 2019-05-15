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

  constructor(eventEmitter) {
    this._eventEmitter = eventEmitter;
  }

  autoAuth() {
    console.log(credentialsFile);
    let config = null;
    try {
      console.log('test2');
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
    let dashboardClient = this._jira.board,
      self = this;

    dashboardClient.getAllBoards({
      maxResults: 50,
      type: 'scrum',
      startAt: startAt
    }, function (error, response) {
      if (error !== null) {
        console.warn(error);
        self.loadBoards(event, arg);
        return false;
      }
      boards = boards.concat(response.values);
      if (response.total > startAt + 50) {
        startAt += 50;
        self.loadBoards(startAt, boards);
      } else {
        self._eventEmitter.emit('jira-boards-all-response', {error, boards});
        self._eventEmitter.emit('jira-boards-all-loaded-response', {error, response});
      }
    });
  };

  boardIssuesRequest(params) {
    let self = this,
      dashboardClient = self._jira.board;
    // If we start loading backlog from beginning it could mean we switched the board, so we request also tasks from current sprint if exists
    if (params.startAt === 0) {
      dashboardClient.getSprintsForBoard({
        boardId: params.boardId,
        state: 'active'
      }, function (error, response) {
        if (response.values.length) {
          let sprintClient = self._jira.sprint;
          sprintClient.getSprintIssues({
            fields: 'issuetype, summary, sprint',
            maxResults: 1000,
            jql: 'issuetype not in subtaskIssueTypes()',
            sprintId: response.values[0].id
          }, function (error, response) {
            self._eventEmitter.emit('jira-boards-issues-response', {error, response, isSprint: true})
          })
        }
      });
    }
    dashboardClient.getIssuesForBacklog({
      maxResults: params.maxResults,
      startAt: params.startAt,
      boardId: params.boardId,
      fields: 'issuetype, summary'
    }, function (error, response) {
      self._eventEmitter.emit('jira-boards-issues-response', {error, response})
    });
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

