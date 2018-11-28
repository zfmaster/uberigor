import store from './../store'

const {dialog} = require('electron').remote;
import * as HelperFunctions from './HelperFunctions';

let fs = require('fs');

export const exportWorklogs = function () {
  let worklogs = store.state.Worklogs.logs;
  if (worklogs.length) {
    let name = 'worklog',
        content = JSON.stringify(worklogs);

    dialog.showSaveDialog({
      title: name,
      defaultPath: '~/' + name + '.json'
    }, function (fileName) {
      if (fileName === undefined) {
        console.log("You didn't save the file");
        return;
      }

      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, content, (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message)
        }

        alert("The file has been succesfully saved");
      });
    });
  }
};

export const importWorklogs = function () {
  dialog.showOpenDialog({
    filters: [
      {name: 'JSON Files', extensions: ['json']},
      {name: 'All Files', extensions: ['*']}
    ]
  }, (fileNames) => {
    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
      console.log("No file selected");
      return;
    }
    fs.readFile(fileNames[0], 'utf-8', (err, data) => {
      if(err){
        alert("An error ocurred reading the file :" + err.message);
        return;
      }

      let worklogs = JSON.parse(data);
      if (worklogs == null) {
        alert("The file you specified is wrong");
      }
      else {
        store.commit('REMOVE_ALL_WORKLOGS');
        store.commit('ADD_LOGS', worklogs);
      }
    });
  });
};


export const convertMeasurementsToWorklogs = function (args) {
  let times = store.state.Board.times;
  let worklogs = [];

  Object.keys(times).map(function (key, index) {
    let spentTime = Math.ceil(times[key] / 60) * 60;

    worklogs.push({
      issueKey: key,
      worklog: {
        started: args.date,
        timeSpentSeconds: spentTime,
        comment: args.comment
      }
    });
  });

  store.commit('ADD_LOGS', worklogs);
};

export const validateWorklogs = function () {
  let worklogs = store.state.Worklogs.logs;
  worklogs.map(function (value, key) {
    validateWorklog(value);
  });

  return store.state.Worklogs.invalid.length < 1;
};

export const calculateTotal = function () {
  let worklogs = store.state.Worklogs.logs,
      total = 0;
  worklogs.map(function (value, key) {
    total += value.worklog.timeSpentSeconds;
  });

  return total > 0 ? HelperFunctions.convertTime(total) : '';
};

export const validateWorklog = function (worklog) {
  let valid = isValid(worklog);
  if (valid) {
    store.commit('SET_WORKLOG_VALID', worklog.issueKey);
  }
  else {
    store.commit('SET_WORKLOG_INVALID', worklog.issueKey);
  }
};

export const createWorklog = function (args) {
  let worklog = {
    issueKey: args.task,
    worklog: {
      started: HelperFunctions.getCurrentDate(),
      timeSpentSeconds: null,
      comment: null
    }
  };

  store.commit('ADD_LOGS', [worklog]);
};

const isValid = function (worklog) {
  if (worklog.issueKey.length < 3) {
    return false;
  }
  if (worklog.worklog.started < 8) {
    return false;
  }
  if (worklog.worklog.timeSpentSeconds < 60) {
    return false;
  }
  if (worklog.worklog.comment === null || worklog.worklog.comment.length < 3) {
    return false;
  }
  return true;
};
