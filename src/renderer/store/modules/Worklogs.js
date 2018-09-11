import * as HelperFunctions from '../../library/HelperFunctions';

const state = {
  logs: [],
  invalid: [],
  pushed: []
};

const mutations = {
  ADD_LOGS (state, logs) {
    logs.map(function(value) {
      value.internalId = state.logs.length;
      state.logs.push(value);
    });
  },
  UPDATE_WORKLOG_FIELD (state, args) {
    HelperFunctions.accessNested(state.logs[args.index], args.field, args.value);
  },
  SET_WORKLOG_VALID (state, key) {
    let index = state.invalid.indexOf(key);
    if (index > -1) {
      state.invalid.splice(index, 1);
    }
  },
  SET_WORKLOG_INVALID (state, key) {
    let index = state.invalid.indexOf(key);
    if (index < 0) {
      state.invalid.push(key);
    }
  },
  REMOVE_WORKLOG (state, worklog) {
    let index = state.logs.findIndex(item => item.issueKey === worklog.issueKey);
    if (index > -1) {
      state.logs.splice(index, 1);
    }
  },
  REMOVE_ALL_WORKLOGS (state) {
    state.logs = [];
  }
};

const actions = {

};

export default {
  state,
  mutations,
  actions
}
