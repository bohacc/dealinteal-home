/*jslint node: true, unparam: true */
'use strict';

/**
 * @file task
 * @fileOverview TaskCtrl
 */

/**
 * @namespace TaskCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('TaskCtrl', ['$scope', '$timeout', '$location', '$translate', '$translatePartialLoader', 'PageAncestor', 'DatepickerFactory', 'TasksService', 'DateService', 'Constants', 'TimeZonesService', 'Tools', 'SalesPipelineService', 'MessengerService', 'initialData',
    function ($scope, $timeout, $location, $translate, $translatePartialLoader, PageAncestor, DatepickerFactory, TasksService, DateService, Constants, TimeZonesService, Tools, SalesPipelineService, MessengerService, initialData) {
      // translate
      $translatePartialLoader.addPart('task');
      $translate.refresh();

      $scope.task = initialData.task;
      $scope.usersWithoutOwner = initialData.usersWithoutOwner;
      $scope.taskTmp = {};
      $scope.localDataTags = [];
      $scope.task.taskTags = $scope.task.taskTags || [];
      $scope.task.company = $scope.task.company || [];
      $scope.task.person = $scope.task.person || [];
      $scope.task.project = $scope.task.project || [];
      $scope.task.salesPipeline = $scope.task.salesPipeline || [];
      $scope.timeZones = [];
      // !!! VALUES in SECONDS for DATABASE !!!
      $scope.listReminder = [   // 5 min, 10 min, 15 min, 30 min, 1 hour, 1 day
        {prefix: '', name: 'NONE', value: 0},
        {prefix: '5', name: 'MINUTES', value: 5 * 60},
        {prefix: '10', name: 'MINUTES', value: 10 * 60},
        {prefix: '15', name: 'MINUTES', value: 15 * 60},
        {prefix: '30', name: 'MINUTES', value: 30 * 60},
        {prefix: '1', name: 'HOUR', value: 60 * 60},
        {prefix: '1', name: 'DAY', value: 24 * 60 * 60}
      ];
      $scope.priority = Constants.PRIORITY;
      $scope.selectedPriority = $scope.priority[1]; // Medium
      $scope.salesPipelineStages = [];
      $scope.tabsRelated = [true, false, false];
      $scope.relatedTasksList = [];
      $scope.relatedIndex = 0;
      $scope.relatedPrecedingIndex = 1;
      $scope.relatedFollowingIndex = 2;
      $scope.relatedTaskIndex = 0;

      var newDateTimeStart, m, n;
      // EXIST RECORD
      if ($scope.task.id) {
        // date from DB is UTC0, datepicker convert to local time zone, we must minus time offset for current show
        $scope.task.startDate = DateService.addMilliseconds(new Date($scope.task.startDate), (new Date($scope.task.startDate)).getTimezoneOffset() * 60 * 1000).toISOString();
        $scope.taskTmp.startDate = $scope.task.startDate;
        $scope.taskTmp.startTime = $scope.task.startDate;

        // date from DB is UTC0, datepicker convert to local time zone, we must minus time offset for current show
        $scope.task.dueDate = DateService.addMilliseconds(new Date($scope.task.dueDate), (new Date($scope.task.dueDate)).getTimezoneOffset() * 60 * 1000).toISOString();
        $scope.taskTmp.dueDate = $scope.task.dueDate;
        $scope.taskTmp.dueTime = $scope.task.dueDate;

        if ($scope.task.finishDate) {
          // date from DB is UTC0, datepicker convert to local time zone, we must minus time offset for current show
          $scope.task.finishDate = DateService.addMilliseconds(new Date($scope.task.finishDate), (new Date($scope.task.finishDate)).getTimezoneOffset() * 60 * 1000).toISOString();
          $scope.taskTmp.finishDate = $scope.task.finishDate;
          $scope.taskTmp.finishTime = $scope.task.finishDate;
        }
        // Reminder
        $scope.taskTmp.tmpReminderIndex = 0;
        for (m = 0, n = $scope.listReminder.length; m < n; m += 1) {
          if ($scope.listReminder[m].value === parseInt($scope.task.reminderSeconds, 10)) {
            $scope.taskTmp.tmpReminderIndex = m;
            break;
          }
        }
        $timeout(function () {
          $scope.taskTmp.tmpReminder = $scope.listReminder[$scope.taskTmp.tmpReminderIndex].name;
          $scope.taskTmp.tmpReminderPrefix = $scope.listReminder[$scope.taskTmp.tmpReminderIndex].prefix;
        }, 500);
        // priority
        $scope.selectedPriority = $scope.priority[$scope.task.priority];
        // assignee to
        if ($scope.task.ownerId === $scope.task.assignedToId) {
          $scope.taskTmp.assignedToTeam = false;
        } else {
          $scope.taskTmp.assignedToTeam = true;
          for (m = 0, n = $scope.usersWithoutOwner.length; m < n; m += 1) {
            if ($scope.usersWithoutOwner[m].id === $scope.task.assignedToId) {
              $scope.selectedTeamUser = $scope.usersWithoutOwner[m];
              break;
            }
          }
        }
      } else {
        // set default
        $scope.task.priority = '0';
        $scope.taskTmp.tmpReminderIndex = 2;
        newDateTimeStart = DateService.round(new Date(), [0, 30, 60], 'mi');
        newDateTimeStart.setSeconds(0);
        newDateTimeStart.setMilliseconds(0);
        newDateTimeStart = (new Date(newDateTimeStart)).toISOString();
        $scope.task.startDate = newDateTimeStart;
        $scope.task.dueDate = newDateTimeStart;
        $scope.taskTmp.startDate = newDateTimeStart;
        $scope.taskTmp.startTime = newDateTimeStart;
        $scope.taskTmp.dueDate = newDateTimeStart;
        $scope.taskTmp.dueTime = newDateTimeStart;
        // Reminder
        if ($scope.taskTmp.tmpReminderIndex) {
          $scope.task.reminderSeconds = $scope.listReminder[$scope.taskTmp.tmpReminderIndex].value;
          $timeout(function () {
            $scope.taskTmp.tmpReminder = $scope.listReminder[$scope.taskTmp.tmpReminderIndex].name;
            $scope.taskTmp.tmpReminderPrefix = $scope.listReminder[$scope.taskTmp.tmpReminderIndex].prefix;
          }, 500);
        }
        $scope.taskTmp.assignedToTeam = false;
      }

      /**
       * @memberof TaskCtrl
       * @method
       * @name newTask
       * @description new task
       * @returns void
       */
      $scope.newTask = function () {
        $location.path('/task');
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name verify
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify type_id input data
        if (!$scope.task.subject) {
          result = false;
          verifyMessages.push({message: 'SUBJECT'});
        }
        // verify startDate input data
        if (!$scope.task.startDate || !(new Date($scope.task.startDate) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'START_DATE'});
        }
        // verify dueDate input data
        if (!$scope.task.dueDate || !(new Date($scope.task.dueDate) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DUE_DATE'});
        }
        if ($scope.task.startDate > $scope.task.dueDate) {
          result = false;
          verifyMessages.push({message: 'RANGE_DATE_START_AND_DUE'});
        }
        // verify time_zone input data
        if (!$scope.task.timezoneName) {
          result = false;
          verifyMessages.push({message: 'TIMEZONE'});
        }
        // verify assignee to team
        if ($scope.taskTmp.assignedToTeam) {
          if (!$scope.selectedTeamUser.id || !Tools.isNumber($scope.selectedTeamUser.id)) {
            result = false;
            verifyMessages.push({message: 'ASSIGNEE_TO_TEAM'});
          }
        }
        if (!$scope.meta.ownerId) {
          result = false;
          verifyMessages.push({message: 'ASSIGNEE_TO_ME'});
        }
        // verify Project
        if ($('#XXX2_value').val() && !$scope.task.project[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'PROJECT'});
        }
        // verify Tags
        if ($('#XXX4_value').val() && !$scope.task.taskTags[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'TAGS'});
        }
        // verify Company
        if ($('#XXX15_value').val() && !$scope.task.company[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COMPANY'});
        }
        // verify Person
        if ($('#XXX16_value').val() && !$scope.task.person[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'PERSON'});
        }
        // verify SalesPipeline
        if ($('#XXX17_value').val() && !$scope.task.salesPipeline[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'SALES_PIPELINE'});
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
       * @memberof TaskCtrl
       * @method
       * @name post
       * @description post form
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.task.assignedToId = $scope.taskTmp.assignedToTeam ? $scope.selectedTeamUser.id : null;
          // convert start_time and end_time to timezone 0 as displayed
          $scope.task.startDate = DateService.setDateAsUTC0($scope.task.startDate);
          $scope.task.dueDate = DateService.setDateAsUTC0($scope.task.dueDate);
          $scope.task.finishDate = $scope.task.finishDate ? DateService.setDateAsUTC0($scope.task.finishDate) : $scope.task.finishDate;
          $scope.pageAncestor.post(function () {
            return TasksService.post($scope.task).then(function (promise) {
              if (promise.data.id) {
                var path = $scope.task.pathAfterUpdateExt || ('/task/' + promise.data.id);
                $location.path(path);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name put
       * @description put form
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.task.assignedToId = $scope.taskTmp.assignedToTeam ? $scope.selectedTeamUser.id : null;
          // convert start_time and end_time to timezone 0 as displayed
          $scope.task.startDate = DateService.setDateAsUTC0($scope.task.startDate);
          $scope.task.dueDate = DateService.setDateAsUTC0($scope.task.dueDate);
          $scope.task.finishDate = $scope.task.finishDate ? DateService.setDateAsUTC0($scope.task.finishDate) : $scope.task.finishDate;
          $scope.pageAncestor.put(function () {
            return TasksService.put($scope.task).then(function (promise) {
              //$scope.openRecord(promise.data.id);
              return promise;
            });
          });
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name del
       * @description delete form
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return TasksService.del($scope.task).then(function (promise) {
            if (promise.data.id) {
              $location.path('/task/' + promise.data.id);
            } else {
              $location.path('/tasks');
            }
            return promise;
          });
        });
      };

      /**
       * @memberof TaskCtrl
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
            dropDown: [{name: 'DELETE_TASK', onClick: $scope.del, disabled: function () { return !($scope.task.id); }}],
            disabled: !($scope.task.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () { return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        if ($scope.task.id) {
          save = {name: 'SAVE', onClick: $scope.put, disabled: function () { return false; }};
        } else {
          save = {name: 'SAVE', onClick: $scope.post, disabled: function () { return false; }};
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadTags
       * @description load data for tags
       * @returns void
       */
      $scope.loadTags = function () {
        TasksService.tags().then(function (result) {
          $scope.localDataTags = result.data;
        });
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadTimeZones
       * @description load data for timeZone
       * @returns void
       */
      $scope.loadTimeZones = function () {
        var i, l;
        TimeZonesService.list().then(function (result) {
          $scope.timeZones = result.data;
          if ($scope.task.id) {
            return;
          }
          // Only for new Task
          for (i = 0, l = $scope.timeZones.length; i < l; i += 1) {
            if ($scope.timeZones[i].default === 1) {
              $scope.task.timezoneName = $scope.timeZones[i].name;
              return;
            }
          }
          // set default for new Task without user settings
          if ($scope.timeZones) {
            $scope.task.timezoneName = $scope.timeZones[0].name;
          }
        });
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setTimeZone
       * @description set timeZone
       * @param index {Number} index of timeZones
       * @returns void
       */
      $scope.setTimeZone = function (index) {
        $scope.task.timezoneName = $scope.timeZones[index].name;
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setReminder
       * @description set reminder
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setReminder = function (index) {
        $scope.task.reminder = $scope.listReminder[index].value === 0 ? 0 : 1;
        $scope.task.reminderSeconds = $scope.listReminder[index].value;
        $scope.taskTmp.tmpReminder = $scope.listReminder[index].name;
        $scope.taskTmp.tmpReminderPrefix = $scope.listReminder[index].prefix;
        //$scope.taskTmp.tmpReminderIndex = $scope.listReminder[index].id;
        $scope.taskTmp.tmpReminderIndex = index;
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setPriority
       * @description set priority
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setPriority = function (index) {
        $scope.task.priority = $scope.priority[index].id;
        $scope.selectedPriority = $scope.priority[index];
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name selectTeamUser
       * @description select team user
       * @param index {Number} index of users
       * @returns void
       */
      $scope.selectTeamUser = function (index) {
        $scope.selectedTeamUser = $scope.usersWithoutOwner[index];
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name getCompanyId
       * @description get company_id
       * @returns Number
       */
      $scope.getCompanyId = function () {
        var result = 0;
        if ($scope.task.company && $scope.task.company[0] && Tools.isNumber($scope.task.company[0].id)) {
          result = $scope.task.company[0].id;
        }
        return result;
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setSalesPipelineStage
       * @description set sales pipeline stage
       * @param index {Number} index of sales pipelines stages
       * @returns void
       */
      $scope.setSalesPipelineStage = function (index) {
        $scope.task.salesPipelineStageId = $scope.salesPipelineStages[index].id;
        $scope.taskTmp.tmpSalesPipelineStage = $scope.salesPipelineStages[index].name;
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadSalesPipelineStages
       * @description load data for sales pipeline stages
       * @returns void
       */
      $scope.loadSalesPipelineStages = function () {
        SalesPipelineService.listMyStages().then(function (result) {
          $scope.salesPipelineStages = result.data;
          for (m = 0, n = $scope.salesPipelineStages.length; m < n; m += 1) {
            if ($scope.salesPipelineStages[m].id === $scope.task.salesPipelineStageId) {
              $scope.taskTmp.tmpSalesPipelineStage = $scope.salesPipelineStages[m].name;
              break;
            }
          }
        });
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadRelatedTasks
       * @description load all related tasks for task
       * @returns void
       */
      $scope.loadRelatedTasks = function () {
        if ($scope.task.id) {
          TasksService.relatedList($scope.task).then(function (result) {
            $scope.relatedTasksList[$scope.relatedIndex] = result.data;
          });
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadRelatedPrecedingTasks
       * @description load related preceding tasks for task
       * @returns void
       */
      $scope.loadRelatedPrecedingTasks = function () {
        if ($scope.task.id) {
          TasksService.relatedPrecedingList($scope.task).then(function (result) {
            $scope.relatedTasksList[$scope.relatedPrecedingIndex] = result.data;
          });
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name loadRelatedFollowingTasks
       * @description load related following tasks for task
       * @returns void
       */
      $scope.loadRelatedFollowingTasks = function () {
        if ($scope.task.id) {
          TasksService.relatedFollowingList($scope.task).then(function (result) {
            $scope.relatedTasksList[$scope.relatedFollowingIndex] = result.data;
          });
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setTabsRelated
       * @description set property tabsRelated
       * @returns void
       */
      $scope.setTabsRelated = function (index) {
        $scope.tabsRelated = [false, false, false];
        $scope.tabsRelated[index] = true;
        $scope.relatedTaskIndex = index;
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name recalculateDateTime
       * @description recalculate date time
       * @returns void
       */
      $scope.recalculateDateTime = function () {
        var startDate, startTime, dueDate, dueTime;
        startDate = DateService.getDateWithMomemtJs($scope.taskTmp.startDate, $('#XXX1010').val());
        startTime = DateService.getDateTimeWithMomemtJs($scope.task.startDate, $scope.taskTmp.startTime, $('#XXX1111').val());
        dueDate = DateService.getDateWithMomemtJs($scope.taskTmp.dueDate, $('#XXX88').val());
        dueTime = DateService.getDateTimeWithMomemtJs($scope.task.dueDate, $scope.taskTmp.dueTime, $('#XXX99').val());
        $scope.task.startDate = startTime ? DateService.setTime(startDate, startTime) : startDate;
        $scope.task.dueDate = dueTime ? DateService.setTime(dueDate, dueTime) : dueDate;
        if ($scope.task.startDate > $scope.task.dueDate) {
          $scope.task.dueDate = $scope.task.startDate;
          $scope.taskTmp.dueDate = $scope.task.startDate.toISOString();
          $scope.taskTmp.dueTime = $scope.task.startDate.toISOString();
        }
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name setFinishTime
       * @description set time to finish date
       * @returns void
       */
      $scope.setFinishTime = function () {
        $scope.task.finishDate = DateService.setTime($scope.task.finishDate, $scope.taskTmp.finishTime);
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name newTask
       * @description new task
       * @returns void
       */
      $scope.newTask = function () {
        $scope.task = {};
        $location.path('/task');
      };

      /**
       * @memberof TaskCtrl
       * @method
       * @name copy task
       * @description copy task as new
       * @returns void
       */
      $scope.copyTaskAsNew = function () {
        MessengerService.clear();
        $scope.task.id = null;
        MessengerService.setData($scope.task);
        $location.path('/task');
      };

      // Watchers
      $scope.$watch('task.company', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.task.salesPipeline = [];
          $scope.task.salesPipelineStageId = null;
          $scope.taskTmp.tmpSalesPipelineStage = null;
          $scope.taskTmp.tmpSalesPipeline = null;
        }
      }, true);

      $scope.$watch('task.salesPipeline', function (newValue, oldValue) {
        if (oldValue !== newValue && !$scope.task.salesPipelineStageId) {
          if (newValue.length === 0) {
            return;
          }
          var i, l, arr = [], arrN = [];
          for (i = 0, l = $scope.salesPipelineStages.length; i < l; i += 1) {
            arrN[i] = arr[i] = parseInt($scope.salesPipelineStages[i].id, 10);
          }
          $scope.setSalesPipelineStage(arrN.indexOf(arr.sort()[0]));
        }
      }, true);

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'task',
        table: 'TASKS'
      });

      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      $scope.initButtons();
      $scope.loadTags();
      $scope.loadTimeZones();
      $scope.loadSalesPipelineStages();
      $scope.loadRelatedTasks();
      $scope.loadRelatedPrecedingTasks();
      $scope.loadRelatedFollowingTasks();
      $timeout(function () {
        $scope.pageAncestor.setDefault();
      }, 1000);
      // set event for close Timepicket
      $('#btTimeStart').focusout(function () {
        $('#groupTimepickerStart .timepicker').remove();
        $scope.showTPstart = false;
        $scope.$apply();
      });
      $('#btTimeDue').focusout(function () {
        $('#groupTimepickerDue .timepicker').remove();
        $scope.showTPdue = false;
        $scope.$apply();
      });
      $('#btTimeFinish').focusout(function () {
        $('#groupTimepickerFinish .timepicker').remove();
        $scope.showTPfinish = false;
        $scope.$apply();
      });
    }]);
