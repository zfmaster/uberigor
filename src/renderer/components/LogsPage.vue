<template>
  <div class="scrollable-container">
    <v-toolbar
        dark
        color="light-blue darken-3"
    >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <import-logs></import-logs>
        <export-logs></export-logs>
        <push-logs></push-logs>
      </v-toolbar-items>
    </v-toolbar>
    <div class="scrollable-content">
      <v-data-table
          :items="logs"
          class="elevation-1"
          hide-actions
          hide-headers
      >
        <template
            slot="items"
            slot-scope="props"
        >
          <td style="width: 20%">{{ props.item.issueKey }}</td>
          <td class="text-xs-right" style="width: 43%">
            <v-edit-dialog
                :return-value.sync="props.item.worklog.comment"
                large
                lazy
                @save="save"
                @cancel="cancel"
                @open="open"
            >
              <div
                  class="grey--text text--darken-1"
                  v-if="!props.item.worklog.comment"
              >
                Worklog description
              </div>
              {{ props.item.worklog.comment }}
              <v-text-field
                  slot="input"
                  :value="props.item.worklog.comment"
                  @change="update(props, $event, 'worklog.comment')"
                  single-line
              ></v-text-field>
            </v-edit-dialog>
          </td>
          <td class="text-xs-right"  style="width: 10%">
            <v-edit-dialog
                :value="convertTime(props.item.worklog.timeSpentSeconds)"
                large
                lazy
                @save="save"
                @cancel="cancel"
                @open="open"
            >
              <div>
                <v-icon
                    dark
                    class="grey--text text--darken-1"
                    v-if="!props.item.worklog.timeSpentSeconds"
                >av_timer</v-icon>
                {{ convertTime(props.item.worklog.timeSpentSeconds) }}
              </div>
              <v-text-field
                  slot="input"
                  :value="convertTime(props.item.worklog.timeSpentSeconds)"
                  @change="update(props, $event, 'worklog.timeSpentSeconds')"
                  :rules="[worklogTime]"
                  single-line
                  autofocus
              ></v-text-field>
            </v-edit-dialog>
          </td>
          <td class="text-xs-right" style="width: 15%">
            <v-menu
                :close-on-content-click="false"
                v-model="dateMenu[props.item.issueKey]"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                full-width
                max-width="290px"
                min-width="290px"
            >
              <div
                  slot="activator"
              >{{props.item.worklog.started}}
              </div>
              <v-date-picker
                  :value="props.item.worklog.started"
                  no-title
                  @change="update(props, $event, 'worklog.started')"
                  @input="dateMenu[props.item.issueKey] = false"
              ></v-date-picker>
            </v-menu>
          </td>
          <td class="justify-left layout px-0">
            <v-btn icon>
              <v-icon
                  small
                  @click="deleteItem(props)"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <add-log-dialog></add-log-dialog>
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <v-btn flat @click="snack = false">Close</v-btn>
    </v-snackbar>
  </div>

</template>

<script>
  import AddLogDialog from './LogsPage/AddLogDialog';
  import PushLogs from './LogsPage/PushLogs';
  import ExportLogs from './LogsPage/ExportLogs';
  import ImportLogs from './LogsPage/ImportLogs';
  import * as HelperFunctions from "../library/HelperFunctions";

  export default {
    name: 'logs-page',
    components: { AddLogDialog, PushLogs, ExportLogs, ImportLogs },
    data() {
      return {
        snack: false,
        snackColor: '',
        snackText: '',
        max25chars: (v) => v.length <= 25 || 'Input too long!',
        dateMenu: {},
        pagination: {},
      }
    },
    computed: {
      logs: {
        get() {
          return this.$store.state.Worklogs.logs
        },
      }
    },
    methods: {
      convertTime(seconds) {
        return HelperFunctions.convertTime(seconds);
      },
      deleteItem(props) {
        this.$store.commit('REMOVE_WORKLOG', props.item);
      },
      update(props, value, field) {
        if (field === 'worklog.timeSpentSeconds') {
          value = HelperFunctions.parseTime(value);
        }
        this.$store.commit('UPDATE_WORKLOG_FIELD', {
          index: props.index,
          value,
          field
        });
      },
      worklogTime(value) {
        let match = /^(\d{1,2}[h,H]\s?)?\d{1,2}[m,M]$/.test(value);
        if (match) {
          return true;
        }
        return 'Format [##h ##m] or [##m]';
      },
      save() {
        return false;
        this.snack = true;
        this.snackColor = 'success';
        this.snackText = 'Data saved';
      },
      cancel() {

      },
      open() {

      },
      close() {
        console.log('Dialog closed')
      }
    }
  }
</script>

<style>

</style>
