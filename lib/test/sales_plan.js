/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  sales_plan = require('../controllers/sales_plan');

conn.setEnv('development');

exports.sumForCompany = function (test) {
  sales_plan.sumForCompany(
    {
      query: {
        from: 1,
        to: 12,
        year: 2015
      },
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.revenuePlan !== undefined, "property revenuePlan not found");
        test.ok(result.amountPlan !== undefined, "property amountPlan not found");
        test.ok(result.revenueActual !== undefined, "property revenueActual not found");
        test.ok(result.amountActual !== undefined, "property amountActual not found");
        test.ok(result.revenuePlanPercent !== undefined, "property revenuePlanPercent not found");
        test.ok(result.revenuePlanMinusActual !== undefined, "property revenuePlanMinusActual not found");
        test.ok(result.amountPlanPercent !== undefined, "property amountPlanPercent not found");
        test.ok(result.amountPlanMinusActual !== undefined, "property amountPlanMinusActual not found");
        test.done();
      }
    }
  );
};

exports.sumForDomain = function (test) {
  sales_plan.sumForDomain(
    {
      query: {
        from: 1,
        to: 12,
        year: 2015
      },
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].revenueActual !== undefined, "property revenueActual not found");
        test.ok(result[0].amountActual !== undefined, "property amountActual not found");
        test.ok(result[0].revenuePlan !== undefined, "property revenuePlan not found");
        test.ok(result[0].amountPlan !== undefined, "property amountPlan not found");
        test.ok(result[0].revenuePlanPercent !== undefined, "property revenuePlanPercent not found");
        test.ok(result[0].revenuePlanMinusActual !== undefined, "property revenuePlanMinusActual not found");
        test.ok(result[0].amountPlanPercent !== undefined, "property amountPlanPercent not found");
        test.ok(result[0].amountPlanMinusActual !== undefined, "property amountPlanMinusActual not found");
        test.done();
      }
    }
  );
};

exports.sumForPersonal = function (test) {
  sales_plan.sumForPersonal(
    {
      query: {
        from: 1,
        to: 12,
        year: 2015
      },
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].revenueActual !== undefined, "property revenueActual not found");
        test.ok(result[0].amountActual !== undefined, "property amountActual not found");
        test.ok(result[0].revenuePlan !== undefined, "property revenuePlan not found");
        test.ok(result[0].amountPlan !== undefined, "property amountPlan not found");
        test.ok(result[0].revenuePlanPercent !== undefined, "property revenuePlanPercent not found");
        test.ok(result[0].revenuePlanMinusActual !== undefined, "property revenuePlanMinusActual not found");
        test.ok(result[0].amountPlanPercent !== undefined, "property amountPlanPercent not found");
        test.ok(result[0].amountPlanMinusActual !== undefined, "property amountPlanMinusActual not found");
        test.done();
      }
    }
  );
};

exports.yearsForFilter = function (test) {
  sales_plan.yearsForFilter(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].year !== undefined, "property year not found");
        test.done();
      }
    }
  );
};

exports.monthsForFilter = function (test) {
  sales_plan.monthsForFilter(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].year !== undefined, "property year not found");
        test.ok(result[0].month !== undefined, "property month not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].from !== undefined, "property from not found");
        test.ok(result[0].to !== undefined, "property to not found");
        test.done();
      }
    }
  );
};

exports.quarterForFilter = function (test) {
  sales_plan.quarterForFilter(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].year !== undefined, "property year not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].from !== undefined, "property from not found");
        test.ok(result[0].to !== undefined, "property to not found");
        test.done();
      }
    }
  );
};

exports.listCompanyGroup = function (test) {
  sales_plan.listCompanyGroup(
    {
      query: {
        from: 1,
        to: 12,
        year: 2015
      }
    },
    {
      json: function (result) {
        test.ok(result[0].type !== undefined, "property type not found");
        test.ok(result[0].docDate !== undefined, "property docDate not found");
        test.ok(result[0].subName !== undefined, "property subName not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].companyId !== undefined, "property companyId not found");
        test.ok(result[0].amountActual !== undefined, "property amountActual not found");
        test.ok(result[0].amountUnit !== undefined, "property amountUnit not found");
        test.ok(result[0].revenueActual !== undefined, "property revenueActual not found");
        test.ok(result[0].revenueSum !== undefined, "property revenueSum not found");
        test.done();
      }
    }
  );
};

exports.listProductGroup = function (test) {
  sales_plan.listProductGroup(
    {
      query: {
        from: 1,
        to: 12,
        year: 2015
      },
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result[0].type !== undefined, "property type not found");
        test.ok(result[0].docDate !== undefined, "property docDate not found");
        test.ok(result[0].subName !== undefined, "property subName not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].amountActual !== undefined, "property amountActual not found");
        test.ok(result[0].revenueActual !== undefined, "property revenueActual not found");
        test.ok(result[0].revenueSum !== undefined, "property revenueSum not found");
        test.done();
      }
    }
  );
};
