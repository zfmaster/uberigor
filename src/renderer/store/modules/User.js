const state = {
  user: null,
  loading: true,
  credentialsStatus: ''
};

const mutations = {
  SET_USER (state, user) {
    state.user = user;
  },
  SET_LOADING (state, loading) {
    state.loading = loading;
  },
  SET_CREDENTIALS_STATUS (state, status) {
    state.credentialsStatus = status;
  }
};

const actions = {

};

export default {
  state,
  mutations,
  actions
}
