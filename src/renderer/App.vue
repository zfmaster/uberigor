<template>
  <div id="app">
    <auth-dialog></auth-dialog>
    <v-app id="inspire" dark>
      <navigation></navigation>
      <v-content>
        <router-view></router-view>
      </v-content>
    </v-app>
  </div>
</template>

<script>
  import Navigation from './components/Navigation'
  import AuthDialog from './components/AuthDialog'

  export default {
    name: 'tempohelfer',
    components: {Navigation, AuthDialog},
    comments: { Navigation },
    data: () => ({
      drawer: true
    }),
    props: {
      source: String
    }
  }
</script>

<style>
  .scrollable-content {
    flex-grow: 1;
    overflow-x: auto;
  }

  .scrollable-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
