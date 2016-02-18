/*jslint node: true, unparam: true */
'use strict';

/**
 * @file roles
 * @fileOverview __Server_REST_API_Roles
 */

/**
 * @namespace __Server_REST_API_Roles
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Roles
 * @method
 * @name list
 * @description list of roles
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  var sql = 'SELECT ID, NAME FROM ROLES r WHERE UPPER(NAME) LIKE UPPER(\'%\' || $1::varchar || \'%\') ORDER BY NAME';
  try {
    return postgres.select(sql, [req.params.search], req).then(
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
 * @memberof __Server_REST_API_Roles
 * @method
 * @name exists
 * @description search ID role according to name
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.exists = function (req, res) {
  var newObj, sql = 'SELECT ID AS ID FROM ROLES r WHERE NAME  = $1', role;
  role = req.body.roleBox[0] ? req.body.roleBox[0].name : '';
  return postgres.select(sql, [role], req).then(
    function (result) {
      newObj = tools.getSingleResult(result);
      return {exists: newObj.id > 0, id: newObj.id};
    },
    function () {
      return {};
    }
  );
};

/**
 * @memberof __Server_REST_API_Roles
 * @method
 * @name insert
 * @description insert new role
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param noCloseReq {Boolean} no request
 * @returns Promise
 */
exports.insert = function (req, res, noCloseReq) {
  var vals, errors,
    sqlSeq = 'SELECT nextval(\'seq_roles_id\') AS ID',
    sql = 'INSERT INTO ROLES (ID, NAME) VALUES ($1, $2)',
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH;

  //req.assert('role', 'Název role musí být vyplněn.').notEmpty();
  //req.assert('role', tools.getValidationMessage('role', message_valid_length, 0, 100)).len(0, 100);
  if (!req.body.roleBox[0].name) {
    req.assert('roleBox', tools.getValidationMessage('roleBox', message_valid_length, null, null)).isNull();
  } else {
    if (req.body.roleBox[0].name.length > 100) {
      req.assert('roleBox', tools.getValidationMessage('roleBox', message_valid_length, null, null)).isNull();
    }
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  tools.setNullForEmpty(req.body);

  try {
    vals = [null, req.body.roleBox[0].name];
    return postgres.select(sqlSeq, [], req).then(
      function (result) {
        vals[0] = tools.getSingleResult(result).id;
        return postgres.executeSQL(req, res, sql, vals);
      },
      function (result) {
        tools.sendResponseError(result, res, noCloseReq);
      }
    ).then(
      function () {
        return tools.sendResponseSuccess({newRoleId: vals[0]}, res, noCloseReq);
      },
      function (result) {
        tools.sendResponseError(result, res, noCloseReq);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, noCloseReq);
  }
};

/**
 * @memberof __Server_REST_API_Roles
 * @method
 * @name delete
 * @description delete from ROLES
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  var sql = 'DELETE FROM ROLES WHERE ID = $1';
  return postgres.executeSQL(req, res, sql, [req.body.id]);
};
