/*jslint node: true */
'use strict';

/**
 * @file dashboard_sales_plan
 * @fileOverview DashboardSalesPlanCtrl
 */

/**
 * @namespace DashboardSalesPlan
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('DashboardSalesPlanCtrl', function ($scope) {
    $scope.chartLabels = ['Plán', ''];
    $scope.chartData = ['500', '200'];
    $scope.chartLegend = true;
    $scope.chartColours = ['#5CB85C', '#FFFFFF'];
    $scope.chartOptions = {
      tooltipFillColor: '#000',
      responsive: true,
      showTooltips: false
    };
  });
