<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn flat
             :disabled="disabled"
             @click="exportLogs"
             v-on="on"
      >
        Export
        <v-icon right color="orange darken-2" v-if="iconVisible">warning</v-icon>
      </v-btn>
    </template>
    <span>Data is in wrong state, export file could be broken</span>
  </v-tooltip>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";

  export default {
    name: 'export-logs',
    data() {
      return {}
    },
    computed: {
      iconVisible() {
        return !WorklogsService.validateWorklogs();
      },
      disabled() {
        return this.$store.state.Worklogs.logs.length < 1;
      }
    },
    methods: {
      exportLogs() {
        WorklogsService.exportWorklogs();
      },
    }
  }
</script>

