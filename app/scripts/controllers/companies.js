/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Companies
 * @fileOverview CompaniesCtrl
 */

/**
 * @namespace CompaniesCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('CompaniesCtrl', ['$scope', '$location', 'companies', '$translatePartialLoader', '$translate', 'CompaniesService', 'Constants', 'MessengerService',
    function ($scope, $location, companies, $translatePartialLoader, $translate, CompaniesService, Constants, MessengerService) {
      $translatePartialLoader.addPart('companies');
      $translate.refresh();
      var messenger = MessengerService.getData();

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        filter: {},
        sortField: 'company_name',
        sortDirection: 'asc'
      };
      $scope.dataLoaderParams.filter.type = messenger && messenger.people && messenger.people.filter ? messenger.people.filter.type : -1;
      $scope.infoPaging = {};
      $scope.selectedItemsObject = {};
      $scope.ROUTES = Constants.ROUTES;
      $scope.types = [
        Constants.COMPANIES.FILTER.OPEN_OPPORTUNITIES
      ];
      $scope.typesList = [{ID: -1, NAME: 'ALL'}];
      $scope.typesList = $scope.typesList.concat($scope.types);

      /**
       * @memberof CompaniesCtrl
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
       * @memberof CompaniesCtrl
       * @method
       * @name newCompany
       * @description show new company page
       * @returns void
       */
      $scope.newCompany = function () {
        $location.path('/company');
      };

      /**
       * @memberof CompaniesCtrl
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
      $scope.companies = companies;
      $scope.dataLoader = CompaniesService.list;
    }]);
