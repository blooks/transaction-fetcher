'use strict';

var mongo = require('coyno-mongo');

var randomId = require('coyno-util').meteor.randomId;

var TransferSet = function (doc) {
    if (!(this instanceof TransferSet)) {
        return new TransferSet(doc);
    }
    return _.extend(this, doc);
};

module.exports = TransferSet;