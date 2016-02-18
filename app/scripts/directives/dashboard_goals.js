/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_goals
 * @fileOverview dashboardGoals
 */

/**
 * @namespace dashboardGoals
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardGoals', function () {
    return {
      templateUrl: 'views/directives/dashboard_goals.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the dashboardGoals directive');
      }
    };
  });
