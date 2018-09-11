const {ipcMain, app} = require('electron');

let JiraClient = require('jira-connector'),
  path = require('path'),
  fs = require('fs'),
  dateFormat = require('dateformat');

let credentialsFile = path.join(app.getPath('userData'), 'credentials.json');

let jira = null;
let jiraEmail = '';
let jiraToken = '';
let jiraHost = '';

let jiraAuth = function (email, token, host) {
  jiraEmail = email;
  jiraToken = token;
  jiraHost = host;

  jira = new JiraClient({
    host: host,
    basic_auth: {
      username: email,
      password: token
    }
  });
};

let loadBoards = function (event, arg) {
  let dashboardClient = jira.board;
  dashboardClient.getAllBoards({
    maxResults: 50,
    type: 'scrum',
    startAt: arg.startAt
  }, function (error, response) {
    if (error !== null) {
      console.warn(error);
      loadBoards(event, arg);
      return false;
    }
    arg.boards = arg.boards.concat(response.values);
    if (response.total > arg.startAt + 50) {
      arg.startAt += 50;
      loadBoards(event, arg);
    }
    else {
      let boards = arg.boards;
      event.sender.send('jira-boards-all-response', {error, boards});
      event.sender.send('jira-boards-all-loaded-response', {error, response});
    }
  });
};

let storeCredentials = function(arg = false) {
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
    fs.writeFile(credentialsFile, data, {
      flag: 'w+'
    });
  } catch (ex) {
    console.warn(ex);
  }
};

let loadUser = function(event) {
  let myselfClient = jira.myself;
  myselfClient.getMyself({}, function (error, response) {
    if (error) {
      console.log(error);
      event.sender.send('jira-auth-response', {
        status: 'wrongCredentials'
      });
    }
    else {
      storeCredentials({
        email: jiraEmail,
        token: jiraToken,
        host: jiraHost
      });
      event.sender.send('jira-user-response', {error, response})
    }
  });
};

ipcMain.on('jira-autoauth', (event, arg) => {
  let config = null;
  try {
    let credentials = fs.readFileSync(credentialsFile, "utf8");
    if (credentials.length) {
      config = JSON.parse(credentials);
    }
  } catch (ex) {
    console.warn(ex);
  }
  console.log(config);
  if (config && config.email !== undefined && config.token !== undefined && config.host !== undefined) {
    jiraAuth(config.email, config.token, config.host);
    loadUser(event);
  }
  else {
    event.sender.send('jira-auth-response', {
      status: 'noCredentials'
    });
  }
});

ipcMain.on('jira-auth', (event, arg) => {
  jiraAuth(arg.email, arg.token, arg.host);
  loadUser(event);
});

ipcMain.on('jira-boards-all-request', (event) => {
  let arg = {
    startAt: 0,
    boards: []
  };
  loadBoards(event, arg);
});

ipcMain.on('jira-boards-issues-request', (event, arg) => {
  let dashboardClient = jira.board;
  // If we start loading backlog from beginning it could mean we switched the board, so we request also tasks from current sprint if exists
  if (arg.startAt === 0) {
    dashboardClient.getSprintsForBoard({
      boardId: arg.boardId,
      state: 'active'
    }, function (error, response) {
      if (response.values.length) {
        let sprintClient = jira.sprint;
        sprintClient.getSprintIssues({
          fields: 'issuetype, summary, sprint',
          maxResults: 1000,
          jql: 'issuetype not in subtaskIssueTypes()',
          sprintId: response.values[0].id
        }, function (error, response) {
          event.sender.send('jira-boards-issues-response', {error, response, isSprint: true})
        })
      }
    });
  }
  dashboardClient.getIssuesForBacklog({
    maxResults: arg.maxResults,
    startAt: arg.startAt,
    boardId: arg.boardId,
    fields: 'issuetype, summary'
  }, function (error, response) {
    event.sender.send('jira-boards-issues-response', {error, response})
  });
});

ipcMain.on('jira-issues-save-worklogs-request', (event, arg) => {
  let issueClient = jira.issue;
  arg.worklogs.map(function (value, key) {
    value.worklog.started = dateFormat(value.worklog.started, "UTC:yyyy-mm-dd'T'HH:MM:ss.000+0000");
    issueClient.addWorkLog(value, function (error, response) {
      event.sender.send('jira-issues-save-worklogs-response', {value, error, response})
    });
  });

});

ipcMain.on('jira-tasks-request', (event, arg) => {
  let dashboardClient = jira.dashboard;
  dashboardClient.getDashboard({}, function (error, response) {

  })
});


