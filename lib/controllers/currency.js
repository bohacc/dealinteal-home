/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 27.04.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file currency
 * @fileOverview __Server_REST_API_Currency
 */

/**
 * @namespace __Server_REST_API_Currency
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools');

/**
 * @memberof __Server_REST_API_Currency
 * @method
 * @name list
 * @description list of currency
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  var sql;
  try {
    sql = 'SELECT CODE AS ID, CODE AS NAME FROM CURRENCY c ORDER BY CODE';

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
