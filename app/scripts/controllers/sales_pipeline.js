/*jslint node: true */
'use strict';

/**
 * @file SalesPipeline
 * @fileOverview SalesPipelineCtrl
 */

/**
 * @namespace SalesPipelineCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('SalesPipelineCtrl', ['$scope', '$translate', '$location', '$translatePartialLoader', 'SalesPipelineService', 'SalesPipelineStagesService', 'initialData', function ($scope, $translate, $location, $translatePartialLoader, SalesPipelineService, SalesPipelineStagesService, initialData) {
    $translatePartialLoader.addPart('sales_pipeline');
    $translate.refresh();

    $scope.searchStr = '';
    $scope.dataLoader = SalesPipelineService.list;
    $scope.dataLoaderSummary = SalesPipelineService.list;
    $scope.dataLoaderParams = {
      filter: {},
      sortField: 'company_name',
      sortDirection: 'asc'
    };
    $scope.infoPaging = [];
    $scope.stages = initialData.stages;
    $scope.stagesRows = initialData.stagesRows;
    $scope.rowsInStage = 10;
    $scope.defaultCollapse = false;
    $scope.owners = [];

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name init
     * @description initialization stages
     * @returns void
     */
    $scope.init = function () {
      $scope.loadOwnersForStages();
      $scope.loadAllStages();
      $scope.initInfoPaging();
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name findStage
     * @description find stage in stages
     * @param id {Number} if of sales pipeline stage
     * @returns Object
     */
    $scope.findStage = function (id) {
      var i, l;
      for (i = 0, l = $scope.stages.length; i < l; i += 1) {
        if ($scope.stages[i].id === String(id)) {
          return $scope.stages[i];
        }
      }
      return {};
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name loadCurrentStage
     * @description load data for current stage
     * @param obj {Object} properties of current stage
     * @returns void
     */
    $scope.loadCurrentStage = function (obj) {
      if (!$scope.stagesRows[obj.id]) {
        $scope.stagesRows[obj.id] = {};
      }
      SalesPipelineService.list({id: obj.id, amount: $scope.rowsInStage}).then(function (promise) {
        $scope.stagesRows[obj.id].rows = promise.data;
        $scope.stagesRows[obj.id].collapse = $scope.defaultCollapse;
      });
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name loadOwnersForStages
     * @description load owner for stages
     * @returns void
     */
    $scope.loadOwnersForStages = function () {
      SalesPipelineStagesService.owners().then(function (promise) {
        $scope.owners = [];
        $scope.owners.push({peoplename: 'Všechny', owner_id: '-1'});
        $scope.dataLoaderParams.filter.owner = $scope.owners[0];
        var i, l;
        for (i = 0, l = promise.data.length; i < l; i += 1) {
          $scope.owners.push(promise.data[i]);
        }
      });
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name loadAllStages
     * @description load data for all stages
     * @returns void
     */
    $scope.loadAllStages = function () {
      var i, l;
      for (i = 0, l = $scope.stages.length; i < l; i += 1) {
        $scope.loadCurrentStage({id: $scope.stages[i].id});
      }
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name toggleStages
     * @description toggle stage
     * @returns void
     */
    $scope.toggleStages = function (id) {
      if ($scope.stagesRows[id]) {
        $scope.stagesRows[id].collapse = !$scope.stagesRows[id].collapse;
      }
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name setOwner
     * @description set owner from select to model for input
     * @param obj {Object} owner from owners
     * @returns void
     */
    $scope.setOwner = function (obj) {
      $scope.dataLoaderParams.filter.owner = obj;
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name initInfoPaging
     * @description set infoPaging property for paging informations
     * @returns void
     */
    $scope.initInfoPaging = function () {
      var i, l;
      for (i = 0, l = $scope.stages.length; i < l; i += 1) {
        $scope.infoPaging[$scope.stages[i].id] = {};
      }
    };

    /**
     * @memberof SalesPipelineCtrl
     * @method
     * @name viewOpportunities
     * @description call page opportunities
     * @returns void
     */
    $scope.viewOpportunities = function () {
      $location.path('/opportunities');
    };
    // Run
    $scope.init();
  }]);
