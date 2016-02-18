/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  agenda = require('../controllers/agenda'),
  constants = require('../controllers/constants');

conn.setEnv('development');

exports.listForWeek = function (test) {
  agenda.listForWeek(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      params: {date: new Date()},
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isNull: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.sendEmail = function (test) {
  agenda.sendEmail(
    {
      body: {person: 9},
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.equal(result, constants.OK, "sendEmail error");
        test.done();
      }
    }
  );
};

exports.listForOpportunity = function (test) {
  agenda.listForOpportunity(
    {
      query: {count: 0},
      params: {id: 1},
      validationErrors: function () {
        return null;
      },
      checkParams: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.done();
      }
    }
  );
};

exports.listForProject = function (test) {
  agenda.listForProject(
    {
      query: {count: 0},
      params: {id: 5},
      validationErrors: function () {
        return null;
      },
      checkParams: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.done();
      }
    }
  );
};

exports.listForPerson = function (test) {
  agenda.listForPerson(
    {
      query: {count: 0},
      params: {id: 9},
      validationErrors: function () {
        return null;
      },
      checkParams: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.done();
      }
    }
  );
};

exports.listForCompany = function (test) {
  agenda.listForCompany(
    {
      query: {count: 0},
      params: {id: 51288},
      validationErrors: function () {
        return null;
      },
      checkParams: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.done();
      }
    }
  );
};
