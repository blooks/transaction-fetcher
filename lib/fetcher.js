
'use strict';

require('../config');
var _ = require('lodash');
var async = require('async');
var log = require('coyno-log').child({component: 'Wallet'});
var randomId = require('coyno-util').meteor.randomId;
var mongo = require('coyno-mongo');

var Chain = require('coyno-chain');

var TransactionFetcher = function (doc) {
  if (!(this instanceof TransactionFetcher)) {
    return new TransactionFetcher(doc);
  }
  return _.extend(this, doc);
};

var dataBaseData = function() {
  var now = new Date();
  return {
    _id: randomId(),
    createdAt: now,
    updatedAt: now,
    hidden: true
  };
};

TransactionFetcher.prototype.processAddresses = function (addresses, callback) {
  var chain = new Chain(this.userId);
  var self = this;
  var addressStrings = _.pluck(addresses, 'address');
  log.debug({'Number of addresses': addresses.length}, 'Queryin chain for addresses');
  chain.fetchTransactionsFromAddresses(addressStrings, function (err, transactions) {
    if (err) {
      log.error(err);
      return callback(err);
    }
    if (transactions.length > 0) {
      transactions = _.map(transactions, function(transaction) {
        return _.extend(transaction, dataBaseData());
      });
      transactions = _.uniq(transactions, function(transaction) {
        return transaction.foreignId;
      });
      var bulkMongo = mongo.db.collection('transfers').initializeUnorderedBulkOp();
      async.map(transactions,
        function (transaction, cb) {
          bulkMongo.insert(transaction);
          cb();
        },
        function (err) {
          if (err) {
            return callback(err);
          }
          bulkMongo.execute(function(err) {
           if (err) {
             if (err.code === 11000) {
               log.warn('Attempt to add existing transfers. Continuing.');
             } else {
               return callback(err);
             }
           }
            var addressStrings = _.pluck(addresses, 'address');
           return callback();
          });
        });
    } else {
      return callback();
    }
  }.bind(this));
};

TransactionFetcher.prototype.fetch = function (addresses, callback) {
  this.processAddresses(addresses, callback);
};

module.exports = TransactionFetcher;
