/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 16.10.2014.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file messages
 * @fileOverview __Server_Messages
 */

/**
 * @namespace __Server_Messages
 * @author Martin Boháč
 */

var constants = require('./constants'),
  socketio = require('./socketio');

/**
 * @memberof __Server_Messages
 * @method
 * @name sendInform
 * @description send information to users
 * @param obj {Object}
 * @returns void
 */
exports.sendInform = function (obj) {
  var i, l;
  //console.log('sendInform');
  for (i = 0, l = obj.types.length; i < l; i += 1) {
    // internal message
    if (obj.types[i] === constants.MESSAGE_TYPE_INTERNAL) {
      //console.log('sendInform - internal');
      socketio.sendForUsers(obj.messages);
    }
  }
};