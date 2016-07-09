'use strict';
const _ = require('underscore'),
  es = require('elasticsearch'),
  Core = require('./lib/utils'),
  CronJob = require('cron').CronJob,
  EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

class ElasticsearchCron {
  constructor(config) {
    this.esFac = es.Client(config);
    this.myEmitter = new MyEmitter();
  }
}

/**
 *Implement cron search
 */
ElasticsearchCron.prototype.search = function(query, time, autoIncrement) {
  let self = this;
  try {
    let searchJob = new CronJob({
      cronTime: time,
      onTick: function() {
        let currentDate = new Date();
        let lastRun = Core.getTimeRange(time, currentDate);

        console.log("currentTime", currentDate.toISOString())
        console.log("lastRun", lastRun)
        console.log("____=======================================___\n")

        self.esFac.search({
          size: 1000,
          body: {
            query: {
              "bool": {
                "must": [
                  query, {
                    "range": {
                      "@timestamp": {
                        "gte": lastRun,
                        "lte": currentDate
                      }
                    }
                  }
                ]
              }
            }
          }
        }).then((data) => {
          //emit results
          self.myEmitter.emit('run', data);
        })
      },
      //start immediately
      start: true
    });

  } catch (ex) {
    self.myEmitter.emit('error', ex);
  }
  return self.myEmitter;
}

/**
* @Todo
* Extend more APIs
*/

module.exports = ElasticsearchCron;
