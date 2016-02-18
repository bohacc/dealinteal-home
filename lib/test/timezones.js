/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  timezones = require('../controllers/timezones');

conn.setEnv('development');

exports.list = function (test) {
  timezones.list(
    {signedCookies: {auth_token: 'TESTOVACITOKEN'}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].default !== undefined, "property default not found");
        test.done();
      }
    }
  );
};

exports.amountForDate = function (test) {
  timezones.amountForDate(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {},
    {
      date: new Date(),
      timezoneName: 'Europe/Andorra'
    }
  ).then(
    function (result) {
      test.done();
    }
  );
};


