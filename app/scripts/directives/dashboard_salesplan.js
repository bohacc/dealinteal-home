/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_salesplan
 * @fileOverview dashboardSalesplan
 */

/**
 * @namespace dashboardSalesplan
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardSalesplan', function () {
    return {
      templateUrl: 'views/directives/dashboard_salesplan.html',
      restrict: 'E',
      controller: 'DashboardSalesPlanCtrl',
      scope: {}
    };
  });
