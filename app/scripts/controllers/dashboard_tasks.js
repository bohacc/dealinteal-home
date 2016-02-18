/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file dashboard_task
 * @fileOverview DashboardTaskCtrl
 */

/**
 * @namespace DashboardTaskCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('DashboardTaskCtrl', ['$scope', '$location', 'TasksService', 'MessengerService', 'Constants',
    function ($scope, $location, TasksService, MessengerService, Constants) {
      var empty = {count: 0, records: []};
      $scope.dashboard = {};
      $scope.config = {limit: 5};
      $scope.types = [
        Constants.TASK.FILTER.OLD.ID,
        Constants.TASK.FILTER.TODAY.ID,
        Constants.TASK.FILTER.TOMORROW.ID,
        Constants.TASK.FILTER.NEW.ID
      ];

      /**
       * @memberof DashboardTaskCtrl
       * @method
       * @name openTask
       * @description open task
       * @param index {Number} index of type
       * @returns void
       */
      $scope.openTask = function (index) {
        MessengerService.setData({tasks: {filter: {type: $scope.types[index]}}});
        $location.path(Constants.ROUTES.TASKS);
      };

      // Run
      TasksService.userCount().then(
        function (result) {
          $scope.dashboard.count = result.data.count;
        }
      );
      TasksService.userListOld($scope.config).then(
        function (result) {
          $scope.dashboard.old = result.data || empty;
        }
      );
      TasksService.userListToday($scope.config).then(
        function (result) {
          $scope.dashboard.today = result.data || empty;
        }
      );
      TasksService.userListTomorrow($scope.config).then(
        function (result) {
          $scope.dashboard.tomorrow = result.data || empty;
        }
      );
      TasksService.userListNew($scope.config).then(
        function (result) {
          $scope.dashboard.new = result.data || empty;
        }
      );
    }]);
