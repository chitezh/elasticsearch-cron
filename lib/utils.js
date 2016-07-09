"use strict";

let cronParser = require('cron-parser'),
  moment = require("moment");

exports.getTimeRange = (cronTime, currentDate) => {
  let options = {
    currentDate,
    iterator: true
  };
  try {
    let interval = cronParser.parseExpression(cronTime, options)
    let next = interval.next().value.toISOString();

    return lastRun(currentDate, next);
  } catch (err) {
    console.log('Error: ' + err.message);
  }
}

function lastRun(currentTime, nextTime) {

  currentTime = currentTime.toISOString();
  let _current = moment(currentTime);
  let _next = moment(nextTime);

  let duration = _next.diff(currentTime);
  let lastRun = _current.subtract(duration);

  return lastRun.toDate();
}

