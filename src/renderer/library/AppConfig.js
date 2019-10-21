import store from "../store";
import * as JiraService from "./JiraService";

const {app} = require('electron').remote;

let path = require('path'),
  fs = require('fs');

let configFile = path.join(app.getPath('userData'), 'config.json');
let config = {};
let eventEmitter;

export const init = function (emitter) {
  eventEmitter = emitter;
  try {
    let configContent = fs.readFileSync(configFile, "utf8");
    if (configContent.length) {
      config = JSON.parse(configContent);

      store.commit('SET_APP_CONFIG', config);
    }

  } catch (ex) {
    console.warn(ex);
  }

  eventEmitter.on('app-get-config', () => {
    eventEmitter.emit('app-get-config-response', getConfig());
  });
};

export const getConfig = function () {
  return config;
};

export const getConfigValue = function (configName) {
  return config[configName];
};

export const setConfigFile = function (configName, value) {
  config[configName] = value;
  try {
    fs.writeFile(configFile, JSON.stringify(config), {
      flag: 'w+'
    }, (error) => {});
  } catch (ex) {
    console.warn(ex);
  }
};

export const setConfig = function (configName, value) {
  store.commit('SET_APP_CONFIG_VALUE', {
    name: configName,
    value: value
  });

  setConfigFile(configName, value);
};






