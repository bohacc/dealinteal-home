/*jslint node: true, unparam: true */
'use strict';

/**
 * @file users
 * @fileOverview __Server_REST_API_User
 */

/**
 * @namespace __Server_REST_API_User
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  conn = require('./connections'),
  version = require('../../version.json'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_User
 * @method
 * @name get
 * @description get user of login from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.get = function (req, res, next) {
  var obj = {},
    login_token = req.signedCookies.auth_token,
    sql =
      'SELECT ' +
      '  u.people_id AS ID, ' +
      '  u.login_name, ' +
      '  u.language, ' +
      '  CASE WHEN p.first_name IS NOT NULL THEN p.first_name || \' \' ELSE \'\' END || p.last_name AS owner_name ' +
      'FROM ' +
      '  users_login u ' +
      '  LEFT JOIN people p ON u.people_id = p.id ' +
      'WHERE ' +
      '  u.login_token = $1';
  try {
    postgres.select(sql, [login_token], req).then(
      function (result) {
        var row = tools.getSingleResult(result);
        obj.id = row.id;
        obj.loginName = row.login_name;
        obj.language = row.language;
        obj.ownerName = row.owner_name;
        obj.version = version.app;
        obj.env = conn.getEnv();
        res.json(obj);
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
 * @memberof __Server_REST_API_User
 * @method
 * @name create
 * @description create user into DB users_login table
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.create = function (req, res) {
  tools.insertUser(req, res, {first_name: 'Martin', last_name: 'Boháč', login: 'developer', password: 'developer'});
};

/**
 * @memberof __Server_REST_API_User
 * @method
 * @name update
 * @description user update to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.update = function (req, res, next) {
  req.assert('language', 'Language not found').notEmpty();
  var errors = req.validationErrors(),
    sql = 'UPDATE USERS_LOGIN set language = $2::varchar WHERE LOGIN_TOKEN = $1::varchar',
    loginToken = req.signedCookies.auth_token;
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    postgres.executeSQL(req, res, sql, [loginToken, decodeURIComponent(req.body.language)]).then(
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

/**
 * @memberof __Server_REST_API_User
 * @method
 * @name list
 * @description get users list from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.list = function (req, res, next) {
  var sql =
    'SELECT ' +
    '  p.id, p.first_name||\' \'||p.last_name as name ' +
    'FROM ' +
    '  people p, ' +
    '  users_login u ' +
    'WHERE ' +
    '  p.id = u.people_id ' +
    'ORDER BY ' +
    '  p.last_name';
  try {
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
 * @memberof __Server_REST_API_User
 * @method
 * @name listWithoutOwner
 * @description get users list from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.listWithoutOwner = function (req, res, next) {
  var loginToken = req.signedCookies.auth_token,
    sql =
      'SELECT ' +
      '  p.id, p.first_name||\' \'||p.last_name as name ' +
      'FROM ' +
      '  people p, ' +
      '  users_login u ' +
      'WHERE ' +
      '  p.id = u.people_id AND ' +
      '  (u.login_token <> $1 OR u.login_token IS NULL) ' +
      'ORDER BY ' +
      '  p.last_name';
  try {
    postgres.select(sql, [loginToken], req).then(
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
 * @memberof __Server_REST_API_User
 * @method
 * @name getCurrentUser
 * @description get current users / app
 * @param req {Object} request reference object
 * @returns Object
 */
exports.getCurrentUser = function (req) {
  return {id: null};
};
