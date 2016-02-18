/**
 * Created by Martin on 29.11.13.
 */
/*jslint node: true, unparam: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_PG_API
 */

/**
 * @namespace __Server_PG_API
 * @author Martin Boháč
 */

var pg = require('pg'),
  Transaction = require('pg-transaction'),
  Promise = require('promise'),
  constants = require('./constants'),
  permission = require('./permission'),
  tools = require('./tools'),
  users = require('./users'),
  conn = require('./connections');

/**
 * @memberof __Server_PG_API
 * @method
 * @name select
 * @description select sql via PG framework
 * @param sql {String} sql text
 * @param vals {Array} vals for sql binding
 * @param req {Object} request reference object
 * @param connect {Object} connect object
 * @returns Promise
 */
exports.select = function (sql, vals, req, connect) {
  return new Promise(function (resolve, reject) {
    try {
      var connection = connect || conn.getConnection(req),
        client,
        perm,
        method,
        permForUser;
      if (connection && Object.keys(connection).length > 0) {
        client = new pg.Client(connection);

        // connection
        client.connect(function (err) {
          if (err) {
            reject(constants.PG_CONNECT_ERROR);
            return console.error(constants.PG_CONNECT_ERROR, err);
          }

          // load permission data
          method = permission.getMethodFromSql(sql);
          client.query(permission.SQL_PERMISSION, [connection.appUserId, method], function (err, result) {
            permForUser = tools.getMultiResult(result);
            if (err) {
              reject(constants.PG_RUNNING_QUERY_ERROR);
              client.end();
              return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
            }

            // add permission
            perm = permission.prepare(sql, permForUser, connection, [], method);
            if (perm.err) {
              reject(constants.PG_RUNNING_QUERY_ERROR_PERMISSION);
              client.end();
              return console.error(constants.PG_RUNNING_QUERY_ERROR_PERMISSION, err);
            }

            // exec sql
            client.query(perm.sql, vals, function (err, result) {
              if (err) {
                reject(constants.PG_RUNNING_QUERY_ERROR);
                client.end();
                return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
              }
              client.end();
              resolve(result);
            });
          });

        });
      } else {
        reject(constants.PG_CONNECT_ERROR);
      }
    } catch (e) {
      reject(constants.PG_CONNECT_ERROR);
    }
  });
};

/**
 * @memberof __Server_PG_API
 * @method
 * @name select
 * @description select sql via PG framework
 * @param sql {String} sql text
 * @param vals {Array} vals for sql binding
 * @returns Promise
 */
exports.selectLoggingDB = function (sql, vals) {
  return new Promise(function (resolve, reject) {
    var connection = conn.getConnectionToLoggingDB(),
      client;
    if (connection) {
      client = new pg.Client(connection);
      // connection
      client.connect(function (err) {
        if (err) {
          reject(constants.PG_CONNECT_ERROR);
          return console.error(constants.PG_CONNECT_ERROR, err);
        }
        client.query(sql, vals, function (err, result) {
          if (err) {
            reject(constants.PG_RUNNING_QUERY_ERROR);
            client.end();
            return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
          }
          client.end();
          resolve(result);
        });
      });
    } else {
      reject(constants.PG_CONNECT_ERROR);
    }
  });
};

/**
 * @memberof __Server_PG_API
 * @method
 * @name executeSQL
 * @description execute sql via PG framework
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param sql {String} sql text
 * @param vals {Array} vals for sql binding
 * @param connect {Object} object with connection
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.executeSQL = function (req, res, sql, vals, connect, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var connection, client, tx, perm;
      tx = obj ? obj.tx : null;
      // TRANSACTION
      if (tx) {
        // add permission
        //perm = permission.prepare(sql, [], obj.connection, vals);
        tx.query(sql, vals, function (err, result) {
          if (err) {
            tx.rollback('SP', function (err) {
              if (err) {
                reject(constants.PG_RUNNING_QUERY_ERROR);
                return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
              }
              if (obj.client) {
                obj.client.end();
              }
            });
            reject(constants.PG_RUNNING_QUERY_ERROR);
            return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
          }
          resolve('execute sql');
        });
      } else { // INSTANCE CONNECTION
        connection = connect || conn.getConnection(req);
        if (connection && Object.keys(connection).length > 0) {
          client = new pg.Client(connection);
          // connection
          client.connect(function (err) {
            if (err) {
              reject(constants.PG_CONNECT_ERROR);
              return console.error(constants.PG_CONNECT_ERROR, err);
            }

            // add permission
            //perm = permission.prepare(sql, [], connection, vals);

            client.query(sql, vals, function (err, result) {
              if (err) {
                client.end();
                reject(constants.PG_RUNNING_QUERY_ERROR);
                return console.error(constants.PG_RUNNING_QUERY_ERROR, err);
              }
              client.end();
              resolve('execute sql');
            });
          });

        } else {
          reject(constants.PG_CONNECT_ERROR);
        }
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_PG_API
 * @method
 * @name createTransaction
 * @description create DB transaction
 * @param req {Object} request reference object
 * @returns Object
 */
exports.createTransaction = function (req) {
  var client, tx, die, connection;
  die = function (err) {
    if (err) {
      throw err;
    }
  };
  connection = conn.getConnection(req);
  client = new pg.Client(connection);
  client.connect();
  tx = new Transaction(client);
  tx.begin(null, null);
  tx.savepoint('SP', die);
  tx.on('error', die);
  return {tx: tx, client: client, connection: connection};
};
