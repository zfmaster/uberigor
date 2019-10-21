import store from './../store'
import JiraApiService from './JiraApiService';

let currentIssuesStartAt = 0,
  currentBoardValue = null;

let jiraApiService,
  eventEmitter;

export const init = function (emitter) {
  eventEmitter = emitter;
  jiraApiService = new JiraApiService(eventEmitter);

  initListeners();
  jiraApiService.autoAuth();
};

export const initListeners = function () {
  eventEmitter.on('jira-user-response', (result) => {
    eventEmitter.emit('app-get-config');
    jiraApiService.loadBoards(0, []);
    store.commit('SET_USER', result.response);
  });

  eventEmitter.on('jira-auth-response', (result) => {
    if (result.status === 'noCredentials' || result.status === 'wrongCredentials') {
      store.commit('SET_LOADING', false);
      store.commit('SET_CREDENTIALS_STATUS', result.status);
    }
  });

  eventEmitter.on('jira-boards-all-response', (result) => {
    store.commit('SET_BOARDS', result.boards);
  });

  eventEmitter.on('jira-boards-all-loaded-response', () => {
    store.commit('SET_BOARDS_LOADING', false);
  });

  eventEmitter.on('jira-issues-save-worklogs-response', (result) => {
    console.log(result);
    if (result.error == null) {
      store.commit('REMOVE_WORKLOG', result.value);
    }
  });

  eventEmitter.on('jira-boards-issues-response', (result) => {
    if (result.result !== null) {
      result.result.issues.map(function (issue, index) {
        issue.rank = index + result.rankingRange;
      });

      store.commit('ADD_BOARD_ISSUES', {
        issues: result.result.issues,
      });

      if (!result.isSprint) {
        let backlogIssuesLength = store.state.Board.issues.reduce((n, issue) => n + (issue.fields.sprint == null), 0);
        if (backlogIssuesLength >= result.result.total) {
          store.commit('SET_ALL_ISSUES_ARE_LOADED', true);
          store.commit('SET_ISSUES_ARE_LOADING', false);
        } else {
          loadIssues();
        }
      }
    }
  });

  eventEmitter.on('app-get-config-response', (config) => {
    if (config.lastBoard !== undefined && config.lastBoard !== null) {
      loadIssues(config.lastBoard);
    }
  });
};

export const getMaxResults = function () {
  return 50;
};

export const pushWorklogs = function () {
  let worklogs = store.state.Worklogs.logs;
  if (worklogs.length) {
    jiraApiService.pushWorklogs(worklogs);
  }
};

export const loadIssues = function (value = false) {
  if (value) {
    if (currentBoardValue !== value) {
      currentBoardValue = value;
      currentIssuesStartAt = 0;
      removeIssues();
    } else {
      return;
    }
  } else {
    currentIssuesStartAt += getMaxResults()
  }
  getIssues({
    boardId: currentBoardValue,
    startAt: currentIssuesStartAt
  });
};

export const removeIssues = function () {
  store.commit('SET_BOARD_ISSUES', []);
};

export const getIssues = function (args) {
  jiraApiService.boardIssuesRequest({
    boardId: args.boardId,
    startAt: args.startAt,
    maxResults: getMaxResults()
  });
};

export const authenticate = function (email, token, host) {
  store.commit('SET_CREDENTIALS_STATUS', '');
  jiraApiService.jiraAuth(email, token, host);
};


