/*jslint node: true */
'use strict';

/**
 * @file Opportunities
 * @fileOverview OpportunitiesCtrl
 */

/**
 * @namespace OpportunitiesCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('OpportunitiesCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'OpportunitiesService', 'MessengerService', 'Constants', 'SalesPipelineStagesService', 'initialData',
    function ($scope, $location, $translate, $translatePartialLoader, OpportunitiesService, MessengerService, Constants, SalesPipelineStagesService, initialData) {
      $translatePartialLoader.addPart('opportunities');
      $translate.refresh();
      var messenger = MessengerService.getData();

      $scope.opportunities = initialData.opportunities || [];

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        filter: {},
        sortField: 'subject',
        sortDirection: 'asc'
      };
      $scope.dataLoaderParams.filter.type = messenger && messenger.opportunities && messenger.opportunities.filter ? messenger.opportunities.filter.type : -1;
      /*$scope.dataLoaderParams.filter.owner = messenger && messenger.opportunities && messenger.opportunities.filter ? messenger.opportunities.filter.owner : -1;*/
      $scope.infoPaging = {};
      $scope.types = [
        Constants.OPPORTUNITIES.FILTER.OPEN,
        Constants.OPPORTUNITIES.FILTER.SUCCESS,
        Constants.OPPORTUNITIES.FILTER.FAILURE
      ];
      $scope.typesList = [{ID: -1, NAME: 'ALL', FILTER: 'TYPE'}];
      $scope.typesList = $scope.typesList.concat($scope.types);
      $scope.owners = [];
      $scope.filters = [];

      /**
       * @memberof OpportunitiesCtrl
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
       * @memberof OpportunitiesCtrl
       * @method
       * @name newOpportunity
       * @description show new opportunity page
       * @returns void
       */
      $scope.newOpportunity = function () {
        $location.path('/opportunity');
      };

      /**
       * @memberof OpportunitiesCtrl
       * @method
       * @name viewSalesPipeline
       * @description call page sales-pipeline
       * @returns void
       */
      $scope.viewSalesPipeline = function () {
        $location.path('/sales-pipeline');
      };

      /**
       * @memberof OpportunitiesCtrl
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

      /**
       * @memberof OpportunitiesCtrl
       * @method
       * @name init
       * @description initialization stages
       * @returns void
       */
      $scope.init = function () {
        $scope.loadOwnersForStages();
      };

      /**
       * @memberof OpportunitiesCtrl
       * @method
       * @name loadOwnersForStages
       * @description load owner for stages
       * @returns void
       */
      $scope.loadOwnersForStages = function () {
        SalesPipelineStagesService.owners().then(function (promise) {
          var obj = {};
          $scope.owners = [];
          var i, l;
          for (i = 0, l = promise.data.length; i < l; i += 1) {
            obj = {};
            obj.ID = promise.data[i].owner_id;
            obj.NAME = promise.data[i].peoplename || promise.data[i].last_name;
            obj.FILTER = 'OWNER';
            $scope.owners.push(obj);
          }
          $scope.filters = $scope.typesList;
          $scope.filters = $scope.filters.concat($scope.owners);
        });
      };

      /**
       * @memberof OpportunitiesCtrl
       * @method
       * @name setFilter
       * @description set filter
       * @param obj {Object} owner from owners
       * @returns void
       */
      $scope.setFilter = function (obj) {
        $scope.dataLoaderParams.filter.type = obj.FILTER === 'TYPE' ? obj.ID : -1;
        $scope.dataLoaderParams.filter.owner = obj.FILTER === 'OWNER' ? obj.ID : -1;
      };

      // list
      $scope.dataLoader = OpportunitiesService.list;

      // Run
      /*$scope.init();*/

    }]);

