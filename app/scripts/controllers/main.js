/*jslint node: true, unparam: true */
'use strict';

/**
 * @file main
 * @fileOverview MainCtrl
 */

/**
 * @namespace MainCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('MainCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$route', '$translate', '$translatePartialLoader', 'Admin', 'Constants', 'Tools', 'UsersService', 'SocketFactory', 'AlertsService', 'AuthenticationService', 'MessengerService',
    function ($scope, $rootScope, $timeout, $http, $route, $translate, $translatePartialLoader, Admin, Constants, Tools, UsersService, SocketFactory, AlertsService, AuthenticationService, MessengerService) {
      $translatePartialLoader.addPart('global');
      $translate.refresh();

      $scope.LANGUAGE_KEYS = Constants.LANGUAGE_KEYS;
      $scope.alertsMain = [];

      /**
       * @memberof MainCtrl
       * @method
       * @name exportToExcel
       * @description export to excel
       * @param url {String} url
       * @param obj {Object} object for export
       * @returns void
       */
      $scope.exportToExcel = function (url, obj) {
        var items = [], element, blob, urlLocal;
        items = Tools.objectWithBooleanToArray(obj);
        $http.post(url, {items: items})
          .then(function (result) {
            if (result.data.message && result.data.message.type === Constants.MESSAGE_ERROR_MODAL) {
              AlertsService.add({
                type: Constants.MESSAGE_ERROR_MODAL,
                message: 'INFO_EXPORT_ERROR',
                message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                title: 'ERROR'
              });
            } else {
              blob = new Blob([result.data], {type: "application/vnd.openxmlformats"});
              //urlLocal = window.URL.createObjectURL(blob);
              window.navigator.msSaveOrOpenBlob(blob, "filename.xlsx");
              /*element = angular.element('#downloadExcel');
               element.attr({
               href: urlLocal,
               download: 'excel.xlsx'
               })[0].click(); */
            }
          });
      };

      /**
       * @memberof MainCtrl
       * @method
       * @name changeLanguage
       * @description set search after enter
       * @param key {String} key for language
       * @returns void
       */
      $scope.changeLanguage = function (key) {
        // set property for event $localeChangeSuccess
        $rootScope.meta.language = key;
        // save into database
        UsersService.saveLanguage(key);
        // set translate and load i18 file
        Tools.setLanguage(key).then(function () {
          $route.reload();
        });
      };

      /**
       * @memberof MainCtrl
       * @method
       * @name createUser
       * @description create user
       * @returns void
       */
      $scope.createUser = function () {
        Admin.createUser(function (data) {
          $scope.alertsMain.push(data);
        });
      };

      // Sockets
      SocketFactory.on('send:message', function (message) {
        var msg = $scope.prepareSocketMessage(message);
        AlertsService.add(msg);
      });

      /**
       * @memberof MainCtrl
       * @method
       * @name sendSocket
       * @description send socket
       * @returns void
       */
      $scope.sendSocket = function () {
        SocketFactory.emit('send:message',
          {
            type: 'ERROR',
            message: 'Test klient'
          },
          function (result) {
            console.log(result);
          });
      };

      /**
       * @memberof MainCtrl
       * @method
       * @name prepareSocketMessage
       * @description prepare message from socket
       * @param message {Object} message
       * @returns Object
       */
      $scope.prepareSocketMessage = function (message) {
        var alerts = [], exist = false, i, l;
        if (message.type === Constants.MESSAGE_WARNING_MODAL_CONN_LOST) {
          alerts = AlertsService.getModal();
          for (i = 0, l = alerts.length; i < l; i += 1) {
            if (alerts[i].type === Constants.MESSAGE_WARNING_MODAL_CONN_LOST) {
              exist = true;
            }
          }
          message = exist ? null : $scope.createConnectionLostMessage();
        }
        return message;
      };

      /**
       * @memberof MainCtrl
       * @method
       * @name createConnectionLostMessage
       * @description create message for connection lost event
       * @returns Object
       */
      $scope.createConnectionLostMessage = function () {
        var timeout, messageObj;
        timeout = $timeout(function () {
          AlertsService.deleteType(Constants.MESSAGE_WARNING_MODAL_CONN_LOST);
          AlertsService.closeModalMessage();
          MessengerService.setData({message: Constants.MESSAGE_TEXT_CONNECTION_LOST});
          AuthenticationService.logout();
        }, Constants.CONNECTION_LOST_TIME_LOGOUT);
        messageObj = {prefix: Constants.MESSAGE_TEXT_CONNECTION_SOON_LOST2, text: '', sufix: Constants.MESSAGE_TEXT_CONNECTION_SOON_LOST3};
        Tools.timer(messageObj, 'text', 60000);
        return {
          type: Constants.MESSAGE_WARNING_MODAL_CONN_LOST,
          title: Constants.MESSAGE_TEXT_CONNECTION_SOON_LOST_TITLE,
          //message: Constants.MESSAGE_TEXT_CONNECTION_SOON_LOST,
          messageObj: messageObj,
          cancelButton: {
            name: Constants.MESSAGE_TEXT_NO,
            onClick: function () {
              $timeout.cancel(timeout);
              AuthenticationService.logout();
            }
          },
          buttons: [
            {
              name: Constants.MESSAGE_TEXT_YES,
              onClick: function () {
                $timeout.cancel(timeout);
                AuthenticationService.sendConnectionRefresh();
              }
            },
            {
              name: Constants.MESSAGE_TEXT_NO,
              onClick: function () {
                $timeout.cancel(timeout);
                AuthenticationService.logout();
              }
            }
          ]
        };
      };
    }]);

