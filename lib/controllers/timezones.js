/*jslint node: true, unparam: true */
'use strict';

/**
 * @file timezones
 * @fileOverview __Server_REST_API_TimeZones
 */

/**
 * @namespace __Server_REST_API_TimeZones
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_TimeZones
 * @method
 * @name list
 * @description list of timezones
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  try {
    var sql,
      loginToken;

    loginToken = req.signedCookies.auth_token;
    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.name, ' +
      '  (CASE WHEN u.timezone_name IS NOT NULL THEN 1 ELSE 0 END) AS default ' +
      'FROM ' +
      '  timezones t ' +
      '  LEFT JOIN users_login u ON t.name = u.timezone_name AND u.login_token = $1 ' +
      'ORDER BY ' +
      '  t.id';

    postgres.select(sql, [loginToken], req).then(
      function (result) {
        tools.sendResponseSuccess(tools.getMultiResult(result), res, false);
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
 * @memberof __Server_REST_API_TimeZones
 * @method
 * @name amountForDate
 * @description amount for timezones
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} transport object
 * @returns Promise
 */
exports.amountForDate = function (req, res, obj) {
  try {
    var sql;
    sql =
      'select ' +
      '  gmt_offset as "gmtOffset" ' +
      'from ' +
      '  timezones_validity tv, ' +
      '  timezones t, ' +
      //'  users_login u, ' +
      '  (select ' +
      '     max(start_time) as start_time ' +
      '   from ' +
      '     ( ' +
      '      select ' +
      '        date \'1.1.1970\' + start_time * interval \'1 second\' as start_time ' +
      '      from ' +
      '        timezones_validity tv, ' +
      '        timezones t ' +
      //'        users_login u ' +
      '      where ' +
      '        tv.zone_id = t.id AND' +
      '        t.name =  $2::varchar ' +
      //'        u.login_token = $2::varchar ' +
      '     ) s ' +
      '   where ' +
      '     start_time <= $1::date ' +
      '  ) x ' +
      'where ' +
      '  tv.zone_id = t.id AND ' +
      '  t.name =  $2::varchar AND ' +
      '  date \'1.1.1970\' + tv.start_time * interval \'1 second\' = x.start_time ';
      //'  u.login_token = $2::varchar ';

    return postgres.select(sql, [obj.date, obj.timezoneName], req);
  } catch (e) {
    return null;
  }
};
