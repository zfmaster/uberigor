import {ipcRenderer} from 'electron';
import store from './../store'

let currentIssuesStartAt = 0,
  currentBoardValue = null;

export const init = function () {
  initListeners();

  ipcRenderer.on('jira-auth-response', (event, result) => {
    if (result.status === 'noCredentials' || result.status === 'wrongCredentials') {
      store.commit('SET_LOADING', false);
      store.commit('SET_CREDENTIALS_STATUS', result.status);
    }
  });

  ipcRenderer.send('jira-autoauth')
};

export const initListeners = function () {
  ipcRenderer.on('jira-boards-all-response', (event, result) => {
    store.commit('SET_BOARDS', result.boards);
  });

  ipcRenderer.on('jira-user-response', (event, result) => {
    getUserDashboards();
    ipcRenderer.send('app-get-config');
    store.commit('SET_USER', result.response);
  });

  ipcRenderer.on('jira-boards-all-loaded-response', (event, result) => {
    store.commit('SET_BOARDS_LOADING', false);
  });

  ipcRenderer.on('jira-issues-save-worklogs-response', (event, result) => {
    console.log(result);
    if (result.error == null) {
      store.commit('REMOVE_WORKLOG', result.value);
    }
  });

  ipcRenderer.on('jira-boards-issues-response', (event, result) => {
    store.commit('SET_ISSUES_ARE_LOADING', false);
    if (result.response !== null) {
      store.commit('ADD_BOARD_ISSUES', {
        issues: result.response.issues,
        isSprint: result.isSprint
      });
      if (!result.isSprint && (store.state.Board.issues.length >= result.response.total)) {
        store.commit('SET_ALL_ISSUES_ARE_LOADED', true);
      }
    }
  });
};

export const getMaxResults = function() {
  return 20;
};

export const pushWorklogs = function () {
  let worklogs = store.state.Worklogs.logs;
  if (worklogs.length) {
    ipcRenderer.send('jira-issues-save-worklogs-request', {
      worklogs: worklogs
    })
  }
};

export const loadIssues = function (value = false) {
  if (value) {
    if (currentBoardValue !== value) {
      currentBoardValue = value;
      currentIssuesStartAt = 0;
      removeIssues();
    }
    else {
      return;
    }
  }
  else {
    currentIssuesStartAt += getMaxResults()
  }
  getIssues({
    boardId: currentBoardValue,
    startAt: currentIssuesStartAt
  });
};

export const removeIssues = function() {
  store.commit('SET_BOARD_ISSUES', []);
};

export const getIssues = function (args) {
  store.commit('SET_ISSUES_ARE_LOADING', true);
  console.log('sendrequest');
  ipcRenderer.send('jira-boards-issues-request', {
    boardId: args.boardId,
    startAt: args.startAt,
    maxResults: getMaxResults()
  })
};

export const authenticate = function (email, token, host) {
  store.commit('SET_CREDENTIALS_STATUS', '');
  ipcRenderer.send('jira-auth', {
    email: email,
    token: token,
    host: host
  })
};

export const getUserDashboards = function () {
  ipcRenderer.send('jira-boards-all-request')
};
