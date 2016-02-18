/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 11.09.2014.
 */
/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file connections
 * @fileOverview __Server_Connections
 */

/**
 * @namespace __Server_Connections
 * @author Martin Boháč
 */

var connections = [],
  env,
  clientDBDevelopment = null,
  Promise = require('promise'),
  tools = require('./tools'),
  auth = require('./authentication'),
  postgres = require('./api_pg'),
  constants = require('./constants'),
  socketio = require('./socketio'),
  conn = require('./connections');

/**
 * @memberof __Server_Connections
 * @method
 * @name setEnv
 * @description set NODE_ENV
 * @param str {String} string for ENV
 * @returns void
 */
exports.setEnv = function (str) {
  env = str;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getEnv
 * @description get NODE_ENV
 * @returns String
 */
exports.getEnv = function () {
  return env;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name ConnObj
 * @description object for instances connections
 * @param obj {Object} object with connection data
 * @returns void
 */
exports.ConnObj = function (obj) {
  this.loginToken = obj.loginToken;
  this.id = obj.id;
  this.user = obj.user;
  this.password = obj.password;
  this.database = obj.database;
  this.host = obj.host;
  this.port = obj.port;
  this.connectString = obj.connectString;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name connect
 * @description application login user, create client token and save to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.connect = function (req, res) {
  var credentials = tools.prepareCredentials(req);
  conn.getConnInfoFromLoggingDB(credentials).then(
    function (result) {
      if (result && JSON.stringify(result) !== '{}') {
        // add information for connection from logging dB
        tools.updateCredentials(credentials, result);
        // add internalToken for permission non check
        credentials.internalToken = constants.INTERNAL_TOKEN;
        // connect to DB
        auth.signin(credentials, req, res).then(
          function (obj) {
            if (obj.success) {
              // save current login
              credentials.loginToken = obj.loginToken;
              credentials.appUserId = obj.appUserId;
              // delete property internal token added only for permission
              delete credentials.internalToken;
              conn.addConnection(credentials);
            }
            res.json({success: obj.success, socketid: obj.socketid});
          },
          function (result) {
            res.json({message: {type: constants.MESSAGE_ERROR, message: constants.MESSAGE_CONNECT_INVALID_USERNAME_OR_PASSWORD + ' (' + result + ')'}});
          }
        );
      } else {
        res.json({message: {type: constants.MESSAGE_ERROR, message: constants.MESSAGE_CONNECT_INVALID_CONNECT_STRING + ' (connection not found)'}});
      }
    },
    function (result) {
      res.json({message: {type: constants.MESSAGE_ERROR, message: constants.MESSAGE_CONNECT_INVALID_CONNECT_STRING + ' (' + result + ')'}});
    }
  );
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnection
 * @description get connection to DB
 * @param req {Object} request reference object
 * @returns Object
 */
exports.getConnection = function (req) {
  var i, l, connect = {}, loginToken, internalToken;
  loginToken = tools.getLoginToken(req);
  internalToken = req.internalToken;
  // !!! All connection for DEVELOPMENT env is connected with this connection !!!
  /*if (conn.getEnv() === 'development') {
    connect = {
      user: 'notia_user',
      appUserId: 6,
      password: 'notia',
      database: 'dit_develop',
      host: 'localhost',
      port: 5432,
      clientDB: clientDBDevelopment
    };
  } else */
  if (internalToken === constants.INTERNAL_TOKEN) {
    connect = {
      user: 'notia_user',
      appUserId: null,
      password: 'notia',
      database: 'dit_develop',
      host: 'localhost',
      port: 5432,
      clientDB: clientDBDevelopment
    };
    connect = req.connect || connect;
  } else {
    // search connection on PRODUCTION
    for (i = 0, l = connections.length; i < l; i += 1) {
      if (connections[i].loginToken === loginToken) {
        connect = connections[i];
        break;
      }
    }
  }

  // for developing
  if (!connect.loginToken && conn.getEnv() === 'development') {
    connect = {
      user: 'notia_user',
      appUserId: 6,
      password: 'notia',
      database: 'dit_develop',
      host: 'localhost',
      port: 5432,
      clientDB: clientDBDevelopment
    };
  }
  return connect;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnectionForEventMonitor
 * @description get connection to DB for event monitor
 * @returns Object
 */
exports.getConnectionForEventMonitor = function () {
  var connect = {
    user: 'event_monitor',
    appUserId: null,
    password: 'developer',
    database: 'dit_develop',
    host: 'localhost',
    port: 5432,
    internalToken: constants.INTERNAL_TOKEN
  };
  return connect;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name setConnectionClientDB
 * @description set connection to DB
 * @param req {Object} request reference object
 * @param client {Object} client instance for DB
 * @returns void
 */
exports.setConnectionClientDB = function (req, client) {
  var i, l, loginToken;
  loginToken = tools.getLoginToken(req);
  if (conn.getEnv() === 'development') {
    clientDBDevelopment = client;
  } else {
    // search connection on PRODUCTION
    for (i = 0, l = connections.length; i < l; i += 1) {
      if (connections[i].loginToken === loginToken) {
        connections[i].clientDB = client;
        break;
      }
    }
  }
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnectionString
 * @description get connectionString to DB
 * @param req {Object} request reference object
 * @returns Object
 */
exports.getConnectionString = function (obj) {
  return 'postgres://' + obj.user + ':' + obj.password + '@' + obj.host + ':' + obj.port + '/' + obj.database;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnectionToLoggingDB
 * @description get connection to logging DB, persist
 * @returns Object
 */
exports.getConnectionToLoggingDB = function () {
  return {
    user: 'notia_user_logging',
    appUserId: null,
    password: 'notia',
    database: 'dit_logging',
    host: 'localhost',
    port: 5432,
    clientDB: null
  };
};

/**
 * @memberof __Server_Connections
 * @method
 * @name removeConnection
 * @description remove connection instance from connection stack
 * @param req {Object} request reference object
 * @returns void
 */
exports.removeConnection = function (req) {
  try {
    var loginToken = tools.getLoginToken(req), i;
    for (i = 0; i < connections.length; i += 1) {
      if (loginToken === connections[i].loginToken) {
        connections.splice(i, 1);
        return;
      }
    }
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * @memberof __Server_Connections
 * @method
 * @name addConnection
 * @description push connection instance to connection stack
 * @param credentials {Object} credentials data
 * @returns void
 */
exports.addConnection = function (credentials) {
  try {
    connections.push({
      loginToken: credentials.loginToken,
      id: credentials.id,
      user: credentials.user,
      appUserId: credentials.appUserId,
      password: credentials.password,
      database: credentials.database,
      host: credentials.host,
      port: credentials.port,
      connectString: credentials.connectString
    });
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnInfoFromLoggingDB
 * @description push connection instance to connection stack
 * @param credentials {Object} credentials data
 * @returns Promise
 */
exports.getConnInfoFromLoggingDB = function (credentials) {
  var sql = 'SELECT * FROM connections c WHERE connect_string = $1';
  return new Promise(function (resolve, reject) {
    postgres.selectLoggingDB(sql, [credentials.connectString]).then(
      function (result) {
        resolve(tools.getSingleResult(result));
      },
      function (result) {
        reject({});
      }
    );
  });
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnectionForExportImportAPI
 * @description get connection for export / import API
 * @param req {Object} object of request
 * @param obj {Object} obj
 * @returns Promise
 */
exports.getConnectionForExportImportAPI = function (req, obj) {
  var connection;
  connection = new conn.ConnObj({connectString: obj.connectString, password: constants.PASSWORD_FOR_EXPORT_IMPORT_API});
  return conn.getConnInfoFromLoggingDB(connection).then(
    function (result) {
      tools.updateCredentials(connection, result);
      connection.internalToken = req.body.hash;
      return connection;
    }
  );
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnectionForMsExchangeAPI
 * @description get connection for MS Exchange API
 * @returns Promise
 */
exports.getConnectionForMsExchangeAPI = function () {
  var connection;
  connection = new conn.ConnObj({connectString: constants.MS_EXCHANGE_CONNECT_STRING, password: constants.PASSWORD_FOR_EXPORT_IMPORT_API});
  return conn.getConnInfoFromLoggingDB(connection).then(
    function (result) {
      tools.updateCredentials(connection, result);
      connection.internalToken = constants.INTERNAL_TOKEN;
      return connection;
    }
  );
};
