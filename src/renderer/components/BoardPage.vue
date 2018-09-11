<template>
  <div class="scrollable-container">
    <v-toolbar
        dark
        color="teal"
    >
      <v-autocomplete
          :loading="loading"
          :items="boards"
          item-value="id"
          item-text="name"
          :value="select"
          v-on:change="change"
          class="mx-3"
          flat
          hide-no-data
          hide-details
          label="Please, select board"
          solo
      ></v-autocomplete>
      <v-spacer></v-spacer>
      <worklogs-dialog></worklogs-dialog>
    </v-toolbar>

    <div
        v-on:scroll.passive="handleScroll"
        class="scrollable-content"
    >
      <v-list
          two-line
      >
        <template v-for="(item, index) in items">
          <v-list-tile
              :key="item.id"
              avatar
              :class="getItemColor(item)"
          >
            <v-list-tile-avatar>
              <img :src="item.fields.issuetype.iconUrl">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title v-html="item.key"></v-list-tile-title>
              <v-list-tile-sub-title v-html="item.fields.summary"></v-list-tile-sub-title>
            </v-list-tile-content>


            <v-list-tile-action>
              <div
                  v-if="currentlyComputed(item.key)"
              >
                {{currentValue(item.key)}}
              </div>
              <v-list-tile-action-text
                  v-else-if="issueTime(item.key)"
              >
                {{issueTime(item.key)}}
              </v-list-tile-action-text>
            </v-list-tile-action>

            <v-list-tile-action
                v-if="!currentlyComputed(item.key)"
            >
              <v-btn
                  icon
                  ripple
                  @click="startComputing(item.key)"
              >
                <v-icon
                    color="grey lighten-1"
                    x-large
                >play_arrow
                </v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-list-tile-action
                v-if="currentlyComputed(item.key)"
            >
              <v-btn
                  icon
                  ripple
                  @click="startComputing(null)"
              >
                <v-icon
                    color="grey lighten-1"
                    x-large
                >stop
                </v-icon>
              </v-btn>
            </v-list-tile-action>

          </v-list-tile>

          <v-divider></v-divider>
        </template>
        <div
            class="text-xs-center"
            v-if="issuesLoading"
        >
          <v-progress-circular
              indeterminate
              color="primary"
          ></v-progress-circular>
        </div>
      </v-list>
    </div>
  </div>
</template>

<script>
  import * as JiraService from "../library/JiraService";
  import * as AppConfig from "../library/AppConfig";
  import WorklogsDialog from "./BoardPage/WorklogsDialog";
  import * as HelperFunctions from "../library/HelperFunctions";

  export default {
    name: 'board-page',
    components: {WorklogsDialog},
    data() {
      return {
        search: null,
        currentCounterValue: 0
      }
    },
    computed: {
      select() {
        return this.$store.state.AppConfig.config.lastBoard;
      },
      items() {
        return this.$store.state.Board.issues
      },
      boards() {
        return this.$store.state.Board.boards
      },
      loading() {
        return this.$store.state.Board.boardsLoading;
      },
      issuesLoading() {
        return this.$store.state.Board.issuesAreLoading;
      }
    },
    methods: {
      change: function (value) {
        JiraService.loadIssues(value);
        AppConfig.setConfig('lastBoard', value);
      },
      getItemColor: function(item) {
        return item.isSprint ? 'grey darken-4' : '';
      },
      issueTime: function (index) {
        if (this.$store.state.Board.times[index] !== undefined) {
          return HelperFunctions.convertTime(this.$store.state.Board.times[index]);
        }
        return null;
      },
      currentlyComputed: function (index) {
        return this.$store.state.Board.currentlyComputed === index;
      },
      currentValue: function (index) {
        let value = this.currentCounterValue;
        if (this.$store.state.Board.times[index] != null) {
          value += this.$store.state.Board.times[index];
        }

        let minutes = Math.floor(value / 60),
          seconds = value - minutes * 60;

        return (minutes ? minutes + 'm ' : '') + seconds + 's';
      },
      startComputing: function (index) {
        let self = this;

        if (this.$store.state.Board.currentlyComputed !== null) {
          this.$store.commit('UPDATE_COMPUTING', {
            index: this.$store.state.Board.currentlyComputed,
            value: self.currentCounterValue
          });
        }

        self.currentCounterValue = 0;
        if (this.$store.state.Board.intervalLink !== null) {
          window.clearInterval(this.$store.state.Board.intervalLink);
        }

        if (index !== null) {
          let intervalLink = window.setInterval(() => {
            self.currentCounterValue += 1;
          }, 1000);
          this.$store.commit('SET_INTERVAL_LINK', intervalLink);
        }
        this.$store.commit('START_COMPUTING', index);

      },
      handleScroll(event) {
        let elem = event.target;
        if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight - 100)) {
          if (!this.$store.state.Board.issuesAreLoading && !this.$store.state.Board.allIssuesAreLoaded) {
            JiraService.loadIssues();
          }
        }
      }
    }
  }
</script>

<style>

</style>
