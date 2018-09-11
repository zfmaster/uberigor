import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'main-page',
      component: require('@/components/MainPage').default
    },
    {
      path: '/logs',
      name: 'logs-page',
      component: require('@/components/LogsPage').default
    },
    {
      path: '/board',
      name: 'board-page',
      component: require('@/components/BoardPage').default
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})
