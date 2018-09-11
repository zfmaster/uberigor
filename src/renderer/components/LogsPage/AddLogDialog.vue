<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <v-btn
        fab
        dark
        color="pink darken-1"
        slot="activator"
        fixed
        bottom
        right
    >
      <v-icon>add</v-icon>
    </v-btn>

    <v-card
        dark
    >
      <v-card-title class="headline">Enter task number</v-card-title>
      <v-card-text>
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
        >
          <v-text-field
              v-model="task"
              :rules="[() => !!task || 'This field is required']"
              label="Task Number"
              required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="darken-1"
            @click.native="dialog = false"
        >Cancel</v-btn>
        <v-btn
            color="green darken-1"
            :disabled="!valid"
            @click="addLog"
        >Proceed</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as WorklogsService from "../../library/WorklogsService";

  export default {
    name: 'add-log-dialog',
    data () {
      return {
        dialog: false,
        valid: true,
        task: null
      }
    },
    methods: {
      addLog() {
        if (this.$refs.form.validate()) {
          WorklogsService.createWorklog({
            task: this.task
          });
          this.dialog = false;
          this.task = null;
        }
      },
    }
  }
</script>

