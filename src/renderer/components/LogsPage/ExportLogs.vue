<template>
    <v-btn
        flat
        :disabled="disabled"
        @click="exportLogs"
    >
      Export
    </v-btn>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";

  export default {
    name: 'export-logs',
    data() {
      return {
      }
    },
    computed: {
      disabled() {
        return (this.$store.state.Worklogs.logs.length < 1) || !WorklogsService.validateWorklogs();
      }
    },
    methods: {
      exportLogs() {
        WorklogsService.exportWorklogs();
      },
    }
  }
</script>

