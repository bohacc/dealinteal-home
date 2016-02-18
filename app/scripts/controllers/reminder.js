/*jslint node: true */
'use strict';

/**
 * @file reminder
 * @fileOverview ReminderCtrl
 */

/**
 * @namespace ReminderCtrl
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('ReminderCtrl', ['$scope', '$location', '$timeout', '$translate', '$translatePartialLoader', 'PageAncestor', 'Tools', 'ReminderService', 'DatepickerFactory', 'DateService', 'Constants', 'initialData',
    function ($scope, $location, $timeout, $translate, $translatePartialLoader, PageAncestor, Tools, ReminderService, DatepickerFactory, DateService, Constants, initialData) {
      var newDate;
      // translate
      $translatePartialLoader.addPart('reminder');
      $translate.refresh();

      $scope.reminder = initialData.reminder;
      $scope.reminderTmp = {};
      $scope.reminderTmp.remindBox = [];
      $scope.reminderTmp.remindPersonName = '';
      $scope.reminderTmp.remindPersonNameModel = '';
      $scope.validateEmail = Tools.validateEmail;
      $scope.reminderTimes = [
        {prefix: '', name: 'RIGHT_NOW', value: 0},
        {prefix: '', name: 'NEXT_WORKING_DAY', value: 'NWD'},
        {prefix: '', name: 'IN_24_HOURS', value: 24 * 60 * 60 * 1000},
        {prefix: '', name: 'IN_A_WEEK', value: 7 * 24 * 60 * 60 * 1000},
        {prefix: '', name: 'IN_A_MONTH', value: 'M'}
      ];
      $scope.loginUserEmails = [];
      if ($scope.reminder.id || JSON.stringify(initialData.reminder) !== '{}') {
        $scope.reminderTmp.type = {};
        $scope.reminderTmp.remind = $scope.reminder.remind;
        $scope.reminderTmp.originalDate = $scope.reminder.original_time;
        $scope.reminderTmp.originalTime = $scope.reminder.original_time;
        // for remind type 2 - recipient is not login user
        if (parseInt($scope.reminder.remind, 10) === 2) {
          $scope.reminderTmp.remindPersonName = $scope.reminder.remind_person_name;
          $scope.reminderTmp.remindPersonNameModel = $scope.reminder.remind_person_name;
          $scope.reminderTmp.remindBox[0] = {
            id: $scope.reminder.remind_id,
            name: $scope.reminder.remind_name,
            name2: $scope.reminder.remind_person_name,
            email: $scope.reminder.remind_email,
            email2: $scope.reminder.remind_email2
          };
        }
      } else {
        newDate = DateService.round(new Date(), [0, 60], 'mi');
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        newDate = newDate.toISOString();
        $scope.reminder.original_time = newDate;
        $scope.reminder.recipient_id = $scope.meta.ownerId;
        $scope.reminderTmp.originalDate = newDate;
        $scope.reminderTmp.originalTime = newDate;
        $scope.reminderTmp.remind = 1;
        $scope.reminderTmp.type = {};
      }

      /**
       * @memberof ReminderCtrl
       * @method
       * @name setRecipient
       * @description set recipient_id property
       * @returns void
       */
      $scope.setRecipient = function () {
        var getReminder = function () {
          return $scope.reminderTmp.remindBox.length > 0 ? $scope.reminderTmp.remindBox[0].id : null;
        };
        $scope.reminder.recipient_id = parseInt($scope.reminderTmp.remind, 10) === 1 ? $scope.meta.ownerId : getReminder();
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name initType
       * @description initialization type of reminder
       * @returns void
       */
      $scope.initType = function () {
        $scope.reminderTmp.type.subject = $scope.reminder.type_subject;
        if ($scope.reminder.appointment_id) {
          $scope.reminderTmp.type.name = 'APPOINTMENT';
        }
        if ($scope.reminder.task_id) {
          $scope.reminderTmp.type.name = 'TASK';
        }
        if ($scope.reminder.goal_id) {
          $scope.reminderTmp.type.name = 'GOAL';
        }
        $scope.reminderTmp.type.exist = $scope.reminderTmp.type.name  ? true : false;
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name init emails
       * @description set emails property
       * @returns void
       */
      $scope.initEmails = function () {
        var email, email2;
        if (parseInt($scope.reminderTmp.remind, 10) === 1) {
          email = initialData.people.email;
          email2 = initialData.people.email2;
        } else {
          email = $scope.reminderTmp.remindBox[0] ? $scope.reminderTmp.remindBox[0].email : null;
          email2 = $scope.reminderTmp.remindBox[0] ? $scope.reminderTmp.remindBox[0].email2 : null;
        }
        $scope.loginUserEmails = [];
        if (email) {
          $scope.loginUserEmails.push(email);
        }
        if (email2) {
          $scope.loginUserEmails.push(email2);
        }
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name onRecipientPersonChange
       * @description event on recipient person input change
       * @returns void
       */
      $scope.onRecipientPersonChange = function () {
        if ($scope.reminderTmp.remindBox.length > 0 && $scope.reminderTmp.remindBox[0].name2 !== $scope.reminderTmp.remindPersonName) {
          $scope.reminderTmp.remindBox = [];
          $scope.setRecipient();
        }
      };

      /**
       * @memberof ReminderCtrl
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
            dropDown: [{name: 'DELETE_REMINDER', onClick: $scope.del, disabled: function () { return !($scope.reminder.id); }}],
            disabled: !($scope.reminder.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () { return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        if ($scope.reminder.id) {
          save = {name: 'SAVE', onClick: $scope.put, disabled: function () { return false; }};
        } else {
          save = {name: 'SAVE', onClick: $scope.post, disabled: function () { return false; }};
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name setDate
       * @description set date with amount
       * @params index {Number} index of range
       * @returns void
       */
      $scope.setDate = function (index) {
        var tmp = DateService.addMilliseconds(new Date(), $scope.reminderTimes[index].value).toISOString();
        $scope.reminder.original_time = tmp;
        $scope.reminderTmp.originalDate = tmp;
        $scope.reminderTmp.originalTime = tmp;
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name verifyForm
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify recipient_id input data
        if (!$scope.reminder.recipient_id) {
          result = false;
          verifyMessages.push({message: 'RECIPIENT_ID'});
        }
        // verify subject input data
        if (!$scope.reminder.subject) {
          result = false;
          verifyMessages.push({message: 'SUBJECT'});
        }
        // verify date_time input data
        if (!$scope.reminder.original_time || !(new Date($scope.reminder.original_time) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DATE_TIME'});
        }
        // verify email input data
        if ($scope.reminder.email_rem && (!Tools.validateEmail($scope.reminder.email) || $scope.reminder.email === '' || $scope.reminder.email === null || $scope.reminder.email === undefined)) {
          result = false;
          verifyMessages.push({message: 'EMAIL'});
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
       * @memberof ReminderCtrl
       * @method
       * @name post
       * @description post form
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.post(function () {
            return ReminderService.post($scope.reminder).then(function (promise) {
              if (promise.data.id) {
                $location.path('/reminder/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name put
       * @description put form
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.put(function () {
            return ReminderService.put($scope.reminder).then(function (promise) {
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ReminderCtrl
       * @method
       * @name del
       * @description delete form
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return ReminderService.del($scope.reminder).then(function (promise) {
            if (promise.data.id) {
              $location.path('/reminder/' + promise.data.id);
            } else {
              $location.path('/reminders');
            }
            return promise;
          });
        });
      };

      // Watchers
      $scope.$watch('reminderTmp.remindBox', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.initEmails();
          $scope.setRecipient();
        }
      }, true);

      $scope.$watch('reminderTmp.remind', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.initEmails();
        }
      }, true);

      $scope.$watch('reminderTmp.remindPersonName', function (newValue, oldValue) {
        if (oldValue !== newValue && oldValue !== '' && $scope.reminderTmp.remindBox.length > 0) {
          $scope.onRecipientPersonChange();
        }
      }, true);

      $scope.$watch('reminderTmp.originalDate', function (newValue, oldValue) {
        var date, time;
        if (oldValue !== newValue) {
          date = DateService.getDateWithMomemtJs($scope.reminderTmp.originalDate, $('#XXX7').val());
          time = DateService.getDateTimeWithMomemtJs($scope.reminder.original_time, $scope.reminderTmp.originalTime, $('#XXX8').val());
          $scope.reminder.original_time = newValue ? new Date(time ? DateService.setTime(date, time) : date) : null;
        }
      }, true);

      $scope.$watch('reminderTmp.originalTime', function (newValue, oldValue) {
        var date, time;
        if (oldValue !== newValue) {
          date = DateService.getDateWithMomemtJs($scope.reminderTmp.originalDate, $('#XXX7').val()) || new Date();
          time = DateService.getDateTimeWithMomemtJs($scope.reminder.original_time, $scope.reminderTmp.originalTime, $('#XXX8').val());
          $scope.reminder.original_time = newValue ? new Date(time ? DateService.setTime(date, time) : date) : null;
        }
      }, true);

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'reminder',
        table: 'REMINDER'
      });
      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      $scope.initButtons();
      $scope.initEmails();
      $scope.initType();
      $timeout(function () {
        $scope.pageAncestor.setDefault();
      }, 1000);
      // set event for close Timepicket
      $('#btTimeStart').focusout(function () {
        $('#groupTimepickerStart .timepicker').remove();
        $scope.showTPstart = false;
        $scope.$apply();
      });
    }]);
