/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  currency = require('../controllers/currency');

conn.setEnv('development');

exports.list = function (test) {
  currency.list(
    {},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].name !== undefined, "property NAME not found");
        test.done();
      }
    }
  );
};
