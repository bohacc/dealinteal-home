/*jslint node: true, unparam: true */
'use strict';

/**
 * @file pillsNotia
 * @fileOverview pillsNotia
 */

/**
 * @namespace pillsNotia
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .directive('pillsNotia', function () {
    return {
      templateUrl: 'views/directives/d_pills.html',
      restrict: 'E',
      replace: true,
      scope: {
        items: '=',
        active: '=',
        name: '@'
      },
      link: function postLink(scope, element, attrs) {
        scope.setActive = function (index) {
          var i, l;
          for (i = 0, l = (scope.items || []).length; i < l; i += 1) {
            scope.items[i].active = index === i;
            if (scope.items[i].active) {
              scope.active = i;
            }
          }
        };
        scope.setActive(parseInt(scope.active, 10));
        scope.$watch('items[0].hash', function (oldValue, newValue) {
          if (oldValue !== newValue) {
            if (scope.items[scope.active].hide && scope.items[scope.active].hide()) {
              scope.setActive(0);
            }
          }
        }, true);
      }
    };
  });
