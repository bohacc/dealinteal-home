/*jslint node: true, unparam: true */
'use strict';

/**
 * @file countries
 * @fileOverview __Server_REST_API_Countries
 */

/**
 * @namespace __Server_REST_API_Countries
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Countries
 * @method
 * @name list
 * @description list of countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  try {
    var column,
      columns = ['name_cz', 'name_sk', 'name_eng'],
      language = ['cs-cz', 'sk-sk', 'en-us'],
      languageCode,
      sql,
      sqlUser,
      loginToken;

    loginToken = req.signedCookies.auth_token;
    sqlUser = 'SELECT language FROM users_login ul WHERE login_token = $1';

    postgres.select(sqlUser, [loginToken], req).then(
      function (result) {
        languageCode = tools.getSingleResult(result).language;
        switch (languageCode) {
        case language[0]:
          column = columns[0];
          break;
        case language[1]:
          column = columns[1];
          break;
        case language[2]:
          column = columns[2];
          break;
        default:
          column = columns[2];
        }
        sql = 'SELECT id,iso,' + column + ' AS name FROM countries c ORDER BY ' + column;
        return postgres.select(sql, [], req);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    ).then(
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
