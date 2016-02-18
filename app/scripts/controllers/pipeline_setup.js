/*jslint node: true */
'use strict';

/**
 * @file PipelineSetupCtrl
 * @fileOverview PipelineSetup
 */

/**
 * @namespace PipelineSetup
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('PipelineSetupCtrl', ['$scope', '$translate', '$translatePartialLoader', 'SalesPipelineStagesService', 'PageAncestor', 'Constants', 'initialData',
    function ($scope, $translate, $translatePartialLoader, SalesPipelineStagesService, PageAncestor, Constants, initialData) {
      $translatePartialLoader.addPart('pipeline_setup');
      $translate.refresh();

      $scope.config = {};
      $scope.config.stages = initialData.stages || [];
      $scope.config.newStage = {id: null, name: '', chance: null};
      $scope.pipelines = {};
      $scope.pipelines.activeStageIndex = null;
      $scope.pipelines.actionButtons = [];
      $scope.pipelines.selectedStageForMove = {};

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name initButtons
       * @description init actionButtons
       * @returns void
       */
      $scope.initButtons = function () {
        var save = {}, fce;
        $scope.pipelines.actionButtons = [
          {name: 'DELETE', onClick: $scope.del, disabled: function () {return $scope.pipelines.activeStageIndex === -1; }},
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () {return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        fce = function () {
          if ($scope.pipelines.activeStageIndex > -1) {
            $scope.put();
          } else {
            $scope.post();
          }
        };
        save = {name: 'SAVE', onClick: fce, disabled: function () {return $scope.inProcess; }};
        $scope.pipelines.actionButtons.push(save);
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name verifyForm
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // new record
        if (!$scope.config.newStage.name && $scope.pipelines.activeStageIndex === -1) {
          result = false;
          verifyMessages.push({message: 'NAME'});
        }
        if (!$scope.config.newStage.chance && $scope.pipelines.activeStageIndex === -1) {
          result = false;
          verifyMessages.push({message: 'CHANCE'});
        }
        // exists
        if ($scope.pipelines.activeStageIndex > -1 && !$scope.config.stages[$scope.pipelines.activeStageIndex].name) {
          result = false;
          verifyMessages.push({message: 'NAME'});
        }
        if ($scope.pipelines.activeStageIndex > -1 && !$scope.config.stages[$scope.pipelines.activeStageIndex].chance) {
          result = false;
          verifyMessages.push({message: 'CHANCE'});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: verifyMessages});
        }
        return result;
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name verifyBeforeDeleteStage
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyBeforeDeleteStage = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: Constants.MESSAGE_WARNING_VALIDATION_PIPELINE_STAGE_NOT_FOUND});

        // new record
        if (!$scope.pipelines.selectedStageForMove.id) {
          result = false;
          verifyMessages.push({message: ''});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: verifyMessages});
        }
        return result;
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name post
       * @description post form
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.post(function () {
            return SalesPipelineStagesService.post($scope.config.newStage).then(function (promise) {
              $scope.refreshAfterInsert(promise.data);
              return promise;
            });
          });
        }
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name put
       * @description put form
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.put(function () {
            return SalesPipelineStagesService.put($scope.config.stages[$scope.pipelines.activeStageIndex]).then(function (promise) {
              return promise;
            });
          });
        }
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name del
       * @description delete stage
       * @returns void
       */
      $scope.del = function () {
        $scope.pipelines.showDeleteDialog = true;
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name deleteStage
       * @description delete stage
       * @returns void
       */
      $scope.deleteStage = function () {
        if ($scope.verifyBeforeDeleteStage()) {
          $scope.pageAncestor.confirm(
            function () {
              var obj = {
                id: $scope.config.stages[$scope.pipelines.activeStageIndex].id,
                newId: $scope.pipelines.selectedStageForMove.id
              };
              return SalesPipelineStagesService.replace(obj).then(function (promise) {
                $scope.refreshAfterDelete(promise.data, $scope.pipelines.activeStageIndex);
                return promise;
              });
            },
            Constants.MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE,
            Constants.MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE_SUCCESS,
            Constants.MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE_ERROR
          );
        }
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name newStage
       * @description new stage
       * @returns void
       */
      $scope.newStage = function () {
        $scope.pageAncestor.cancel();
        $scope.pipelines.activeStageIndex = -1;
        $scope.config.newStage = {id: null, name: '', chance: null};
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name openDetail
       * @description open detail stage
       * @returns void
       */
      $scope.openDetail = function (index) {
        $scope.pageAncestor.cancel();
        $scope.pipelines.activeStageIndex = index;
        $scope.pipelines.showDeleteDialog = false;
        $scope.pipelines.selectedStageForMove = {};
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name refreshAfterInsert
       * @description refresh after insert stage
       * @returns void
       */
      $scope.refreshAfterInsert = function (data) {
        if (data.id) {
          $scope.pipelines.activeStageIndex = null;
          SalesPipelineStagesService.list().then(function (promise) {
            $scope.config.stages = promise.data;
            $scope.pageAncestor.default();
          });
        }
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name refreshAfterDelete
       * @description refresh after delete stage
       * @param response {Object} response
       * @param index {Number} index
       * @returns void
       */
      $scope.refreshAfterDelete = function (response, index) {
        if (response.id) {
          $scope.pipelines.activeStageIndex = null;
          $scope.config.stages.splice(index, 1);
          $scope.pageAncestor.default();
        }
      };

      /**
       * @memberof PipelineSetupCtrl
       * @method
       * @name setStageForMove
       * @description refresh after delete stage
       * @param obj {Object} obj
       * @returns void
       */
      $scope.setStageForMove = function (obj) {
        $scope.pipelines.selectedStageForMove = $scope.config.stages.filter(function (el) {
          return el.id === obj.id;
        })[0];
      };

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'config',
        table: 'SALES_PIPELINE_STAGES'
      });
      $scope.initButtons();

    }]);
