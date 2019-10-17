import * as HelperFunctions from '../../library/HelperFunctions';
import store from "../index";

const state = {
  logs: [],
  invalid: [],
  pushed: [],
  nextInternalId: 1
};

const mutations = {
  ADD_LOGS (state, logs) {
    logs.map(function(value) {
      value.internalId = state.nextInternalId++;
      state.logs.push(value);
    });
  },
  UPDATE_WORKLOG_FIELD (state, args) {
    HelperFunctions.accessNested(state.logs[args.index], args.field, args.value);
  },
  REMOVE_WORKLOG_INVALID (state, internalId) {
    let index = state.invalid.findIndex(item => item === internalId);
    if (index > -1) {
      state.invalid.splice(index, 1);
    }
  },
  ADD_WORKLOG_INVALID (state, internalId) {
    let index = state.invalid.findIndex(item => item === internalId);
    if (index < 0) {
      state.invalid.push(internalId);
    }
  },
  REMOVE_WORKLOG (state, worklog) {
    let store = this,
        index = state.logs.findIndex(item => item.internalId === worklog.internalId);

    if (index > -1) {
      let internalId = state.logs[index].internalId;
      store.commit('REMOVE_WORKLOG_INVALID', internalId);

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
