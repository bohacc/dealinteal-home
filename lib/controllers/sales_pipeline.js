/*jslint node: true, unparam: true */
'use strict';

/**
 * @file sales_pipeline
 * @fileOverview __Server_REST_API_Sales_Pipeline
 */

/**
 * @namespace __Server_REST_API_Sales_Pipeline
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name get
 * @description get sales_pipeline from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  var sql, errors;
  req.assert('id', 'ID row not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  sp.id,' +
      '  sp.subject,' +
      '  sp.owner_id,' +
      '  sp.description,' +
      '  sp.stage_id,' +
      '  sp.chance,' +
      '  sp.person_id as "personId",' +
      '  sp.closing_date as "closingDate",' +
      '  sp.status,' +
      '  sp.success,' +
      '  sp.contract_id as "contractId",' +
      '  c.company_name AS companyname,' +
      '  p.first_name||\' \'||p.last_name AS peoplename, ' +
      '  (SELECT SUM(price) FROM sales_pipeline_products spp WHERE sales_pipeline_id = sp.id) AS price ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      '  sp.id = $1::integer ';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        res.json(tools.getSingleResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name stageInfo
 * @description get sales_pipeline_stage info from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.stageInfo = function (req, res) {
  var sql, errors;
  req.assert('id', 'ID stage not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  SUM((SELECT SUM(price) FROM sales_pipeline_products spp WHERE sales_pipeline_id = sp.id)) AS price, ' +
      '  COUNT(*) AS count ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      '  stage_id = $1::integer ';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        res.json(tools.getSingleResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name stageList
 * @description list of sales_pipeline for stage from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.stageList = function (req, res) {
  try {
    var page = req.body.page || 1,
      amount = req.body.amount || 10,
      offset = (page * amount) - amount,
      loadCount = req.body.loadCount,
      sortDirection = req.body.sortDirection ? req.body.sortDirection.toUpperCase() : '',
      sortField = req.body.sortField ? req.body.sortField.toUpperCase() : '',
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      id,
      owner = '-1';

    accessColumnOrder = ['COMPANY_NAME', 'PRICE'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' c.COMPANY_NAME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    id = req.body.id || '';
    if (req.body.filter) {
      if (req.body.filter.owner) {
        owner = req.body.filter.owner.owner_id || '-1';
      }
    }

    sql =
      'SELECT ' +
      '  sp.id,sp.subject,sp.owner_id,sp.description,sp.stage_id,c.id as "companyId",c.company_name AS companyname,p.first_name||\' \'||p.last_name AS peoplename, ' +
      '  (SELECT SUM(price) FROM sales_pipeline_products spp WHERE sales_pipeline_id = sp.id) AS price ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  (sp.owner_id = $4::integer OR $4::integer = -1) AND ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      '  stage_id = $3::integer ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  SUM((SELECT SUM(price) FROM sales_pipeline_products spp WHERE sales_pipeline_id = sp.id)) AS price, ' +
      '  count(*) AS count ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  (sp.owner_id = $2::integer OR $2::integer = -1) AND ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      '  stage_id = $1::integer ';

    if (loadCount === 1) {
      postgres.select(sqlCount, [id, owner], req).then(
        function (result) {
          res.json(tools.getSingleResult(result));
        },
        function (result) {
          tools.sendResponseError(result, res);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, id, owner], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(result, res);
        }
      );
    }
  } catch (e) {
    tools.sendResponseError(e, res);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name stageOwners
 * @description list of owners for stage
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.stageOwners = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  DISTINCT sp.owner_id,p.first_name||\' \'||p.last_name AS peoplename,p.last_name ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  people p ' +
      'WHERE ' +
      '  sp.owner_id = p.id AND ' +
      '  sp.stage_id IS NOT NULL ' +
      'ORDER BY ' +
      '  p.last_name ' +
      'LIMIT 1000';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name listMyStages
 * @description list of my stages
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listMyStages = function (req, res) {
  try {
    var sql =
      'SELECT ' +
      '  sps.id,COALESCE(sps.custom_name, sps.name) as name ' +
      'FROM ' +
      '  sales_pipeline_stages sps ' +
      'WHERE ' +
      '  sps.custom_used = 1 ' +
      'ORDER BY ' +
      '  sps.id ' +
      'LIMIT 50';

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
 * @memberof __Server_REST_API_Sales_Pipeline
 * @method
 * @name smartInsert
 * @description smart insert Pipeline (name)
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.smartInsert = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    var sql, sqlSeq, vals, loginToken, row;
    sql = 'INSERT INTO sales_pipeline(id, company_id, subject, owner_id, stage_id) VALUES($1, $2, $3, $4, $5)';
    sqlSeq = 'SELECT nextval(\'seq_sales_pipeline_id\') AS ID,u.people_id as "ownerId" FROM users_login u WHERE login_token = $1';
    loginToken = req.signedCookies.auth_token;
    try {
      obj.salesPipeline = obj.salesPipeline || [];
      if (!obj.salesPipeline[0] || (obj.salesPipeline[0] && tools.isNumber(obj.salesPipeline[0].id))) {
        resolve({id: (obj.salesPipeline[0] ? obj.salesPipeline[0].id : null)});
        return;
      }
      if (!obj.companyId || !obj.salesPipeline[0].name || !obj.stageId) {
        resolve({id: null});
        return;
      }
      postgres.select(sqlSeq, [loginToken], req).then(
        function (result) {
          row = tools.getSingleResult(result);
          vals = [req.body.testId || row.id, obj.companyId, obj.salesPipeline[0].name, row.ownerId, obj.stageId];
          postgres.executeSQL(req, res, sql, vals, null, conn).then(
            function () {
              resolve({id: row.id});
            }
          );
        },
        function () {
          reject(constants.E500);
        }
      );
    } catch (e) {
      reject(constants.E500);
    }
  });
};
