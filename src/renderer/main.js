import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import * as JiraService from './library/JiraService';
import * as AppConfig from './library/AppConfig';

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

const Mousetrap = require('mousetrap');

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(Vuetify);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  Vuetify,
  template: '<App/>'
}).$mount('#app');

JiraService.init();
AppConfig.init();

Mousetrap.bind(['command+f', 'ctrl+f'], function() {
  console.log('search');
});
