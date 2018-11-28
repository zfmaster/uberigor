<template>
    <v-btn
        flat
        :disabled="disabled"
        @click="dialog = true"
    >
      Push {{ calculateTotal }}
      <v-dialog v-model="dialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Push worklogs now?</v-card-title>
          <v-card-text>All pushed worklogs will be removed from list. You may want to export them first.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="darken-1" flat @click.native="dialog = false">Cancel</v-btn>
            <v-btn color="green darken-1" flat @click="pushLogs">Push</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-btn>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";
  import * as JiraService from '../../library/JiraService';

  export default {
    name: 'push-logs',
    data() {
      return {
        dialog: false
      }
    },
    computed: {
      disabled() {
        return (this.$store.state.Worklogs.logs.length < 1) || !WorklogsService.validateWorklogs();
      },
      calculateTotal() {
        return WorklogsService.calculateTotal();
      }
    },
    methods: {
      pushLogs() {
        JiraService.pushWorklogs();
        this.dialog = false;
      },
    }
  }
</script>

