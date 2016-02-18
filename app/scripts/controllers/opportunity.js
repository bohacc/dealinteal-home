/*jslint node: true, unparam: true */
'use strict';

/**
 * @file opportunity
 * @fileOverview OpportunityCtrl
 */

/**
 * @namespace OpportunityCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('OpportunityCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'PageAncestor', 'OpportunitiesService', 'Constants', 'MessengerService', 'AlertsService', 'initialData',
    function ($scope, $location, $translate, $translatePartialLoader, PageAncestor, OpportunitiesService, Constants, MessengerService, AlertsService, initialData) {
      $translatePartialLoader.addPart('opportunity');
      $translate.refresh();

      $scope.probabilityChar = '%';
      $scope.opportunity = initialData.opportunity;
      $scope.opportunityTmp = {};
      $scope.opportunityTmp.chance = $scope.opportunity.chance ? $scope.opportunity.chance + $scope.probabilityChar : '';
      $scope.salesPipelineStages = initialData.stages;
      $scope.opportunity.company = $scope.opportunity.company || [];
      $scope.opportunity.person = $scope.opportunity.person || [];
      $scope.opportunity.opportunityTags = $scope.opportunity.opportunityTags || [];
      $scope.opportunity.salesPipeline = $scope.opportunity.sales_pipeline || [];
      $scope.opportunity.ownerName = $scope.opportunity.ownerName || $scope.meta.ownerName;
      $scope.showNewItem = false;
      $scope.showEditItem = false;
      $scope.tabs = [false, false, false, false];
      $scope.localDataTags = [];
      $scope.opportunityItems = [];
      $scope.dataLoaderParams = {
        sortField: 'name',
        sortDirection: 'asc'
      };
      $scope.infoPaging = {};
      $scope.dataLoader = function (params) {
        return OpportunitiesService.listItems($scope.opportunity, params);
      };
      $scope.refreshItems = null;
      $scope.history = [];
      $scope.loadDataForAgendaList = OpportunitiesService.listForAgenda;
      $scope.dataForAgenda = {};
      $scope.attachmentsTable = Constants.ATTACHMENTS_TYPES.OPPORTUNITY;
      $scope.isEdit = parseInt($scope.opportunity.status || '0', 10) === 0;

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name initButtons
       * @description init actionButtons
       * @returns void
       */
      $scope.initButtons = function () {
        var save = {};
        $scope.actionButtons = [
          {
            name: 'DELETE',
            dropDown: [{name: 'DELETE_OPPORTUNITY', onClick: $scope.del, disabled: function () { return !($scope.opportunity.id); }}],
            disabled: !($scope.opportunity.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () { return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        if ($scope.opportunity.id) {
          save = {
            name: 'SAVE',
            onClick: $scope.put,
            disabled: function () {
              return !$scope.isEdit;
            }
          };
        } else {
          save = {
            name: 'SAVE',
            onClick: $scope.post,
            disabled: function () {
              return !$scope.isEdit;
            }
          };
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name verify
       * @description verify form
       * @returns Boolean
       */
      $scope.verify = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify subject input data
        if (!$scope.opportunity.subject) {
          result = false;
          verifyMessages.push({message: 'SUBJECT'});
        }
        // verify company input data
        if (!$scope.opportunity.company[0] || ($scope.opportunity.company[0] && !$scope.opportunity.company[0].id)) {
          result = false;
          verifyMessages.push({message: 'COMPANY'});
        }
        // verify stage input data
        if (!$scope.opportunity.salesPipelineStageId) {
          result = false;
          verifyMessages.push({message: 'PHASE'});
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
       * @memberof OpportunityCtrl
       * @method
       * @name verifyItem
       * @description verify item form
       * @returns Boolean
       */
      $scope.verifyItem = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify product input data
        if (!$scope.opportunity.item.product[0] || ($scope.opportunity.item.product[0] && !$scope.opportunity.item.product[0].id)) {
          result = false;
          verifyMessages.push({message: 'PRODUCT'});
        }
        // verify price input data
        if (!$scope.opportunity.item.price) {
          result = false;
          verifyMessages.push({message: 'PRICE_UNIT'});
        }
        // verify amount input data
        if (!$scope.opportunity.item.amount) {
          result = false;
          verifyMessages.push({message: 'AMOUNT'});
        }
        // verify unit input data
        if (!$scope.opportunity.item.product[0] || ($scope.opportunity.item.product[0] && !$scope.opportunity.item.product[0].unit)) {
          result = false;
          verifyMessages.push({message: 'UNIT'});
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
       * @memberof OpportunityCtrl
       * @method
       * @name probabilities
       * @description get probability array
       * @returns Array
       */
      $scope.getProbabilities = function () {
        var arr = [], i, e;
        for (i = 0, e = 5; i <= 100; i += e) {
          arr.push(i);
        }
        return arr;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name setProbability
       * @description set probability
       * @param index {Number} index
       * @returns void
       */
      $scope.setProbability = function (index) {
        $scope.opportunity.chance = $scope.getProbabilities()[index];
        $scope.opportunityTmp.chance = $scope.opportunity.chance + $scope.probabilityChar;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name setSalesPipelineStage
       * @description set sales pipeline stage
       * @param index {Number} index of sales pipelines stages
       * @returns void
       */
      $scope.setSalesPipelineStage = function (index) {
        $scope.opportunity.salesPipelineStageId = $scope.salesPipelineStages[index].id;
        $scope.opportunityTmp.tmpSalesPipelineStage = $scope.salesPipelineStages[index].name;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name setTabs
       * @description set tabs
       * @param index {Number} index
       * @returns void
       */
      $scope.setTabs = function (index) {
        $scope.tabs = $scope.tabs.map(function (el, i) {
          return i === index && $scope.opportunity.id;
        });
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name addItem
       * @description add item
       * @returns void
       */
      $scope.addItem = function () {
        $scope.clearItem();
        $scope.showNewItem = true;
        $scope.showItemIndex = null;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name cancelItem
       * @description cancel item
       * @returns void
       */
      $scope.cancelItem = function () {
        $scope.clearItem();
        $scope.showNewItem = false;
        $scope.showItemIndex = null;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name postItem
       * @description post item
       * @returns void
       */
      $scope.postItem = function () {
        if ($scope.verifyItem()) {
          $scope.pageAncestor.post(function () {
            return OpportunitiesService.postItem($scope.opportunity).then(function (promise) {
              $scope.refreshAfterPostItem(promise.data);
              return promise;
            });
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name putItem
       * @description put item
       * @returns void
       */
      $scope.putItem = function () {
        if ($scope.verifyItem()) {
          $scope.pageAncestor.put(function () {
            return OpportunitiesService.putItem($scope.opportunity).then(function (promise) {
              $scope.refreshAfterPutItem(promise.data);
              return promise;
            });
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name delItem
       * @description delete item
       * @param index {Number} index
       * @returns void
       */
      $scope.delItem = function (index) {
        $scope.pageAncestor.confirm(
          function () {
            return OpportunitiesService.delItem({id: $scope.opportunity.id, number: $scope.opportunityItems[index].number}).then(function (promise) {
              $scope.loadItems();
              return promise;
            });
          },
          Constants.MESSAGE_EXEC_DELETE_ITEM,
          Constants.MESSAGE_EXEC_DELETE_ITEM_SUCCESS,
          Constants.MESSAGE_EXEC_DELETE_ITEM_ERROR
        );
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name post
       * @description post
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verify()) {
          $scope.pageAncestor.post(function () {
            return OpportunitiesService.post($scope.opportunity).then(function (promise) {
              if (promise.data.id) {
                $location.path('/opportunity/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name put
       * @description put
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verify()) {
          $scope.pageAncestor.put(function () {
            return OpportunitiesService.put($scope.opportunity).then(function (promise) {
              if (promise.data.id) {
                $location.path('/opportunity/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name del
       * @description del
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return OpportunitiesService.del($scope.opportunity).then(function (promise) {
            if (promise.data.id) {
              $location.path('/opportunity/' + promise.data.id);
            } else {
              $location.path('/sales-pipeline');
            }
            return promise;
          });
        });
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name loadTags
       * @description load data for tags
       * @returns void
       */
      $scope.loadTags = function () {
        OpportunitiesService.tags().then(function (result) {
          $scope.localDataTags = result.data;
        });
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name loadHistory
       * @description load data for history
       * @returns void
       */
      $scope.loadHistory = function () {
        OpportunitiesService.history($scope.opportunity).then(function (result) {
          $scope.history = result.data;
        });
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name loadItems
       * @description load data for opportunity items
       * @returns void
       */
      $scope.loadItems = function () {
        if (!$scope.opportunity.id) {
          return;
        }
        $scope.refreshItems();
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name refreshAfterPostItem
       * @description refresh after post item
       * @returns void
       */
      $scope.refreshAfterPostItem = function (response) {
        if (response.message && response.message.type === Constants.MESSAGE_SUCCESS) {
          $scope.loadItems();
          $scope.cancelItem();
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name refreshAfterPutItem
       * @description refresh after put item
       * @returns void
       */
      $scope.refreshAfterPutItem = function (response) {
        if (response.message && response.message.type === Constants.MESSAGE_SUCCESS) {
          $scope.loadItems();
          $scope.cancelItem();
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name clearItem
       * @description clear item object
       * @returns void
       */
      $scope.clearItem = function () {
        $scope.opportunity.item = {product: []};
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name setSalesPipelineStageDefault
       * @description set default stage
       * @returns void
       */
      $scope.setSalesPipelineStageDefault = function () {
        var index = 0;
        $scope.salesPipelineStages.map(function (el, i) {
          if ($scope.opportunity.salesPipelineStageId === el.id) {
            index = i;
          }
        });
        $scope.setSalesPipelineStage(index);
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name refreshTotalPrice
       * @description refresh total price property
       * @returns void
       */
      $scope.refreshTotalPrice = function () {
        $scope.opportunityTmp.totalPrice = 0;
        $scope.opportunityItems.map(function (el) {
          $scope.opportunityTmp.totalPrice += parseFloat(el.price) * parseFloat(el.amount);
        });
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name itemsCallback
       * @description callback for items loader
       * @returns void
       */
      $scope.itemsCallback = function () {
        $scope.cancelItem();
        $scope.refreshTotalPrice();
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name newOpportunity
       * @description new opportunity
       * @returns void
       */
      $scope.newOpportunity = function () {
        $location.path('/opportunity');
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name editItem
       * @description edit item
       * @returns void
       */
      $scope.editItem = function (index) {
        $scope.clearItem();
        $scope.showNewItem = false;
        $scope.showItemIndex = index;
        $scope.prepareItem(index);
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name prepareItem
       * @description prepare item
       * @returns void
       */
      $scope.prepareItem = function (index) {
        var item = $scope.opportunityItems[index];
        $scope.opportunity.item = item;
        $scope.opportunity.item.price = parseFloat(item.price);
        $scope.opportunity.item.amount = parseFloat(item.amount);
        $scope.opportunity.item.product = [{id: item.id, name: item.name, unit: item.unit}];
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name initDataForAgenda
       * @description initialization data for agenda
       * @returns void
       */
      $scope.initDataForAgenda = function () {
        // Appointment
        $scope.dataForAgenda.appointment = {};
        $scope.dataForAgenda.appointment.salesPipeline = [{id: $scope.opportunity.id, name: $scope.opportunity.subject}];
        $scope.dataForAgenda.appointment.company = [{id: $scope.opportunity.companyId, name: $scope.opportunity.companyName}];
        // Task
        $scope.dataForAgenda.task = {};
        $scope.dataForAgenda.task.salesPipeline = [{id: $scope.opportunity.id, name: $scope.opportunity.subject}];
        $scope.dataForAgenda.task.company = [{id: $scope.opportunity.companyId, name: $scope.opportunity.companyName}];
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name opportunitySuccess
       * @description change status to success
       * @returns void
       */
      $scope.opportunitySuccess = function () {
        if (parseInt($scope.opportunity.status, 10) === Constants.OPPORTUNITY_STATUS.OPEN.ID) {
          $scope.pageAncestor.postPart(function () {
            return OpportunitiesService.setSuccess({id: $scope.opportunity.id, date: new Date()}).then(
              function (result) {
                if (result.data && result.data.message && result.data.message.type === Constants.MESSAGE_SUCCESS) {
                  AlertsService.add({
                    type: Constants.MESSAGE_SUCCESS,
                    message: Constants.MESSAGE_TEXT_OPPORTUNITY_STATUS_SUCCESS_SUCCESS
                  });
                  $scope.opportunity.status = Constants.OPPORTUNITY_STATUS.SUCCESS.ID;
                }
                return result;
              }
            );
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name opportunityFailed
       * @description change status to failed
       * @returns void
       */
      $scope.opportunityFailed = function () {
        if (parseInt($scope.opportunity.status, 10) === Constants.OPPORTUNITY_STATUS.OPEN.ID) {
          $scope.pageAncestor.postPart(function () {
            return OpportunitiesService.setFailed({id: $scope.opportunity.id, date: new Date()}).then(
              function (result) {
                if (result.data && result.data.message && result.data.message.type === Constants.MESSAGE_SUCCESS) {
                  AlertsService.add({
                    type: Constants.MESSAGE_SUCCESS,
                    message: Constants.MESSAGE_TEXT_OPPORTUNITY_STATUS_FAILED_SUCCESS
                  });
                  $scope.opportunity.status = Constants.OPPORTUNITY_STATUS.FAILED.ID;
                }
                return result;
              }
            );
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name opportunityOpenClosed
       * @description change status to open
       * @returns void
       */
      $scope.opportunityOpenClosed = function () {
        if (parseInt($scope.opportunity.status, 10) !== Constants.OPPORTUNITY_STATUS.OPEN.ID) {
          $scope.pageAncestor.postPart(function () {
            return OpportunitiesService.setOpen({id: $scope.opportunity.id}).then(
              function (result) {
                if (result.data && result.data.message && result.data.message.type === Constants.MESSAGE_SUCCESS) {
                  AlertsService.add({
                    type: Constants.MESSAGE_SUCCESS,
                    message: Constants.MESSAGE_TEXT_OPPORTUNITY_OPEN_CLOSED_SUCCESS
                  });
                  $scope.opportunity.status = Constants.OPPORTUNITY_STATUS.OPEN.ID;
                }
                return result;
              }
            );
          });
        }
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name isOpen
       * @description status is open
       * @returns Boolean
       */
      $scope.isOpen = function () {
        return parseInt($scope.opportunity.status, 10) === Constants.OPPORTUNITY_STATUS.OPEN.ID;
      };

      /**
       * @memberof OpportunityCtrl
       * @method
       * @name getStatusName
       * @description get status name
       * @returns String
       */
      $scope.getStatusName = function () {
        var name = '';
        if (parseInt(($scope.opportunity.status || '0'), 10) === 0) {
          name = Constants.OPPORTUNITY_STATUS.OPEN.NAME;
        }
        if (parseInt(($scope.opportunity.status), 10) === 1) {
          name = Constants.OPPORTUNITY_STATUS.SUCCESS.NAME;
        }
        if (parseInt(($scope.opportunity.status), 10) === 2) {
          name = Constants.OPPORTUNITY_STATUS.FAILED.NAME;
        }
        return name;
      };

      // Watchers
      $scope.$watch('opportunity.status', function (oldValue, newValue) {
        if (oldValue !== newValue) {
          $scope.statusName = $scope.getStatusName();
          $scope.isEdit = parseInt($scope.opportunity.status || '0', 10) === 0;
        }
      });

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'opportunity',
        table: 'SALES_PIPELINE'
      });
      $scope.statusName = $scope.getStatusName();
      $scope.initButtons();
      $scope.setTabs(0);
      $scope.setSalesPipelineStageDefault();
      $scope.loadTags();
      $scope.clearItem();
      $scope.loadHistory();
      $scope.initDataForAgenda();
    }]);
