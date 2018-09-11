<template>
  <v-dialog
      v-model="dialog"
      fullscreen
      persistent
      dark
  >
    <v-card
        v-if="loading"
        dark
        height="100%"
    >
      <v-container fill-height>
        <v-layout align-center justify-center>
          <v-card-text>
            <div class="text-xs-center">
              <v-progress-circular
                  :size="70"
                  :width="7"
                  color="white"
                  indeterminate
              ></v-progress-circular>
            </div>
          </v-card-text>
        </v-layout>
      </v-container>
    </v-card>
    <v-card
        v-else
        dark
    >
      <v-card-title
          primary-title
          class="headline"
      >
        Welcome to ÜberIgor app!
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs5>
              <p
                  v-if="wrongCredentials"
                  class="error"
              >
                You provided wrong credentials, please check them again
              </p>
              <v-text-field v-model="host" label="Host" required></v-text-field>
              <v-text-field v-model="email" label="Email" required></v-text-field>
              <v-text-field v-model="token" label="Token" type="password" required></v-text-field>
              <v-btn
                  color="green darken-1"
                  flat
                  @click="authenticate"
              >
                Authenticate
              </v-btn>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs6>
              <p class="subheading">ÜberIgor will help you to be more productive during the meetings and save a lot of
                time
                adding worklogs.
              </p>

              <p
                  class="title pt-4"
              >
                In order to start, you should provide some credentials:
              </p>
              <ul>
                <li><span class="font-weight-bold">host</span> is your main Jira Cloud url, it should look like <span
                    class="font-italic">*.atlassian.net</span></li>
                <li class="font-weight-bold">email</li>
                <li><span class="font-weight-bold">token</span> should be generated on
                  <a
                      @click="openLink('https://id.atlassian.com/manage/api-tokens')"
                      href="#"
                  >Atlassian ID</a> page
                </li>
              </ul>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import {authenticate} from "../library/JiraService";
  import * as HelperFunctions from "../library/HelperFunctions";

  export default {
    name: "auth-dialog",
    data: function () {
      return {
        email: "",
        token: "",
        host: ""
      }
    },
    methods: {
      authenticate() {
        if (this.email.length < 2 || this.token.length < 2 || this.host.length < 2) {
          event.preventDefault();
        } else {
          authenticate(this.email, this.token, this.host);
        }
      },
      openLink(link) {
        HelperFunctions.openLink(link);
      }
    },
    computed: {
      loading() {
        return this.$store.state.User.loading;
      },
      dialog() {
        return this.$store.state.User.user == null
      },
      wrongCredentials() {
        return this.$store.state.User.credentialsStatus === 'wrongCredentials';
      }
    }
  }
</script>

<style scoped>

</style>