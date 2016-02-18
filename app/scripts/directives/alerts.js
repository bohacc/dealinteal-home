/*jslint node: true, unparam: true */
'use strict';

/**
 * @file alerts
 * @fileOverview alerts
 */

/**
 * @namespace alerts
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('alerts', ['$timeout', 'AlertsService', function ($timeout, AlertsService) {
    /**
     * @memberof alerts
     * @method
     * @name directive
     * @description alerts
     * @param type {String} in constants
     * @param message {String} message for alert
     * @param prefix {String} prefix to front of the message
     * @param sufix {String} sufix to front of the message
     * @returns void
     */
    return {
      templateUrl: 'views/directives/d_alerts.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.alerts = AlertsService.get();
        scope.close = function (index) {
          if (scope.alerts.items) {
            scope.alerts.items.splice(index, 1);
          }
        };
      }
    };
  }]);
