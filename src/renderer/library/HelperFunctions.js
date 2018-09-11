let shell = require('electron').shell;

export const openLink = function (link) {
  shell.openExternal(link);
};

export const accessNested = function (obj, is, value) {
  if (typeof is === 'string')
    return accessNested(obj, is.split('.'), value);
  else if (is.length === 1 && value !== undefined)
    return obj[is[0]] = value;
  else if (is.length === 0)
    return obj;
  else
    return accessNested(obj[is[0]], is.slice(1), value);
};

export const convertTime = function (seconds) {
  let hours = Math.trunc(seconds / 60 / 60),
    minutes = Math.ceil((seconds - hours * 60 * 60) / 60);

  return (hours ? hours + 'h ' : '') + minutes + 'm';
};

export const parseTime = function (time) {
  let pattern = /^(\d{1,2}[h,H]\s?)?(\d{1,2}[m,M])?$/;
  let matches = time.match(pattern);

  let hours = matches[1] !== undefined ? matches[1].replace('h', '') : 0;
  let minutes = matches[2] !== undefined ?  matches[2].replace('m', '') : 0;
  return (hours * 60 * 60) + (minutes * 60);
};

export const getCurrentDate = function () {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!

  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  let formatedDate = yyyy + '-' + mm + '-' + dd;
  return formatedDate;
};