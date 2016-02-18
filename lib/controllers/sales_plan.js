/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file sales_plan
 * @fileOverview __Server_REST_API_Sales_Plan
 */

/**
 * @namespace __Server_REST_API_Sales_Plan
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name sumForCompany
 * @description get list sales plan for company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.sumForCompany = function (req, res) {
  var sql, errors, from, to, year, sqlSales, row, obj = {};
  //req.checkQuery('dateFrom', 'DateFrom not found.').notEmpty();
  //req.checkQuery('dateTo', 'DateTo not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  COALESCE(SUM(COALESCE(revenue_plan, 0)), 0) as "revenuePlan", ' +
      '  COALESCE(SUM(COALESCE(amount_plan, 0)), 0) as "amountPlan" ' +
      'FROM ' +
      '  sales_plan_company spc ' +
      'WHERE' +
      '  year = $3::int AND ' +
      '  month >= $1::int AND ' +
      '  month <= $2::int ';

    sqlSales =
      'SELECT ' +
      '  COALESCE(SUM(COALESCE(total_common_price, 0)), 0) as "revenueActual", ' +
      '  COALESCE(SUM(COALESCE(quantity, 0)), 0) as "amountActual" ' +
      'FROM ' +
      '  sales s ' +
      'WHERE' +
      '  extract(year from doc_date) = $3::int AND ' +
      '  extract(month from doc_date) >= $1::int AND' +
      '  extract(month from doc_date) <= $2::int ';

    from = req.query.from;
    to = req.query.to;
    year = req.query.year;
    postgres.select(sql, [from, to, year], req).then(
      function (result) {
        row = tools.getSingleResult(result);
        obj = {
          revenuePlan: row.revenuePlan,
          amountPlan: row.amountPlan
        };
        postgres.select(sqlSales, [from, to, year], req).then(
          function (result) {
            row = tools.getSingleResult(result);
            obj.revenueActual = row.revenueActual;
            obj.amountActual = row.amountActual;
            obj.revenuePlanPercent = obj.revenuePlan ? Math.round(parseInt(row.revenueActual, 10) / (parseInt(obj.revenuePlan, 10) ? (parseInt(obj.revenuePlan, 10) / 100) : 1)) : 0;
            obj.revenuePlanMinusActual = parseInt(obj.revenuePlan, 10) - parseInt(row.revenueActual, 10);
            obj.amountPlanPercent = obj.amountPlan ? Math.round(parseInt(row.amountActual, 10) / (parseInt(obj.amountPlan, 10) ? (parseInt(obj.amountPlan, 10) / 100) : 1)) : 0;
            obj.amountPlanMinusActual = parseInt(obj.amountPlan, 10) - parseInt(row.amountActual, 10);
            res.json(obj);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name sumForDomain
 * @description get list sales plan for domain
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.sumForDomain = function (req, res) {
  var sql, errors, from, to, year;
  //req.checkQuery('dateFrom', 'DateFrom not found.').notEmpty();
  //req.checkQuery('dateTo', 'DateTo not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  s.*, ' +
      '  CASE WHEN s."revenuePlan" = 0 THEN 0 ELSE round(s."revenueActual" / (s."revenuePlan" / 100)) END as "revenuePlanPercent", ' +
      '  (s."revenuePlan" - s."revenueActual") as "revenuePlanMinusActual", ' +
      '  CASE WHEN s."amountPlan" = 0 THEN 0 ELSE round(s."amountActual" / (s."amountPlan" / 100)) END as "amountPlanPercent", ' +
      '  (s."amountPlan" - s."amountActual") as "amountPlanMinusActual" ' +
      'FROM ( ' +
      '  SELECT ' +
      '    d.name, ' +
      '    COALESCE((select sum(COALESCE(total_common_price, 0)) from sales s where extract(year from doc_date) = $3::int AND extract(month from doc_date) >= $1::int AND extract(month from doc_date) <= $2::int AND domain_id = d.id), 0) as "revenueActual", ' +
      '    COALESCE((select sum(COALESCE(quantity, 0)) from sales s where extract(year from doc_date) = $3::int AND extract(month from doc_date) >= $1::int AND extract(month from doc_date) <= $2::int AND domain_id = d.id), 0) as "amountActual", ' +
      '    COALESCE((select sum(COALESCE(spd.revenue_plan, 0)) from sales_plan_domain spd where spd.year = $3::int AND spd.month >= $1::int AND spd.month <= $2::int), 0) as "revenuePlan", ' +
      '    COALESCE((select sum(COALESCE(spd.amount_plan, 0)) from sales_plan_domain spd where spd.year = $3::int AND spd.month >= $1::int AND spd.month <= $2::int), 0) as "amountPlan" ' +
      '  FROM ' +
      '    domains d ' +
      '  GROUP BY ' +
      '    d.id, d.name ' +
      ') s';

    from = req.query.from;
    to = req.query.to;
    year = req.query.year;
    postgres.select(sql, [from, to, year], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name sumForPersonal
 * @description get list sales plan for personal
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.sumForPersonal = function (req, res) {
  var sql, errors, from, to, year;
  //req.checkQuery('dateFrom', 'DateFrom not found.').notEmpty();
  //req.checkQuery('dateTo', 'DateTo not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  s.*, ' +
      '  CASE WHEN s."revenuePlan" = 0 THEN 0 ELSE round(s."revenueActual" / (s."revenuePlan" / 100)) END as "revenuePlanPercent", ' +
      '  (s."revenuePlan" - s."revenueActual") as "revenuePlanMinusActual", ' +
      '  CASE WHEN s."amountPlan" = 0 THEN 0 ELSE round(s."amountActual" / (s."amountPlan" / 100)) END as "amountPlanPercent", ' +
      '  (s."amountPlan" - s."amountActual") as "amountPlanMinusActual" ' +
      'FROM ( ' +
      '  SELECT ' +
      '    COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') as name, ' +
      '    COALESCE((select sum(COALESCE(total_common_price, 0)) from sales s where extract(year from doc_date) = $3::int AND extract(month from doc_date) >= $1::int AND extract(month from doc_date) <= $2::int AND rep_id = u.people_id), 0) as "revenueActual", ' +
      '    COALESCE((select sum(COALESCE(quantity, 0)) from sales s where extract(year from doc_date) = $3::int AND extract(month from doc_date) >= $1::int AND extract(month from doc_date) <= $2::int AND rep_id = u.people_id), 0) as "amountActual", ' +
      '    COALESCE((select sum(COALESCE(spp.revenue_plan, 0)) from sales_plan_personal spp where spp.year = $3::int AND spp.month >= $1::int AND spp.month <= $2::int), 0) as "revenuePlan", ' +
      '    COALESCE((select sum(COALESCE(spp.amount_plan, 0)) from sales_plan_personal spp where spp.year = $3::int AND spp.month >= $1::int AND spp.month <= $2::int), 0) as "amountPlan" ' +
      '  FROM ' +
      '    users_login u ' +
      '    LEFT JOIN people p ON u.people_id = p.id ' +
      '  GROUP BY ' +
      '    u.people_id, p.first_name, p.last_name ' +
      ') s';

    from = req.query.from;
    to = req.query.to;
    year = req.query.year;
    postgres.select(sql, [from, to, year], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name yearsForFilter
 * @description get list of years from sales plan
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.yearsForFilter = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  year ' +
      'FROM ' +
      '  sales_plan_company spc ' +
      'GROUP BY ' +
      '  year ' +
      'ORDER BY ' +
      '  year desc';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name monthsForFilter
 * @description get list of months from sales plan
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.monthsForFilter = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  year, ' +
      '  month,' +
      '  month as name,' +
      '  month as from, ' +
      '  month as to ' +
      'FROM ' +
      '  sales_plan_company spc ' +
      'GROUP BY ' +
      '  year, month ' +
      'ORDER BY ' +
      '  year, month desc';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name quarterForFilter
 * @description get list of quarter from sales plan
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.quarterForFilter = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  year, name, fromX as "from", toX as "to" ' +
      'FROM ( ' +
      '  SELECT ' +
      '    year, ' +
      '    month, ' +
      '    CASE ' +
      '      WHEN month = 1 THEN \'1Q\' ' +
      '      WHEN month = 2 THEN \'1Q\' ' +
      '      WHEN month = 3 THEN \'1Q\' ' +
      '      WHEN month = 4 THEN \'2Q\' ' +
      '      WHEN month = 5 THEN \'2Q\' ' +
      '      WHEN month = 6 THEN \'2Q\' ' +
      '      WHEN month = 7 THEN \'3Q\' ' +
      '      WHEN month = 8 THEN \'3Q\' ' +
      '      WHEN month = 9 THEN \'3Q\' ' +
      '      WHEN month = 10 THEN \'4Q\' ' +
      '      WHEN month = 11 THEN \'4Q\' ' +
      '      WHEN month = 12 THEN \'4Q\' ' +
      '    END as name, ' +
      '    CASE ' +
      '      WHEN month = 1 THEN 1 ' +
      '      WHEN month = 2 THEN 1 ' +
      '      WHEN month = 3 THEN 1 ' +
      '      WHEN month = 4 THEN 4 ' +
      '      WHEN month = 5 THEN 4 ' +
      '      WHEN month = 6 THEN 4 ' +
      '      WHEN month = 7 THEN 7 ' +
      '      WHEN month = 8 THEN 7 ' +
      '      WHEN month = 9 THEN 7 ' +
      '      WHEN month = 10 THEN 10 ' +
      '      WHEN month = 11 THEN 10 ' +
      '      WHEN month = 12 THEN 10 ' +
      '    END as fromX, ' +
      '    CASE ' +
      '      WHEN month = 1 THEN 3 ' +
      '      WHEN month = 2 THEN 3 ' +
      '      WHEN month = 3 THEN 3 ' +
      '      WHEN month = 4 THEN 6 ' +
      '      WHEN month = 5 THEN 6 ' +
      '      WHEN month = 6 THEN 6 ' +
      '      WHEN month = 7 THEN 9 ' +
      '      WHEN month = 8 THEN 9 ' +
      '      WHEN month = 9 THEN 9 ' +
      '      WHEN month = 10 THEN 12 ' +
      '      WHEN month = 11 THEN 12 ' +
      '      WHEN month = 12 THEN 12 ' +
      '    END as toX ' +
      '  FROM ' +
      '    sales_plan_company spc ' +
      '  GROUP BY ' +
      '    year, month ' +
      '  ORDER BY ' +
      '    year, month desc) s ' +
      'GROUP BY ' +
      '  year, name, fromX, toX';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name listCompanyGroup
 * @description list of company group from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listCompanyGroup = function (req, res) {
  try {
    var sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField,
      sql,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      from,
      to,
      year;

    accessColumnOrder = ['name', 'revenueSum'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? '"' + sortField + '"' : ' "name" ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'select ' +
      '  1 as type, ' +
      '  null as "docDate", ' +
      '  null as "subName", ' +
      '  company_name as "name", ' +
      '  company_id as "companyId", ' +
      '  null as "amountActual", ' +
      '  null as "amountUnit", ' +
      '  null as "revenueActual", ' +
      '  sum(total_common_price) as "revenueSum" ' +
      'from ' +
      '  sales s, ' +
      '  companies c,' +
      '  products p ' +
      'where ' +
      '  s.company_id = c.id AND ' +
      '  s.product_id = p.id AND ' +
      '  extract(year from s.doc_date) = $3::int AND ' +
      '  extract(month from s.doc_date) >= $1::int AND ' +
      '  extract(month from s.doc_date) <= $2::int ' +
      'group by ' +
      '  company_name, company_id ' +
      'union ' +
      'select ' +
      '  2 as type, ' +
      '  s.doc_date as "docDate", ' +
      '  p.name as "subName", ' +
      '  company_name as "name", ' +
      '  company_id as "companyId", ' +
      '  quantity as "amountActual", ' +
      '  null as "amountUnit", ' +
      '  total_common_price as "revenueActual", ' +
      '  (select sum(total_common_price) from sales sal where company_id = c.id AND extract(year from sal.doc_date) = $3::int AND extract(month from sal.doc_date) >= $1::int AND extract(month from sal.doc_date) <= $2::int) as "revenueSum" ' +
      'from ' +
      '  sales s, ' +
      '  companies c,' +
      '  products p ' +
      'where ' +
      '  s.company_id = c.id AND ' +
      '  s.product_id = p.id AND ' +
      '  extract(year from s.doc_date) = $3::int AND ' +
      '  extract(month from s.doc_date) >= $1::int AND ' +
      '  extract(month from s.doc_date) <= $2::int ' +
      'order by ' +
      '  ' + sqlOrderBy + ', "companyId", type, "docDate" ';

    from = req.query.from;
    to = req.query.to;
    year = req.query.year;
    postgres.select(sql, [from, to, year], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Plan
 * @method
 * @name listProductGroup
 * @description list of product group from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listProductGroup = function (req, res) {
  try {
    var sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField,
      sql,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      from,
      to,
      year;

    accessColumnOrder = ['name', 'revenueSum'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? '"' + sortField + '"' : ' "name" ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'select ' +
      '  1 as type, ' +
      '  null as "docDate", ' +
      '  null as "subName", ' +
      '  p.name as "name", ' +
      '  p.id, ' +
      '  null as "amountActual", ' +
      '  null as "revenueActual", ' +
      '  sum(total_common_price) as "revenueSum" ' +
      'from ' +
      '  sales s, ' +
      '  companies c,' +
      '  products p ' +
      'where ' +
      '  s.company_id = c.id AND ' +
      '  s.product_id = p.id AND ' +
      '  extract(year from s.doc_date) = $3::int AND ' +
      '  extract(month from s.doc_date) >= $1::int AND ' +
      '  extract(month from s.doc_date) <= $2::int ' +
      'group by ' +
      '  p.name, p.id ' +
      'union ' +
      'select ' +
      '  2 as type, ' +
      '  null as "docDate", ' +
      '  c.company_name as "subName", ' +
      '  p.name as "name", ' +
      '  p.id, ' +
      '  quantity as "amountActual", ' +
      '  total_common_price as "revenueActual", ' +
      '  (select sum(total_common_price) from sales sal where company_id = c.id AND extract(year from sal.doc_date) = $3::int AND extract(month from sal.doc_date) >= $1::int AND extract(month from sal.doc_date) <= $2::int) as "revenueSum" ' +
      'from ' +
      '  sales s, ' +
      '  companies c,' +
      '  products p ' +
      'where ' +
      '  s.company_id = c.id AND ' +
      '  s.product_id = p.id AND ' +
      '  extract(year from s.doc_date) = $3::int AND ' +
      '  extract(month from s.doc_date) >= $1::int AND ' +
      '  extract(month from s.doc_date) <= $2::int ' +
      'order by ' +
      '  ' + sqlOrderBy + ', id, type ';

    from = req.query.from;
    to = req.query.to;
    year = req.query.year;
    postgres.select(sql, [from, to, year], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};
