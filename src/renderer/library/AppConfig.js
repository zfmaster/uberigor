import {ipcRenderer} from "electron";
import store from "../store";
import * as JiraService from "./JiraService";

export const init = function () {
  initListeners();
};

export const initListeners = function () {
  ipcRenderer.on('app-get-config-response', (event, result) => {
    store.commit('SET_APP_CONFIG', result);
    if (result.lastBoard !== undefined && result.lastBoard !== null) {
      JiraService.loadIssues(result.lastBoard);
    }
  });
};

export const setConfig = function (configName, value) {
  store.commit('SET_APP_CONFIG_VALUE', {
    name: configName,
    value: value
  });
  ipcRenderer.send('app-set-config', {
    configName,
    value
  })
};