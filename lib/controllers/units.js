/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 27.04.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file units
 * @fileOverview __Server_REST_API_Units
 */

/**
 * @namespace __Server_REST_API_Units
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Units
 * @method
 * @name list
 * @description list of units
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  var sql;
  try {
    sql = 'SELECT CODE AS ID, CODE AS NAME FROM UNITS u ORDER BY CODE';

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
 * @memberof __Server_REST_API_Units
 * @method
 * @name save
 * @description test if exists and then save new unit
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object
 * @param conn {Object} connection object
 * @returns Promise
 */
exports.save = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    try {
      var sqlCount, sqlNewUnit, count, code;
      sqlCount = 'SELECT COUNT(*) AS cnt FROM UNITS u WHERE CODE = $1';
      sqlNewUnit = 'INSERT INTO UNITS(CODE, NAME) VALUES($1, $2)';

      code = req.body.unit || (obj ? obj.code : null);

      postgres.select(sqlCount, [req.body.unit], req).then(
        function (result) {
          count = parseInt(tools.getSingleResult(result).cnt, 10);
          if (count === 0 && code) {
            postgres.executeSQL(req, res, sqlNewUnit, [code, null], null, conn).then(
              function (result) {
                resolve(result);
              },
              function (result) {
                reject(result);
              }
            );
          } else {
            resolve();
          }
        },
        function (result) {
          reject(result);
        }
      );
    } catch (e) {
      console.log(e);
      reject();
    }
  });
};

/**
 * @memberof __Server_REST_API_Units
 * @method
 * @name delete
 * @description delete from UNITS
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  var errors, sql = 'DELETE FROM UNITS WHERE CODE = $1';

  req.assert('unit', 'unit not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }

  try {
    postgres.executeSQL(req, res, sql, [req.params.unit]).then(
      function () {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};
