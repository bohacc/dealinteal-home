/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  countries = require('../controllers/countries');

conn.setEnv('development');

exports.list = function (test) {
  countries.list(
    {signedCookies: {auth_token: ''}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].iso !== undefined, "property ISO not found");
        test.ok(result[0].name !== undefined, "property NAME not found");
        test.done();
      }
    }
  );
};
