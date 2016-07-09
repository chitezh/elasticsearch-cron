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
ElasticsearchCron.prototype.search = function(query, time, size, index, type) {
  let self = this;
  try {
    let searchJob = new CronJob({
      cronTime: time,
      onTick: function() {
        let currentDate = new Date();
        let lastRun = Core.getTimeRange(time, currentDate);

        //query body
        const body = {
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
        };

        const searchObject = {
          size: size || 1000,
          body
        };

        if (index) _.extend(searchObject, { index: index });
        if (type) _.extend(searchObject, { type: type });

        self.esFac.search(searchObject)
          .then((data) => {
            self.myEmitter.emit('run', data);
          })
          .catch((err) => {
            self.myEmitter.emit('error', err);
          })
      },
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
