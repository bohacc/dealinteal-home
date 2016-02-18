/*jslint node: true, unparam: true */
'use strict';

/**
 * @file task_people
 * @fileOverview __Server_REST_API_Task_People
 */

/**
 * @namespace __Server_REST_API_Task_People
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Task_People
 * @method
 * @name delete
 * @description delete from task_people all people with task_id
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * conn {Object} object with connection
 * @returns Promise
 */
exports.delete = function (req, res, obj, conn) {
  var sql = 'DELETE FROM TASK_PEOPLE WHERE TASK_ID = $1';
  try {
    return postgres.executeSQL(req, res, sql, [obj.taskId], null, conn);
  } catch (e) {
    return constants.E500;
  }
};

/**
 * @memberof __Server_REST_API_Task_People
 * @method
 * @name smartInsert
 * @description smart insert task_people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.smartInsert = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    var vals,
      sql = 'INSERT INTO TASK_PEOPLE (task_id, people_id, start_date, due_date) VALUES ($1, $2, $3, $4)';

    try {
      if (!obj.taskId || !obj.peopleId) {
        resolve();
        return;
      }

      vals = [obj.taskId, obj.peopleId, obj.startDate, obj.dueDate];
      postgres.executeSQL(req, res, sql, vals, null, conn).then(
        function () {
          resolve(obj);
        },
        function (result) {
          reject(constants.E500);
        }
      );
    } catch (e) {
      reject(constants.E500);
    }
  });
};
