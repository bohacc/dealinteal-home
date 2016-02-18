/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_agenda
 * @fileOverview dashboardAgenda
 */

/**
 * @namespace dashboardAgenda
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardAgenda', function () {
    return {
      templateUrl: 'views/directives/dashboard_agenda.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the dashboardAgenda directive');
      }
    };
  });
