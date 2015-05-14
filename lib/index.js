var kue = require('coyno-kue');
var log = require('coyno-log');
var mongo = require('coyno-mongo');
var TransactionFetcher = require('./fetcher');

require('../config');


function loadAddresses(addresses, userId, callback) {
  return mongo.db.collection('bitcoinaddresses').find({ address: {$in : addresses }, userId: userId }).toArray(callback);
}

mongo.start(function(err) {
  if (err) {
    throw err;
  }
  kue.jobs.process('addresses.fetchTransactions', function(job, done){
    if (!job.data.addresses) {
      return done('No addresses to work on.');
    }
    else if (!job.data.userId) {
      return done('Invalid User Id');
    }

    var transactionFetcher = new TransactionFetcher({userId: job.data.userId});

    log.info({numAddresses: job.data.addresses.length}, 'Fetching transactions ');
    loadAddresses(job.data.addresses, job.data.userId, function(err, addresses) {
      if (err) {
        log.warn('Mongo Error');
        return done(err);
      }
      else if (addresses.length < 1) {
        log.warn('No addresses found');
        return done('No addresses found.');
      }
      transactionFetcher.fetch(addresses, done);
    });
  });
});
