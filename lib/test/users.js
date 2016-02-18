/*jslint node: true, unparam: true */
'use strict';

var users = require('../controllers/users');

exports.get = function (test) {
  users.get(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.id > 0, "property ID not found");
        test.ok(result.loginName !== undefined, "property loginName not found");
        test.ok(result.language !== undefined, "property language not found");
        test.ok(result.ownerName !== undefined, "property ownerName not found");
        test.ok(result.version !== undefined, "property version not found");
        test.done();
      }
    }
  );
};

exports.update = function (test) {
  users.update(
    {
      body: {language: 'cs-cz'},
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.message.type === 'SUCCESS', "update record error");
        test.done();
      }
    }
  );
};

exports.list = function (test) {
  users.list(
    {},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.done();
      }
    }
  );
};

exports.listWithoutOwner = function (test) {
  users.listWithoutOwner(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.done();
      }
    }
  );
};

