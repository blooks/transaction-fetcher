var log = require('@blooks/log')

var TransactionFetcher = require('../index.js')

var TestDataManager = require('@blooks/test-data').Manager
var CoynoJobs = require('@blooks/jobs')

var redisUrl = 'redis://localhost/coyno-transaction-fetcher-tests'
var mongoUrl = 'mongodb://localhost/coyno-transaction-fetcher-tests'

var transactionFetcher = new TransactionFetcher(mongoUrl, redisUrl)

var coynoJobs = new CoynoJobs(redisUrl)

var should = require('should')
var _ = require('lodash')

var testDataManager = new TestDataManager(mongoUrl)
var jobs = testDataManager.getJobs()

describe('Tests for Package Coyno Transaction Fetcher', function () {
  before(function (done) {
    testDataManager.start(function (err) {
      if (err) {
        return done(err)
      }
      log.trace('Filling db.')
      testDataManager.fillDB(['addresses', 'wallets'], done)
    })
  })
  after(function (done) {
    testDataManager.stop(done)
  })
  describe('Integration tests', function () {
    before(function (done) {
      transactionFetcher.start(done)
    })
    describe('Update bitcoin wallet', function () {
      it('should fetch all transactions for a bunch of addresses', function (done) {
        var job = jobs.transactionFetcherJob
        log.trace({job: job}, 'Adding job')
        coynoJobs.addJob('addresses.fetchTransactions', job, null, function (err, result) {
          if (err) {
            return done(err)
          }
          done()
        })
      })
    })
  })
})
