/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_pipeline
 * @fileOverview dashboardPipeline
 */

/**
 * @namespace dashboardPipeline
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardPipeline', function () {
    return {
      templateUrl: 'views/directives/dashboard_pipeline.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the dashboardPipeline directive');
      }
    };
  });
