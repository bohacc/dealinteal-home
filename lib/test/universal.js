/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  people = require('../controllers/people');

conn.setEnv('development');
exports.testSaveDate = function (test) {
  var testDate = '2014-02-01T00:00:00.000Z', tempId;
  people.post(
    {body: {
      first_name: 'Jan',
      last_name: 'Tester',
      birthday: testDate
    },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          len: function (arg, arg2) {
            test.throws({}, 'assert', msg);
          },
          isNull: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }},
    {
      json: function (result) {
        tempId = result.id;
        people.get(
          {
            params: {id: tempId},
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
              test.ok(result.birthday === testDate);
              people.delete(
                {
                  params: { id: tempId },
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
                    test.done();
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};
