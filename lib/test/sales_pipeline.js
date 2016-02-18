/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  sales_pipeline = require('../controllers/sales_pipeline');

conn.setEnv('development');

exports.get = function (test) {
  sales_pipeline.get(
    {
      params: {id: 2},
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
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.id !== undefined, "property id not found");
        test.ok(result.subject !== undefined, "property subject not found");
        test.ok(result.owner_id !== undefined, "property owner_id not found");
        test.ok(result.description !== undefined, "property description not found");
        test.ok(result.stage_id !== undefined, "property stage_id not found");
        test.done();
      }
    }
  );
};

exports.stageInfo = function (test) {
  sales_pipeline.stageInfo(
    {
      params: {id: 6},
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
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.price !== undefined, "property price not found");
        test.ok(result.count !== undefined, "property count not found");
        test.done();
      }
    }
  );
};

exports.stageList = function (test) {
  sales_pipeline.stageList(
    {body: {id: 6}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.ok(result[0].owner_id !== undefined, "property owner_id not found");
        test.ok(result[0].description !== undefined, "property description not found");
        test.ok(result[0].stage_id !== undefined, "property stage_id not found");
        test.done();
      }
    }
  );
};

exports.stageOwners = function (test) {
  sales_pipeline.stageOwners(
    {},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].owner_id !== undefined, "property owner_id not found");
        test.ok(result[0].peoplename !== undefined, "property peoplename not found");
        test.ok(result[0].last_name !== undefined, "property last_name not found");
        test.done();
      }
    }
  );
};

exports.listMyStages = function (test) {
  sales_pipeline.listMyStages(
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

exports.smartInsert = function (test) {
  var tempId, testSalesPipeline = [];
  testSalesPipeline[0] = {
    id: null,
    name: 'TESTING SALESPIPELINE' + Math.random()
  };
  sales_pipeline.smartInsert(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {testId: null}
    },
    {},
    {
      salesPipeline: testSalesPipeline,
      companyId: 1,
      stageId: 9
    },
    {}
  ).then(
    function (result) {
      tempId = result.id;
      test.ok(tempId > 0, "smartInsert error");
      test.done();
    }
  );
};
