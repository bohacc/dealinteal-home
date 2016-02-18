/*jslint node: true, unparam: true */
'use strict';

/**
 * @file authentication
 * @fileOverview __Server_REST_API_Authentication
 */

/**
 * @namespace __Server_REST_API_Authentication
 * @author Martin Boháč
 */

var crypto = require('crypto'),
  Promise = require('promise'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  connections = require('./connections'),
  socketio = require('./socketio'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Authentication
 * @method
 * @name signin
 * @description application login user, create client token and save to DB
 * @param credentials {Object} credentials object
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.signin = function (credentials, req, res) {
  var encryptedPassword,
    encrypted,
    vals;
  return new Promise(function (resolve, reject) {
    if (credentials && credentials.userApp && credentials.passwordApp) {
      encryptedPassword = crypto.createHmac('sha1', 'Notia.1*').update(credentials.passwordApp).digest('hex');
      vals = [credentials.userApp, encryptedPassword];
      // select with extra connect
      postgres.select("SELECT '1' AS EXIST, CURRENT_USER, people_id as \"appUserId\" FROM USERS_LOGIN u WHERE LOGIN_NAME = $1 AND LOGIN_PASSWORD = $2", vals, req, credentials).then(
        function (result) {
          var obj, row;
          row = tools.getSingleResult(result);
          obj = {success: row.exist === '1'};
          if (obj.success) {
            encrypted = crypto.createHmac('sha1', String(Math.round((new Date().valueOf() * Math.random())))).update(String(Math.round((new Date().valueOf() * Math.random())))).digest('hex');
            tools.createCookie(res, 'auth_token', encrypted, true, true);
            tools.createCookie(res, 'isLogged', 1, false, false);
            obj.loginToken = encrypted;
            obj.appUserId = row.appUserId;
            // execute with extra connect
            postgres.executeSQL(
              req,
              res,
              "UPDATE USERS_LOGIN SET LOGIN_TOKEN = $1,LOGIN_TOKEN_EXPIRATION = CURRENT_TIMESTAMP + '0.5 hour' WHERE LOGIN_NAME = $2",
              [encrypted, credentials.userApp],
              credentials
            ).then(
              function () {
                // put token to socket
                socketio.putTokenToSessionSocket(encrypted, req.signedCookies['express.sid']);
                obj.socketid = socketio.getSocket(encrypted).id;
                resolve(obj);
              }
            );
          } else {
            reject('error - invalid login or password');
          }
        },
        function () {
          reject('error signin');
        }
      );
    } else {
      reject('error - credentials and connect string not found');
    }
  });
};

/**
 * @memberof __Server_REST_API_Authentication
 * @method
 * @name logout
 * @description application logout user, delete DB token and cookie token
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.logout = function (req, res) {
  var obj = {logout: false},
    loginToken = req.signedCookies.auth_token;
  try {
    tools.deleteCookie(res, 'auth_token');
    tools.deleteCookie(res, 'isLogged');
    obj.logout = true;
    postgres.executeSQL(req, res, 'UPDATE USERS_LOGIN SET LOGIN_TOKEN_EXPIRATION = NULL,LOGIN_TOKEN = NULL WHERE LOGIN_TOKEN = $1', [loginToken]).then(
      function () {
        connections.removeConnection(req);
        socketio.deleteSocketConnectionsToken(loginToken);
        res.json(obj);
      },
      function (result) {
        tools.sendResponseError(result, res);
      }
    );
  } catch (e) {
    res.json({logout: false});
  }
};

/**
 * @memberof __Server_REST_API_Authentication
 * @method
 * @name alive
 * @description request for user connection alive
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.alive = function (req, res) {
  var expire = "CURRENT_TIMESTAMP + '0.5 hour'",
    loginToken = req.signedCookies.auth_token;
  postgres.executeSQL(req, res, "UPDATE USERS_LOGIN SET LOGIN_TOKEN_EXPIRATION = " + expire + " WHERE LOGIN_TOKEN = $1", [loginToken], null, null).then(
    function () {
      tools.sendResponseSuccess({}, res);
    },
    function () {
      tools.sendResponseError({}, res);
    }
  );
};
