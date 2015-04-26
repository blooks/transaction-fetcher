'use strict';

var TransferSet = function (doc) {
    if (!(this instanceof TransferSet)) {
        return new TransferSet(doc);
    }
    return _.extend(this, doc);
};

module.exports = TransferSet;