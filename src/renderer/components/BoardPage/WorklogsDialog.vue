<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn flat dark v-on="on">Create Worklogs
        <v-icon right dark>av_timer</v-icon>
      </v-btn>
    </template>
    <v-card
        dark
    >
      <v-card-title class="headline">Worklogs data</v-card-title>
      <v-card-text>
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
        >
          <v-select
              :items="hashtagItems"
              :rules="hashtagRules"
              v-model="hashtag"
              label="Hashtag"
          ></v-select>
          <v-menu
              :close-on-content-click="false"
              v-model="worklogsMenu"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
          >
            <v-text-field
                slot="activator"
                label="Date"
                v-model="date"
                :rules="dateRules"
                persistent-hint
                prepend-icon="event"
                readonly
            ></v-text-field>
            <div v-if="worklogsMenu">
              <v-date-picker v-model="date" no-title @input="worklogsMenu = false"></v-date-picker>
            </div>
          </v-menu>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="darken-1"
            @click.native="dialog = false"
        >Cancel
        </v-btn>
        <v-btn
            color="green darken-1"
            :disabled="!valid"
            @click="createWorklogs"
        >Proceed
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";
  import * as HelperFunctions from '../../library/HelperFunctions';
  import router from '../../router'

  export default {
    name: 'worklogs-dialog',
    data() {
      return {
        valid: true,
        dialog: false,
        hashtagItems: [
          '#REV', '#SP', '#GROOM'
        ],
        hashtag: null,
        hashtagRules: [
          v => !!v || 'Hashtag is required'
        ],
        date: HelperFunctions.getCurrentDate(),
        dateRules: [
          v => !!v || 'Date is required'
        ],
        worklogsMenu: false,
      }
    },
    methods: {
      createWorklogs: function () {
        if (this.$refs.form.validate()) {
          WorklogsService.convertMeasurementsToWorklogs({
            date: this.date,
            comment: this.hashtag
          });
          router.push({path: 'logs'});
          this.dialog = false;
        }
      },
    }
  }
</script>

