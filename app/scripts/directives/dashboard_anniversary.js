/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_anniversary
 * @fileOverview dashboardAnniversary
 */

/**
 * @namespace dashboardAnniversary
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardAnniversary', function () {
    return {
      templateUrl: 'views/directives/dashboard_anniversary.html',
      restrict: 'E',
      controller: 'DashboardAnniversaryCtrl',
      scope: {}
    };
  });
