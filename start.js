var TransactionFetcher = require('./index.js');
var log = require('coyno-log').child({component: 'Transaction Fetcher Start Script'});

var redisUrl = process.env.REDIS_URL;
var mongoUrl = process.env.MONGO_URL;

if (!redisUrl || !mongoUrl) {
  throw new Error('Need to set MONGO_URL and REDIS_URL as env variables.');
}

var transactionFetcher = new TransactionFetcher(mongoUrl, redisUrl);
transactionFetcher.start(function (err) {
  if (err) {
    log.error(err);
  }
});
