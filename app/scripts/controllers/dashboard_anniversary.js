/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file dashboard_anniversary
 * @fileOverview DashboardAnniversaryCtrl
 */

/**
 * @namespace DashboardAnniversaryCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('DashboardAnniversaryCtrl', ['$scope', '$location', 'PeopleService', 'MessengerService', 'Constants', 'Tools',
    function ($scope, $location, PeopleService, MessengerService, Constants, Tools) {
      var empty = {count: 0, records: []};
      $scope.dashboard = {};

      // Run
      PeopleService.anniversaryCount().then(
        function (result) {
          $scope.dashboard.count = result.data.count;
        }
      );
      PeopleService.anniversaryToday().then(
        function (result) {
          $scope.dashboard.today = result.data || empty;
        }
      );
      PeopleService.anniversaryTomorrow().then(
        function (result) {
          $scope.dashboard.tomorrow = result.data || empty;
        }
      );
      PeopleService.anniversaryAfterTomorrow().then(
        function (result) {
          $scope.dashboard.afterTomorrow = result.data || empty;
        }
      );
      PeopleService.anniversaryNextDays().then(
        function (result) {
          $scope.dashboard.nextDays = result.data || empty;

        }
      );
    }]);
