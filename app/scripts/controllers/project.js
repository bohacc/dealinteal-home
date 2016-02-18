/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Project
 * @fileOverview ProjectCtrl
 */

/**
 * @namespace ProjectCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('ProjectCtrl', ['$scope', '$location', '$translatePartialLoader', '$translate', 'PageAncestor', 'ProjectsService', 'Constants', 'DatepickerFactory', 'MessengerService', 'initialData',
    function ($scope, $location, $translatePartialLoader, $translate, PageAncestor, ProjectsService, Constants, DatepickerFactory, MessengerService, initialData) {

      $translatePartialLoader.addPart('project');
      $translate.refresh();

      $scope.project = initialData.project;
      $scope.project.company = $scope.project.company || [];
      $scope.projectTmp = {};
      $scope.pageAncestor = {};

      $scope.tabs = [false, false];
      $scope.loadDataForAgendaList = ProjectsService.listForAgenda;
      $scope.history = [];
      $scope.project.ownerName = $scope.project.ownerName || $scope.meta.ownerName;
      $scope.dataForAgenda = {};

      /**
       * @memberof ProjectCtrl
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
            dropDown: [{name: 'DELETE_PROJECT', onClick: $scope.del, disabled: function () { return !($scope.project.id); }}],
            disabled: !($scope.project.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () {
            return !$scope.pageAncestor.log.changes.isChanged;
          }}
        ];
        if ($scope.project.id) {
          save = {name: 'SAVE', onClick: $scope.put, disabled: function () { return $scope.inProcess; }};
        } else {
          save = {name: 'SAVE', onClick: $scope.post, disabled: function () { return $scope.inProcess; }};
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name newProject
       * @description show new project page
       * @returns void
       */
      $scope.newProject = function () {
        $location.path('/project');
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name verify
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        if (!$scope.project.subject) {
          result = false;
          verifyMessages.push({message: 'SUBJECT'});
        }
        if ($('#XXX4_value').val() && !$scope.project.company[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COMPANY'});
        }
        if ($scope.project.startDate && !(new Date($scope.project.startDate) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'START'});
        }
        if ($scope.project.endDate && !(new Date($scope.project.endDate) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'FINISH'});
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
       * @memberof ProjectCtrl
       * @method
       * @name post
       * @description post form
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.post(function () {
            return ProjectsService.post($scope.project).then(function (promise) {
              if (promise.data.id) {
                $location.path('/project/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name put
       * @description put form
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.put(function () {
            return ProjectsService.put($scope.project).then(function (promise) {
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name del
       * @description delete form
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return ProjectsService.del($scope.project).then(function (promise) {
            if (promise.data.id) {
              $location.path('/project/' + promise.data.id);
            } else {
              $location.path('/projects');
            }
            return promise;
          });
        });
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name setTabs
       * @description set tabs
       * @param index {Number} index
       * @returns void
       */
      $scope.setTabs = function (index) {
        $scope.tabs = $scope.tabs.map(function (el, i) {
          return i === index && $scope.project.id;
        });
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name loadHistory
       * @description load data for history
       * @returns void
       */
      $scope.loadHistory = function () {
        ProjectsService.history($scope.project).then(function (result) {
          $scope.history = result.data;
        });
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name startProject
       * @description starting the project
       * @returns void
       */
      $scope.startProject = function () {
        $scope.project.startDate = (new Date()).toISOString();
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name startProjectCancel
       * @description cancel starting the project
       * @returns void
       */
      $scope.startProjectCancel = function () {
        $scope.project.startDate = '';
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name endProject
       * @description ends the project
       * @returns void
       */
      $scope.endProject = function () {
        $scope.project.endDate = (new Date()).toISOString();
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name endProjectCancel
       * @description cancel ending the project
       * @returns void
       */
      $scope.endProjectCancel = function () {
        $scope.project.endDate = '';
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name copyProject
       * @description new project from current
       * @returns void
       */
      $scope.copyProject = function () {
        MessengerService.clear();
        $scope.project.id = null;
        $scope.project.ownerName = null;
        $scope.project.startDate = null;
        $scope.project.endDate = null;
        MessengerService.setData($scope.project);
        $location.path('/project');
      };

      /**
       * @memberof ProjectCtrl
       * @method
       * @name initDataForAgenda
       * @description initialization data for agenda
       * @returns void
       */
      $scope.initDataForAgenda = function () {
        // Appointment
        $scope.dataForAgenda.appointment = {};
        $scope.dataForAgenda.appointment.projects = [{id: $scope.project.id, name: $scope.project.subject}];
        // Task
        $scope.dataForAgenda.task = {};
        $scope.dataForAgenda.task.project = [{id: $scope.project.id, name: $scope.project.subject}];
      };

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'project',
        table: 'PROJECTS'
      });

      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      $scope.initButtons();
      $scope.setTabs(0);
      $scope.loadHistory();
      $scope.initDataForAgenda();
    }]);
