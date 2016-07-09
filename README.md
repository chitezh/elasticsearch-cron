# elasticsearch-cron

## Description
An event driven utitily for scheduling elasticsearch jobs extending the capabilities of the official elasticseach javascript client. 
Ever wanted to query elastic search periodically and perform a task with the result or want to watch a particular keyword but considers elaticwatch too complex and expensive

[![Coverage Status](https://img.shields.io/badge/elasticsearch--cron-passing-brightgreen.svg?style=flat-square)]
[![Dependencies up to date](http://img.shields.io/david/elastic/elasticsearch-js.svg?style=flat-square)]

## Features

 - Generalized, pluggable architecture.
 - Configurable, automatic discovery of cluster nodes
 - Persistent, Keep-Alive connections
 - Load balancing (with pluggable selection strategy) across all available nodes.
 - Takes all native client config

## Use in Node.js

```
npm install elasticsearch-cron
```

[![NPM Stats](https://nodei.co/npm/elasticsearch-cron.png?downloads=true)](https://npmjs.org/package/elasticsearch-cron)


## Supported Elasticsearch Versions

![Supporting Elasticsearch Version 0.90 to 5.0-prerelease](https://img.shields.io/badge/elasticsearch-0.90%20to%205.0--prerelease-green.svg?style=flat-square)

Elasticsearch-cron provides support for, and is regularly tested against, Elasticsearch releases 0.90.12 and greater. We also test against the latest changes in several branches in the Elasticsearch repository. To tell the client which version of Elastisearch you are using, and therefore the API it should provide, set the `apiVersion` config param. [More info](http://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html#config-options)

## Examples

Create a client instance
```js
const EsCron = require('elasticsearch-cron');
const client = new EsCron({
  host: 'localhost:9200',
  log: 'trace'
});
```
Scheduling a search

syntax
```
let search = client.search(query,
  cron-pattern,
  size(defaults to 1000),
  index(optional),
  type(optional))
```
example. query every 30seconds
```js
let search = client.search({ 
  "match":
    { 
      "log": "BitunnelRouteException"  
    }
  },
  '*/30 * * * * *');
````
This task intelligently runs in the background varying the range of queries in each run. See internal query structure
```js
{
  query: {
    "bool": {
      "must": [
        { 
          "match": {
            "log": "BitunnelRouteException" 
          }
        },
        {
          "range": {
            "@timestamp": {
              "gte": lastRun,
              "lte": currentTime
            }
          }
        }
      ]
    }
  }
}
```
It will query elasticsearch for all changes since the last run date. Eg.
If you set a cron task to run at `12am` everyday. The last run for a job on `12am monday` will be `12am sunday`. That way, all the changes in the 24-hour is captured.


Parse result on each run
```js
search.on('run', (data) => {
  console.log(`Came back with the result ${data}`);
});
```

Catch errors
```js
search.on('error', (ex) => {
  console.log(`An error occured, ${ex}`);
})
``` 

## Supported cron format
```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```
Supports mixed use of ranges and range increments (L, W and # characters are not supported currently). See tests for examples.
See [crontab](https://crontab.org) for more information

## Contributing

We accept contributions via Pull Requests on [Github](https://github.com/chitezh/elasticsearch-cron).


### Pull Requests

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **Consider our release cycle** - We try to follow [SemVer v2.0.0](http://semver.org/). Randomly breaking public APIs is not an option.

- **Create feature branches** - Don't ask us to pull from your master branch.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.


## Issues

Check issues for current issues.


## Credits

- [Kingsley Ochu](https://github.com/chitezh)


## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.