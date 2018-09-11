const state = {
  config: {}
};

const mutations = {
  SET_APP_CONFIG (state, config) {
    state.config = config;
  },
  SET_APP_CONFIG_VALUE (state, args) {
    state.config[args.name] = args.value;
  }
};

const actions = {

};

export default {
  state,
  mutations,
  actions
}
