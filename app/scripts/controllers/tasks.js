/*jslint node: true, unparam: true */
'use strict';

/**
 * @file tasks
 * @fileOverview TasksCtrl
 */

/**
 * @namespace TasksCtrl
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .controller('TasksCtrl', ['$scope', '$location', '$translatePartialLoader', '$translate', 'TasksService', 'Constants', 'MessengerService',
    function ($scope, $location, $translatePartialLoader, $translate, TasksService, Constants, MessengerService) {
      // translate
      $translatePartialLoader.addPart('tasks');
      $translate.refresh();
      var messenger = MessengerService.getData();

      $scope.tasks = [];
      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        filter: {},
        sortField: 'subject',
        sortDirection: 'asc'
      };
      $scope.dataLoaderParams.filter.type = messenger && messenger.tasks && messenger.tasks.filter ? messenger.tasks.filter.type : -1;
      $scope.infoPaging = {};
      $scope.types = [
        Constants.TASK.FILTER.OLD,
        Constants.TASK.FILTER.TODAY,
        Constants.TASK.FILTER.TOMORROW,
        Constants.TASK.FILTER.NEW
      ];
      $scope.typesList = [{ID: -1, NAME: 'ALL'}];
      $scope.typesList = $scope.typesList.concat($scope.types);

      /**
       * @memberof TasksCtrl
       * @method
       * @name setSearch
       * @description set search after enter
       * @param event {Object} handle for DOM event
       * @returns void
       */
      $scope.setSearch = function (event) {
        if (event.which === 13) {
          $scope.dataLoaderParams.searchStr = $scope.searchStr;
        }
      };

      /**
       * @memberof TasksCtrl
       * @method
       * @name newTask
       * @description new task
       * @returns void
       */
      $scope.newTask = function () {
        $location.path('/task');
      };

      /**
       * @memberof TasksCtrl
       * @method
       * @name getType
       * @description get type
       * @returns Object
       */
      $scope.getType = function () {
        return $scope.typesList.filter(function (el) {
          return el.ID === $scope.dataLoaderParams.filter.type;
        })[0];
      };

      // Run
      $scope.dataLoader = TasksService.list;
    }]);
