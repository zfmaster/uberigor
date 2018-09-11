<template>
    <v-btn
        flat
        @click="importLogs"
    >
      Import
    </v-btn>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";

  export default {
    name: 'import-logs',
    data() {
      return {
      }
    },
    computed: {

    },
    methods: {
      importLogs() {
        WorklogsService.importWorklogs();
      },
    }
  }
</script>

