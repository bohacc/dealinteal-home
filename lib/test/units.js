/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  units = require('../controllers/units');

conn.setEnv('development');

exports.list = function (test) {
  units.list(
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

exports.save = function (test) {
  var tempUnit = 'TESTUNIT';
  units.save(
    {
      body: {unit: tempUnit},
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
    }
  ).then(
    function (result) {
      units.delete(
        {
          params: {unit: tempUnit},
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
          json: function () {
            test.done();
          }
        }
      );
    }
  );
};
