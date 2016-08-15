var log = require('@blooks/log')
var TransactionFetcher = require('./fetcher')
var CoynoJobs = require('@blooks/jobs')
var CoynoMongo = require('@blooks/mongo')

var Fetcher = function (mongoUrl, redisUrl) {
  this.jobs = new CoynoJobs(redisUrl)
  this.mongo = new CoynoMongo(mongoUrl)
}

Fetcher.prototype.fetchTransactions = function (job, done) {
  var self = this
  if (!job.data.addresses) {
    log.error('Got job without addresses')
    return done('No addresses to work on.')
  }
  if (!job.data.userId) {
    log.error('Job without user id.')
    return done('Invalid User Id.')
  }
  if (!job.data.walletId) {
    log.error('Job without wallet id.')
    return done('No Wallet Id provided.')
  }
  var transactionFetcher = new TransactionFetcher(job.data.userId, self.db)
  log.debug({numAddresses: job.data.addresses.length}, 'Fetching transactions ')
  transactionFetcher.loadAddresses(job.data.addresses, job.data.userId, function (err, addresses) {
    if (err) {
      log.warn('Mongo Error')
      return done(err)
    }
    else if (addresses.length < 1) {
      log.warn('No addresses found')
      return done('No addresses found.')
    }
    transactionFetcher.fetch(addresses, function (err) {
      if (err) {
        log.error(err)
        return done(err)
      }
      self.jobs.addJob('addresses.connectTransactions',
        {
          addresses: job.data.addresses,
          userId: job.data.userId,
          walletId: job.data.walletId
        })
      return done(null)
    })
  })
}

Fetcher.prototype.start = function (callback) {
  var self = this
  self.mongo.start(function (err, database) {
    if (err) {
      return callback(err)
    }
    self.db = database
    self.jobs.onJob('addresses.fetchTransactions', self.fetchTransactions.bind(self))
    callback(null, 'Transaction Fetcher started.')
  })
}

module.exports = Fetcher
