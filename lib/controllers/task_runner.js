/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 16.10.2014.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file task_runner
 * @fileOverview __Server_taskRunner
 */

/**
 * @namespace __Server_taskRunner
 * @author Martin Boháč
 */

var socketio = require('./socketio'),
  taskRunner = require('./task_runner'),
  constants = require('./constants'),
  messages = require('./messages'),
  tasks = require('./tasks'),
  msExchange = require('./ms_exchange'),
  conn = require('./connections'),
  NanoTimer = require('nanotimer'),
  monitorDefStack = [];

/**
 * @memberof __Server_taskRunner
 * @method
 * @name init
 * @description initiaization monitor for database events
 * @returns void
 */
exports.init = function () {
  //console.log('init');
  monitorDefStack = [];
  taskRunner.add({dataLoader: tasks.events, messageTypes: [constants.MESSAGE_TYPE_INTERNAL], delay: 10000});
  taskRunner.add({dataLoader: msExchange.exchangeSynchronize, messageTypes: [constants.MESSAGE_TYPE_INTERNAL], delay: 10000});
  taskRunner.timer();
};

/**
 * @memberof __Server_taskRunner
 * @method
 * @name add
 * @description add monitor for database events
 * @param obj {Object}
 * @returns void
 */
exports.add = function (obj) {
  monitorDefStack.push(obj);
};

/**
 * @memberof __Server_taskRunner
 * @method
 * @name timer
 * @description timer for search events in DB
 * @returns void
 */
exports.timer = function () {
  var i, l, item, callback, connect, nanoTimer, meta;
  connect = conn.getConnectionForEventMonitor();

  callback = function (item) {
    return function (result) {
      messages.sendInform({types: item.messageTypes, messages: result});
    };
  };

  for (i = 0, l = monitorDefStack.length; i < l; i += 1) {
    item = monitorDefStack[i];
    meta = {task: item, callback: callback(item)};
    nanoTimer = new NanoTimer();
    nanoTimer.setInterval(
      item.dataLoader,
      [connect, meta],
      item.delay + 'm'
    );
  }
};
