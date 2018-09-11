const {ipcMain, app} = require('electron');

let path = require('path'),
    fs = require('fs');

let configFile = path.join(app.getPath('userData'), 'config.json');
let config = {};

export const init = function() {
  try {
    let configContent = fs.readFileSync(configFile, "utf8");
    if (configContent.length) {
      config = JSON.parse(configContent);
    }

  } catch(ex) {
    console.warn(ex);
  }
};

export const getConfig = function () {
  return config;
};

export const getConfigValue = function(configName) {
  return config[configName];
};

export const setConfigFile = function(configName, value) {
  config[configName] = value;
  try {
    fs.writeFile(configFile, JSON.stringify(config), {
      flag: 'w+'
    });
  } catch(ex) {
    console.warn(ex);
  }
};

ipcMain.on('app-set-config', (event, arg) => {
  console.log('app-set-config', arg);
  setConfigFile(arg.configName, arg.value);
});

ipcMain.on('app-get-config', (event) => {
  event.sender.send('app-get-config-response', getConfig());
});



