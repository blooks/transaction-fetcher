gvar mongo = require('coyno-mongo');
var async = require('async');
var BIP32Wallet = require('../lib/bip32');
var Wallet = require('../lib/wallet');
var testData = require('./testData');
var bip32wallet = testData.wallet;

var exchangeRate = {
  "_id" : "551b2e9d85cf6abb6882a5ab",
  "time" : new Date("2010-07-22T00:00:00.000Z"),
  "rates" : {
    "EUR": 0.0619,
    "GBP": 0.0521,
    "USD": 0.07920000000000001
  }
};


var testDataManager = function() {};

var startMongo = function (callback) {
  mongo.start(function (err, db) {
    if (err) {
      return callback(err);
    }
    return callback(null, db);
  });
};

var createWalletsCollection = function (db, callback) {
  db.createCollection('bitcoinwallets', function (err) {
    return callback(err, db);
  });
};

var createAddressesCollection = function (db, callback) {
  db.createCollection('bitcoinaddresses', function (err) {
    return callback(err, db);
  });
};

var createTransfersCollection = function (db, callback) {
  db.createCollection('transfers', function (err) {
    return callback(err, db);
  });
};
var createExchangeRatesCollection = function (db, callback) {
  db.createCollection('exchangeratesfromnpm', function (err) {
    return callback(err);
  });
};


testDataManager.prototype.initDB = function (callback) {

  if (!process.env.MONGO_URL) {
    return callback(Error('No Mongo URL set'));
  }
  async.waterfall([
    startMongo,
    createWalletsCollection,
    createAddressesCollection,
    createTransfersCollection,
    createExchangeRatesCollection
  ], callback);
};

var getFunctions = function (toBeMockedUp) {

};
var insertWallet = function(db) {
  return function(callback) {
    db.collection('bitcoinwallets').insert(bip32wallet, function (err, result) {
        callback(err, db);
    });
  }
};
var insertExchangeRate = function(db, callback) {
  db.collection('exchangeratesfromnpm').insert(exchangeRate, callback);
};
testDataManager.prototype.fillDB = function (toBeMocked,callback) {
    var functions = getFunctions(toBeMocked);
  async.waterfall(functions, callback);
};

var deleteTransfers = function(db) {
  var collection = db.collection('transfers');
  return function (callback) {
    collection.remove({}, function(err, result) {
      callback(err, db);
    });
  }
};
var deleteAddresses = function (db, callback) {
  var collection = db.collection('bitcoinaddresses');
  collection.remove({}, function(err, result) {
    callback(err, db);
  });
};

testDataManager.prototype.emptyDB = function (callback) {
  async.waterfall([
    deleteTransfers(mongo.db),
    deleteAddresses
  ], callback);
};

var dropWallets = function (db) {
  return function (callback) {
    db.dropCollection('bitcoinwallets', function (err) {
      return callback(err, db);
    });
  }
};

var dropTransfers = function (db, callback) {
  db.dropCollection('transfers', function(err) {
    return callback(err, db);
  });
};

var dropExchangeRates = function (db, callback) {
  db.dropCollection('exchangeratesfromnpm', function(err) {
    return callback(err, db);
  });
};


var dropAddresses = function (db, callback) {
  db.dropCollection('bitcoinaddresses', function(err) {
    return callback(err, db);
  });
};

testDataManager.prototype.closeDB = function (callback) {
  if (mongo.db) {
    async.waterfall([
      dropWallets(mongo.db),
      dropAddresses,
      dropTransfers,
      dropExchangeRates
    ], function (err) {
      if(err) return callback(err);
      mongo.stop(callback);
    }); }
  else {
    return callback && callback("No Db open", null);
  }
};

testDataManager.prototype.getWallet = function(type) {
  switch (type) {
    case 'bip32':
      return new BIP32Wallet(bip32wallet);
  }
  return new Wallet(bip32wallet);
};

testDataManager.prototype.getTransfers = function() {
  return testData.transfers;
};

testDataManager.prototype.getAddresses = function() {
  return testData.addresses;
};

module.exports = testDataManager;
