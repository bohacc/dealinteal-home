/*jslint node: true, unparam: true */
'use strict';

/**
 * @file logging
 * @fileOverview __Server_REST_API_Logging
 */

/**
 * @namespace __Server_REST_API_Logging
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Logging
 * @method
 * @name log
 * @description log about data events post to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.log = function (req, res) {
  try {
    var obj = JSON.stringify(req.body),
      date = new Date(),
      timestamp,
      loginToken = req.signedCookies.auth_token,
      sql =
        'INSERT INTO logging(content, date_event, user_db, user_login, table_name, method, pk) ' +
        '  VALUES($1::varchar, to_timestamp($2::varchar, \'DD.MM.YYYY HH24:MI\'), user, (SELECT login_name FROM USERS_LOGIN ul WHERE LOGIN_TOKEN = $3::varchar), $4, $5, $6)';

    timestamp = date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    postgres.executeSQL(req, res, sql, [obj, timestamp, loginToken, req.body.table, req.body.method, req.body.id]).then(
      function () {
        res.json(constants.OK);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};
