/*jslint node: true */
'use strict';

/**
 * @file People
 * @fileOverview PeopleCtrl
 */

/**
 * @namespace PeopleCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('PeopleCtrl', ['$scope', '$translate', '$location', '$translatePartialLoader', 'PeopleService', 'MessengerService', 'initialData', 'Constants',
    function ($scope, $translate, $location, $translatePartialLoader, PeopleService, MessengerService, initialData, Constants) {
      $translatePartialLoader.addPart('people');
      $translate.refresh();
      var messenger = MessengerService.getData();

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        filter: {},
        sortField: 'last_name',
        sortDirection: 'asc'
      };
      $scope.dataLoaderParams.filter.type = messenger && messenger.people && messenger.people.filter ? messenger.people.filter.type : -1;
      $scope.infoPaging = {};
      $scope.teamMember = initialData.teamMember;
      $scope.types = [
        Constants.PEOPLE.FILTER.UPCOMING_ANNIVERSARY
      ];
      $scope.typesList = [{ID: -1, NAME: 'ALL'}];
      $scope.typesList = $scope.typesList.concat($scope.types);

      /**
       * @memberof PeopleCtrl
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
       * @memberof PeopleCtrl
       * @method
       * @name newPerson
       * @description redirect on new page
       * @returns void
       */
      $scope.newPerson = function () {
        if ($scope.teamMember) {
          $location.path('/team-member');
        } else {
          $location.path('/person');
        }
      };

      /**
       * @memberof PeopleCtrl
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
      $scope.people = initialData.people;
      $scope.dataLoader = initialData.teamMember ? PeopleService.teamMembersList : PeopleService.list;
    }]);
