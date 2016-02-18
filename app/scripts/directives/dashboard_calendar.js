/*jslint node: true, unparam: true */
'use strict';

/**
 * @file dashboard_calendar
 * @fileOverview dashboardCalendar
 */

/**
 * @namespace dashboardCalendar
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('dashboardCalendar', function () {
    return {
      templateUrl: 'views/directives/dashboard_calendar.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the dashboardCalendar directive');
      }
    };
  });
