'use strict'

var _ = require('lodash')
var async = require('async')
var log = require('@blooks/log')
var Random = require('meteor-random')
var Chain = require('@blooks/blockchain')

var TransactionFetcher = function (userId, mongodb) {
  this.userId = userId
  this.db = mongodb
}

var dataBaseData = function () {
  var now = new Date()
  return {
    _id: Random.id(),
    createdAt: now,
    updatedAt: now,
    hidden: true
  }
}

TransactionFetcher.prototype.processAddresses = function (addresses, callback) {
  var chain = new Chain(this.userId)
  var self = this
  var addressStrings = _.map(addresses, 'address')
  log.debug({'Number of addresses': addresses.length}, 'Querying chain for addresses')
  chain.fetchTransactionsFromAddresses(addressStrings, function (err, transactions) {
    if (err) {
      log.error(err)
      return callback(err)
    }
    if (transactions.length > 0) {
      transactions = _.map(transactions, function (transaction) {
        return _.extend(transaction, dataBaseData())
      })
      transactions = _.uniq(transactions, function (transaction) {
        return transaction.foreignId
      })
      var bulkMongo = self.db.collection('transfers').initializeUnorderedBulkOp()
      async.map(transactions,
        function (transaction, cb) {
          bulkMongo.insert(transaction)
          cb()
        },
        function (err) {
          if (err) {
            return callback(err)
          }
          bulkMongo.execute(function (err) {
            if (err) {
              if (err.code === 11000) {
                log.warn('Attempt to add existing transfers. Continuing.')
              } else {
                return callback(err)
              }
            }
            var addressStrings = _.map(addresses, 'address')
            return callback()
          })
        })
    } else {
      return callback()
    }
  }.bind(this))
}

TransactionFetcher.prototype.fetch = function (addresses, callback) {
  this.processAddresses(addresses, callback)
}

TransactionFetcher.prototype.loadAddresses = function (addresses, userId, callback) {
  return this.db.collection('bitcoinaddresses').find({ address: {$in: addresses }, userId: userId }).toArray(callback)
}

module.exports = TransactionFetcher
