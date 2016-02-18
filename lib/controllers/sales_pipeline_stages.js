/*jslint node: true, unparam: true */
'use strict';

/**
 * @file sales_pipeline_stages
 * @fileOverview __Server_REST_API_Sales_Pipeline_Stages
 */

/**
 * @namespace __Server_REST_API_Sales_Pipeline_Stages
 * @author Pavel Koloamzník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name list
 * @description list of pipeline stages
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  try {
    var sql =
      'SELECT ' +
      '  id, COALESCE(custom_name, name) as name, chance ' +
      'FROM ' +
      '  sales_pipeline_stages sps ' +
      'ORDER BY id ';
    /*'LIMIT 50';*/

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
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name post
 * @description post new stage to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  try {
    var sql, sqlSeq, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('name', 'NAME not found.').notEmpty();
    if (req.body.name) {
      req.assert('name', tools.getValidationMessage('name', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.chance) {
      req.assert('chance', tools.getValidationMessage('chance', message_valid_number, 0, 100)).isInt();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sqlSeq = req.body.id ? 'SELECT null as id' : 'SELECT nextval(\'seq_sales_pipeline_stages_id\') AS id';
    sql =
      'INSERT INTO SALES_PIPELINE_STAGES (ID, NAME, CUSTOM_NAME, CUSTOM_USED, CHANCE) ' +
      'VALUES ($1, $2, $3, $4, $5)';

    sqldb = postgres.createTransaction(req);

    vals = [req.body.id, null, req.body.name, 1, req.body.chance];

    postgres.select(sqlSeq, [], req).then(
      function (result) {
        vals[0] = req.body.id || tools.getSingleResult(result).id;
        return postgres.executeSQL(req, res, sql, vals, null, sqldb);
      }
    ).then(
      function () {
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (response) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name put
 * @description put stage to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  try {
    var sql, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    if (req.body.name) {
      req.assert('name', tools.getValidationMessage('name', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.chance) {
      req.assert('chance', tools.getValidationMessage('chance', message_valid_number, 0, 100)).isInt();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql = 'UPDATE SALES_PIPELINE_STAGES SET CUSTOM_NAME = $2, CHANCE = $3 WHERE ID = $1';

    sqldb = postgres.createTransaction(req);

    vals = [req.body.id, req.body.name, req.body.chance];

    postgres.executeSQL(req, res, sql, vals, null, sqldb).then(
      function () {
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );

  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name replace
 * @description replace stage with another to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.replace = function (req, res) {
  try {
    var sql, sqlDelete, sqldb, errors, sqlAppointments, sqlTasks,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('id', 'Id not found.').notEmpty();
    if (req.params.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }
    req.assert('newId', 'newId not found.').notEmpty();
    req.assert('newId', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql = 'UPDATE SALES_PIPELINE SET STAGE_ID = $2 WHERE STAGE_ID = $1';

    sqlAppointments = 'UPDATE appointments set sales_pipeline_stage_id = $2 WHERE sales_pipeline_stage_id = $1';

    sqlTasks = 'UPDATE tasks set sales_pipeline_stage_id = $2 WHERE sales_pipeline_stage_id = $1';

    sqlDelete = 'DELETE FROM SALES_PIPELINE_STAGES WHERE ID = $1';

    sqldb = postgres.createTransaction(req);

    //console.log('krok 0');
    postgres.executeSQL(req, res, sql, [req.body.id, req.body.newId], null, sqldb).then(
      function (result) {
        //console.log('krok 1');
        return postgres.executeSQL(req, res, sqlAppointments, [req.body.id, req.body.newId], null, sqldb);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sqlTasks, [req.body.id, req.body.newId], null, sqldb);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sqlDelete, [req.body.id], null, sqldb);
      }
    ).then(
      function () {
        //console.log('krok 2');
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: req.body.id}, res, false);
      },
      function (result) {
        //console.log('krok error');
        tools.sendResponseError(constants.E500, res, false);
      }
    );

  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name del
 * @description del stage to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.del = function (req, res) {
  try {
    var sql, sqldb, vals, errors,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('id', 'Id not found.').notEmpty();
    if (req.params.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql = 'DELETE FROM SALES_PIPELINE_STAGES WHERE ID = $1';

    sqldb = postgres.createTransaction(req);

    vals = [req.params.id];

    postgres.executeSQL(req, res, sql, vals, null, sqldb).then(
      function () {
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );

  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Sales_Pipeline_Stages
 * @method
 * @name get
 * @description get pipeline stage
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  try {
    var sql, errors,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('id', 'Id not found.').notEmpty();
    if (req.params.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql =
      'SELECT ' +
      '  id, COALESCE(custom_name, name) as name, chance ' +
      'FROM ' +
      '  sales_pipeline_stages sps ' +
      'WHERE ' +
      '  id = $1 ';
    /*'LIMIT 50';*/

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        res.json(tools.getSingleResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};
