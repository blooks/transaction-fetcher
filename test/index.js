
var TestDataManager = require('coyno-mockup-data').Manager;

var mongo = require('coyno-mongo');
var should = require('should');
var debug = require('debug')('coyno:transfers-tests');

var TransferSet = require('../index');

var testDataManager = new TestDataManager();

describe('Tests for Package Coyno Transfers', function() {

    describe('Unit tests', function () {
    });
    describe('Integration tests', function () {
        before(function (done) {
            testDataManager.initDB(function (err) {
                done(err);
            });
        });
        after(function (done) {
            testDataManager.closeDB(function (err) {
                if (err) console.log(err);
                done(err);
            });
        });
        describe('Wallet jobs tests', function() {
            before(function (done) {
                testDataManager.fillDB(function (err) {
                    done(err);
                });
            });

            after(function (done) {
                testDataManager.emptyDB(function (err) {
                    if (err) console.log(err);
                    done(err);
                });
            });

            describe('Update bitcoin wallet', function () {
                it('should update all transactions for bitcoin wallet', function (done) {
                    getWallet({_id: "E2kQargHKujeY442B"})
                        .then(updateWallet)
                        .then(getWallet)
                        .then(checkWallet)
                        .then(checkTransfers)
                        .then(done).catch(done);
                });
            });
            describe('Update and add trades', function () {
                it('should print a lot of addresses', function (done) {
                    var wallet = testDataManager.getWallet();
                    wallet.update(function(err) {
                        if (err) return done(err);
                    })
                });
            });
        })
    });
});

