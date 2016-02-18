/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  roles = require('../controllers/roles');

conn.setEnv('development');
exports.list = function (test) {
  roles.list(
    {params: {search: ''}},
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

exports.exists = function (test) {
  var tempId, req = {}, res = {}, tempRole = 'TESTING ROLE ' + Math.random();
  roles.insert(
    {
      body: {roleBox: [{id: 0, name: tempRole}]},
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
          }
        };
      }
    },
    {
      json: function (result) {
        tempId = result.newRoleId;
        req.body = {roleBox: [{name: tempRole}]};
        roles.exists(req, res).then(
          function (result) {
            test.ok(result.exists, "exists record error");
            test.ok(tempId === result.id, "exists record error - other ID");
          }
        ).then(
          function () {
            req.body = {id: tempId};
            roles.delete(req, res).then(
              function () {
                test.done();
              }
            );
          }
        );
      }
    }
  );
};

exports.insert = function (test) {
  var tempId, req = {}, res = {}, tempRole = 'TESTING ROLE ' + Math.random();
  roles.insert(
    {
      body: {roleBox: [{name: tempRole}]},
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
          }
        };
      }
    },
    {
      json: function (result) {
        tempId = result.newRoleId;
        req.body = {id: tempId};
        test.ok(tempId > 0, "insert record error");
        roles.delete(req, res).then(
          function () {
            test.done();
          }
        );
      }
    }
  );
};

exports.delete = function (test) {
  var tempId, req = {}, res = {}, tempRole = 'TESTING ROLE ' + Math.random();
  roles.insert(
    {
      body: {roleBox: [{name: tempRole}]},
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
          }
        };
      }
    },
    {
      json: function (result) {
        tempId = result.newRoleId;
        req.body = {id: tempId};
        roles.delete(req, res).then(
          function () {
            req.body.roleBox = [{role: tempRole}];
            roles.exists(req, res).then(
              function (result) {
                test.ok(!result.exists, "delete record error");
                test.equal(result.id, null, "delete record error - found ID");
                test.done();
              }
            );
          }
        );
      }
    }
  );
};
