/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file socket
 * @fileOverview __Server_Socket
 */

/**
 * @namespace __Server_Socket
 * @author Martin Boháč
 */

var socketIOConnections = [],
  cookieParser = require('cookie-parser'),
  socketio = require('./socketio'),
  constants = require('./constants'),
  tools = require('./tools');

/**
 * @memberof __Server_Socket
 * @method
 * @name init
 * @description initiaization socket monitor
 * @returns void
 */
exports.init = function (io) {
  var userConnect;
  // middleware
  io.use(function (socket, next) {
    var data = socket.request, expressSidKey = 'express.sid', expressAuthToken = 'auth_token', sessionID, authToken;
    if (!data.headers.cookie) {
      return next('No cookie given.', false);
    }

    cookieParser(constants.SECRET)(data, {}, function (parseErr) {
      if (parseErr) {
        return next('Error parsing cookies.', false);
      }
      sessionID = (data.secureCookies && data.secureCookies[expressSidKey]) ||
        (data.signedCookies && data.signedCookies[expressSidKey]) ||
        (data.cookies && data.cookies[expressSidKey]);
      authToken = (data.secureCookies && data.secureCookies[expressAuthToken]) ||
        (data.signedCookies && data.signedCookies[expressAuthToken]) ||
        (data.cookies && data.cookies[expressAuthToken]);
      socket.handshake.authToken = authToken; // Add it to the socket object
      socket.handshake.sid = sessionID; // Add it to the socket object
      /*data.sessionID = connect.utils.parseSignedCookie(data.cookie['express.sid'], constants.SECRET);
       if (data.cookie['express.sid'] == data.sessionID) {
       return accept('Cookie is invalid.', false);
       }*/

      socket.on('disconnect', function () {
        //console.log('disconnect');
        socketio.deleteSocketConnectionsForSession(sessionID);
      });

      // save socketIO connection
      userConnect = {authToken: socket.handshake.authToken || '', session: socket.handshake.sid};
      socketIOConnections[socket.id] = {socket: socket, userConnect: userConnect};

      next(null, true);
      /*if (authToken) {
        next(null, true);
      } else {
        next('Error', false);
      };*/
    });
  });
  // new connection
  io.sockets.on('connection', function (socket) {
  //io.on('connection', function (socket) {
    // broadcast a user's message to other users
    //console.log('connect');
    socket.on('send:message', function (data) {
      //console.log('ON send:message data:' + data.message);
      socket.broadcast.emit('send:message', {
        type: 'ERROR',
        message: data.message
      });
    });

    socket.on('disconnect', function () {
      //console.log('disconnect 2');
      delete socketIOConnections[socket.id];
    });

    // save socketIO connection
    //userConnect = {authToken: socket.handshake.authToken || '', session: socket.handshake.sid};
    //socketIOConnections[socket.id] = {socket: socket, userConnect: userConnect};
  });
};

/**
 * @memberof __Server_Socket
 * @method
 * @name init
 * @description initiaization socket monitor
 * @returns Number
 */
exports.getLoginUsersCount = function (socket, io) {
  return socketIOConnections.length;
};

/**
 * @memberof __Server_Socket
 * @method
 * @name sendForUsers
 * @description send messages for users
 * @param users {Array} array of users tokens
 * @param messages
 * @returns void
 */
exports.sendForUsers = function (messages) {
  var socket = {}, i, l, e, j, token;
  //console.log('sendForUsers');
  //console.log(messages);
  for (i = 0, l = messages.length; i < l; i += 1) {
    for (e = 0, j = messages[i].users.length; e < j; e += 1) {
      token = messages[i].users[e];
      //console.log(token);
      socket = socketio.getSocket(token);
      if (socket && socket.emit) {
        //console.log('emit message');
        //console.log(messages[i].message);
        socket.emit('send:message', messages[i].message);
      }
    }
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name getSocket
 * @description get socket from array
 * @param token {String} token for user login
 * @returns Object
 */
exports.getSocket = function (token) {
  var key, socket = {};
  //console.log('getSocket A');
  //console.log(socketIOConnections);
  //console.log('getSocket B');
  for (key in socketIOConnections) {
    if (socketIOConnections.hasOwnProperty(key)) {
      //console.log(socketIOConnections[key]);
      if (socketIOConnections[key].userConnect.authToken === token) {
        socket = socketIOConnections[key].socket;
        break;
      }
    }
  }
  return socket;
};

/**
 * @memberof __Server_Socket
 * @method
 * @name getSocketConnections
 * @description get all verify socket
 * @returns Object
 */
exports.getSocketConnections = function () {
  return socketIOConnections;
};

/**
 * @memberof __Server_Socket
 * @method
 * @name deleteSocketConnectionsItem
 * @description delete socket from stack
 * @returns void
 */
exports.deleteSocketConnectionsToken = function (token) {
  var key;
  for (key in socketIOConnections) {
    if (socketIOConnections.hasOwnProperty(key)) {
      if (socketIOConnections[key].userConnect.authToken === token) {
        socketIOConnections[key].userConnect.authToken = '';
      }
    }
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name deleteSocketConnectionsItem
 * @description delete socket from stack
 * @returns void
 */
exports.deleteSocketConnectionsForSession = function (session) {
  var key;
  for (key in socketIOConnections) {
    if (socketIOConnections.hasOwnProperty(key)) {
      if (socketIOConnections[key].userConnect.session === session) {
        delete socketIOConnections[key];
      }
    }
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name putTokenToSessionSocket
 * @description put token to session socket
 * @param token {String} token for current user
 * @param session {String} session for current user
 * @returns void
 */
exports.putTokenToSessionSocket = function (token, session) {
  var key;
  //console.log('putTokenToSessionSocket');
  //console.log(token);
  //console.log(session);
  try {
    for (key in socketIOConnections) {
      if (socketIOConnections.hasOwnProperty(key)) {
        if (socketIOConnections[key].userConnect.session === session) {
          socketIOConnections[key].userConnect.authToken = token;
          //socketIOConnections[key].socket.reconnect();
          //console.log('update socket');
          //return;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name sendForAllUsers
 * @description send messages for all users
 * @param messages {Object} messages
 * @returns void
 */
exports.sendForAllUsers = function (messages) {
  var socket = {}, i, l, token, key;
  for (i = 0, l = messages.length; i < l; i += 1) {
    for (key in socketIOConnections) {
      if (socketIOConnections.hasOwnProperty(key)) {
        token = socketIOConnections[key].userConnect.authToken;
        socket = socketio.getSocket(token);
        if (socket && socket.emit) {
          socket.emit('send:message', messages[i].message);
        }
      }
    }
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name sendForCurrentUser
 * @description send messages for current user
 * @param req {Object} request reference object
 * @param messages {Object} messages
 * @returns void
 */
exports.sendForCurrentUser = function (req, messages) {
  var socket = socketio.getSocket(req.signedCookies.auth_token);
  if (socket && socket.emit) {
    socket.emit('send:message', messages);
  }
};

/**
 * @memberof __Server_Socket
 * @method
 * @name sendForCurrentUser
 * @description send messages for current user
 * @param req {Object} request reference object
 * @param callback {Function} callback
 * @returns void
 */
exports.listenCurrentUser = function (req, callback) {
  var socket = socketio.getSocket(req.signedCookies.auth_token);
  if (socket && socket.on) {
    socket.on('send:message', callback);
  }
};