/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_activity
 * @fileOverview dashboardActivity
 */

/**
 * @namespace dashboardActivity
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardActivity', function () {
    return {
      templateUrl: 'views/directives/dashboard_activity.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the dashboardActivity directive');
      }
    };
  });
