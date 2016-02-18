/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file SocketFactory
 * @fileOverview SocketFactory
 */

/**
 * @namespace SocketFactory
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .factory('SocketFactory', ['$rootScope', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      },
      reconnect: function (id) {
        console.log('reconnect');
        console.log(id);
        console.log(socket);
        //socket.disconnect();
      },
      disconnect: function () {
        socket.disconnect();
      }
    };
  }]);
