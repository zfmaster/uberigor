<template>
  <v-navigation-drawer
      dark
      mini-variant
      stateless
      app
      value="true"
  >
    <v-list
        two-line
    >
      <v-list-tile
          v-for="item in items"
          :key="item.title"
          :to="{ name: item.link }"
      >

        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile-content>

      </v-list-tile>

      <v-list-tile
          avatar
          class="vertical-end"
          v-if="user"
      >
        <v-list-tile-avatar>
          <img
              :src="user['avatarUrls']['48x48']"
          >
        </v-list-tile-avatar>
      </v-list-tile>

    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: 'navigation',
    data() {
      return {
        drawer: true,
        items: [{
          title: 'Home',
          icon: 'dashboard',
          link: 'main-page'
        }, {
          title: 'Board',
          icon: 'playlist_play',
          link: 'board-page'
        }, {
          title: 'Logs',
          icon: 'av_timer',
          link: 'logs-page'
        }],
        mini: true,
        right: null
      }
    },
    computed: {
      user() {
        return this.$store.state.User.user
      }
    }
  }
</script>

<style>
  .vertical-end {
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>
