/*jslint node: true */
'use strict';

/**
 * @file reminders
 * @fileOverview RemindersCtrl
 */

/**
 * @namespace RemindersCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('RemindersCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'ReminderService', 'initialData', function ($scope, $location, $translate, $translatePartialLoader, ReminderService, initialData) {
    // translate
    $translatePartialLoader.addPart('reminders');
    $translate.refresh();

    $scope.reminders = [];
    $scope.searchStr = '';
    $scope.dataLoaderParams = {
      sortField: 'original_time',
      sortDirection: 'desc'
    };
    $scope.infoPaging = {};

    /**
     * @memberof RemindersCtrl
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
     * @memberof RemindersCtrl
     * @method
     * @name newReminder
     * @description new reminder
     * @returns void
     */
    $scope.newReminder = function () {
      $scope.reminder = {};
      $location.path('/reminder');
    };

    // list
    $scope.reminders = initialData.reminders;
    $scope.dataLoader = ReminderService.list;
  }]);
