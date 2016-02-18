/*jslint node: true */
'use strict';

/**
 * @file appointments
 * @fileOverview AppointmentsCtrl
 */

/**
 * @namespace AppointmentsCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('AppointmentsCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'AppointmentService', 'DateService', 'initialData', 'MessengerService', 'Constants',
    function ($scope, $location, $translate, $translatePartialLoader, AppointmentService, DateService, initialData, MessengerService, Constants) {
      // translate
      $translatePartialLoader.addPart('appointments');
      $translate.refresh();
      var messenger = MessengerService.getData();

      $scope.appointments = [];
      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        filter: {},
        sortField: 'start_time',
        sortDirection: 'asc'
      };
      $scope.dataLoaderParams.filter.type = messenger && messenger.people && messenger.people.filter ? messenger.people.filter.type : -1;
      $scope.infoPaging = {};
      $scope.getTimeFromDateObject = DateService.getTimeFromDateObject;
      $scope.types = [
        Constants.APPOINTMENTS.FILTER.FUTURE,
        Constants.APPOINTMENTS.FILTER.PAST
      ];
      $scope.typesList = [{ID: -1, NAME: 'ALL'}];
      $scope.typesList = $scope.typesList.concat($scope.types);

      /**
       * @memberof AppointmentsCtrl
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
       * @memberof AppointmentsCtrl
       * @method
       * @name newAppointment
       * @description new appointment
       * @returns void
       */
      $scope.newAppointment = function () {
        $location.path('/appointment');
      };

      /**
       * @memberof AppointmentsCtrl
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

      // list
      $scope.appointments = initialData.appointments;
      $scope.dataLoader = AppointmentService.list;
    }]);
