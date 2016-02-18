/*jslint node: true, unparam: true */
'use strict';

/**
 * @file alerts_modal
 * @fileOverview alertsModal
 */

/**
 * @namespace alertsModal
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('alertsModal', ['$timeout', 'AlertsService', function ($timeout, AlertsService) {
    /**
     * @memberof alerts
     * @method
     * @name directive
     * @description alerts modal
     * @param type {String} in constants
     * @param message {String} primary message for alert
     * @param message2 {String} secondary message for alert
     * @param title {String} title for alert window
     * @param buttons {Array} array of objects for buttons for window
     * @returns void
     */
    return {
      templateUrl: 'views/directives/d_alerts_modal.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.items = AlertsService.getModal();
        scope.item = {};
        scope.isClicked = false;

        scope.cancel = function () {
          // cancel for confirm alert
          if (scope.item.cancelButton) {
            if (scope.item.cancelButton.onClick) {
              scope.item.cancelButton.onClick();
            }
          }
          scope.refresh();
        };

        scope.close = function () {
          // close for confirm alert
          if (scope.item.closeButton) {
            if (scope.item.closeButton.onClick) {
              scope.item.closeButton.onClick();
            }
          }
          scope.refresh();
        };

        $('#alertModal').on('hide.bs.modal', function (e) {
          scope.items.splice(0, 1);
          if (!scope.isClicked) {
            scope.cancel();
          }
          scope.isClicked = false;
        });

        scope.refresh = function () {
          if (scope.items.length > 0) {
            scope.item = scope.items[0];
            $('#alertModal').modal();
          }
        };

        scope.onClick = function (index) {
          scope.isClicked = true;
          scope.item.buttons[index].onClick();
        };

        // Watchers
        scope.$watch('items', function (oldValue, newValue) {
          if (oldValue !== newValue) {
            scope.refresh();
          }
        }, true);
      }
    };
  }]);
