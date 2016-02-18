/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_tasks
 * @fileOverview dashboardTasks
 */

/**
 * @namespace dashboardTasks
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardTasks', function () {
    return {
      templateUrl: 'views/directives/dashboard_tasks.html',
      restrict: 'E',
      controller: 'DashboardTaskCtrl',
      scope: {}
    };
  });
