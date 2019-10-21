const state = {
  boards: [],
  boardsLoading: true,
  issues: [],
  times: {},
  currentlyComputed: null,
  compuntingStartTime: null,
  intervalLink: null,
  issuesAreLoading: false,
  allIssuesAreLoaded: false
};

const mutations = {
  SET_BOARDS(state, boards) {
    state.boards = state.boards.concat(boards);
  },
  SET_BOARDS_LOADING(state, value) {
    state.boardsLoading = value;
  },
  ADD_BOARD_ISSUES(state, args) {
    let issues = state.issues.concat(args.issues);
    issues.sort(function(a, b) {
      if (a.fields.sprint == null) {
        return (b.fields.sprint == null) ? a.rank - b.rank : 1;
      }
      return (b.fields.sprint == null) ? -1 : (a.fields.sprint.id === b.fields.sprint.id) ? a.rank - b.rank : a.fields.sprint.id - b.fields.sprint.id;
    });

    state.issues = issues;
  },
  SET_BOARD_ISSUES(state, issues) {
    state.issues = issues;
  },
  START_COMPUTING(state, index) {
    state.currentlyComputed = index;
    state.compuntingStartTime = Math.trunc((new Date()).getTime() / 1000);
  },
  UPDATE_COMPUTING(state, args) {
    if (state.times[args.index] === undefined) {
      state.times[args.index] = 0;
    }
    state.times[args.index] += args.value;
  },
  SET_ISSUES_ARE_LOADING(state, value) {
    state.issuesAreLoading = value;
  },
  SET_ALL_ISSUES_ARE_LOADED(state, value) {
    state.allIssuesAreLoaded = value;
  },
  SET_INTERVAL_LINK(state, link) {
    state.intervalLink = link;
  }
};

const actions = {};

export default {
  state,
  mutations,
  actions
}
