/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file appointment
 * @fileOverview AppointmentCtrl
 */

/**
 * @namespace AppointmentCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('AppointmentCtrl', ['$scope', '$rootScope', '$location', '$filter', '$timeout', '$translate', '$translatePartialLoader', 'PageAncestor', 'AppointmentService', 'DateService', 'TimeZonesService', 'PeopleService', 'Tools', 'SalesPipelineService', 'UsersService', 'Constants', 'DatepickerFactory', 'MessengerService', 'TasksService', 'initialData',
    function ($scope, $rootScope, $location, $filter, $timeout, $translate, $translatePartialLoader, PageAncestor, AppointmentService, DateService, TimeZonesService, PeopleService, Tools, SalesPipelineService, UsersService, Constants, DatepickerFactory, MessengerService, TasksService, initialData) {
      $translatePartialLoader.addPart('appointment');
      $translate.refresh();
      $scope.appointment = initialData.appointment;
      $scope.appointmentTypes = initialData.types;
      $scope.appointmentPlaces = initialData.places;
      $scope.appointmentTmp = {};
      $scope.openCalendar = false;
      $scope.isSettingTypeEvent = false;
      $scope.isEnableCalculate = true;
      var newDateTimeStart, newDateTimeEnd, tmpDate, m, n;
      $scope.listDateFrom = [ // next free time, tomorrow
        {prefix: '', name: 'NEXT_FREE_TIME', value: 'NEXT_FREE_TIME'},
        {prefix: '', name: 'TOMORROW', value: 24 * 60 * 60 * 1000, rounding: [0, 15, 30, 45, 60], roundingLevel: 'mi'}
      ];
      $scope.listDateTo = {
        allDay: [ // 1 d, 2 d, 3 d, 1 week, 2 week, 1 month
          {prefix: '1', name: 'DAY', value: 24 * 60 * 60 * 1000},
          {prefix: '2', name: 'DAYS', value: 2 * 24 * 60 * 60 * 1000},
          {prefix: '3', name: 'DAYS', value: 3 * 24 * 60 * 60 * 1000},
          {prefix: 'A', name: 'WEEK', value: 7 * 24 * 60 * 60 * 1000},
          {prefix: '2', name: 'WEEKS', value: 14 * 24 * 60 * 60 * 1000},
          {prefix: 'A', name: 'MONTH', value: 'M'}
        ],
        other: [ // 5 min, 15 min, 30 min, 60 min, 90 min, 120 min, 180 min
          {prefix: '5', name: 'MINUTES', value: 5 * 60 * 1000},
          {prefix: '15', name: 'MINUTES', value: 15 * 60 * 1000},
          {prefix: '30', name: 'MINUTES', value: 30 * 60 * 1000},
          {prefix: '1', name: 'HOUR', value: 60 * 60 * 1000},
          {prefix: '90', name: 'MINUTES', value: 90 * 60 * 1000},
          {prefix: '2', name: 'HOURS', value: 120 * 60 * 1000},
          {prefix: '3', name: 'HOURS', value: 180 * 60 * 1000}
        ]
      };
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
      // setting date
      if ($scope.appointment.start_time) {
        tmpDate = new Date($scope.appointment.start_time);
        // date from DB is UTC0, datepicker convert to local time zone, we must minus time offset for current show
        newDateTimeStart = DateService.addMilliseconds(tmpDate, tmpDate.getTimezoneOffset() * 60 * 1000);
      } else {
        newDateTimeStart = DateService.round(new Date(), [0, 30, 60], 'mi');
      }
      if ($scope.appointment.end_time) {
        tmpDate = new Date($scope.appointment.end_time);
        // date from DB is UTC0, datepicker convert to local time zone, we must minus time offset for current show
        newDateTimeEnd = DateService.addMilliseconds(tmpDate, tmpDate.getTimezoneOffset() * 60 * 1000);
      } else {
        newDateTimeEnd = new Date();
      }
      // Exists record
      if ($scope.appointment.id || $scope.appointment.isCopy) {
        $scope.appointmentTmp.tmpReminderIndex = 0;
        $scope.appointmentTmp.tmpAttendeeReminderIndex = 0;
        $scope.appointmentTmp.tmpTeamReminderIndex = 0;
        for (m = 0, n = $scope.listReminder.length; m < n; m += 1) {
          if ($scope.listReminder[m].value === parseInt($scope.appointment.reminder_seconds, 10)) {
            $scope.appointmentTmp.tmpReminderIndex = m;
          }
          if ($scope.listReminder[m].value === parseInt($scope.appointment.team_reminder_seconds, 10)) {
            $scope.appointmentTmp.tmpTeamReminderIndex = m;
          }
          if ($scope.listReminder[m].value === parseInt($scope.appointment.attendee_reminder_seconds, 10)) {
            $scope.appointmentTmp.tmpAttendeeReminderIndex = m;
          }
        }
        $scope.appointmentTmp.tmpSalesPipelineStage = $scope.appointment.sales_pipeline_stage_name;
        // Team reminder
        $timeout(function () {
          // Reminder
          $scope.appointmentTmp.tmpReminder = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].name;
          $scope.appointmentTmp.tmpReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].prefix;
          // Team reminder
          $scope.appointmentTmp.tmpTeamReminder = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].name;
          $scope.appointmentTmp.tmpTeamReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].prefix;
          // Attendee reminder
          $scope.appointmentTmp.tmpAttendeeReminder = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].name;
          $scope.appointmentTmp.tmpAttendeeReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].prefix;
        }, 500);
      } else { // New record
        // set default
        $scope.appointmentTmp.tmpReminderIndex = 2;
        $scope.appointmentTmp.tmpTeamReminderIndex = 5;
        $scope.appointmentTmp.tmpAttendeeReminderIndex = 5;
        // Reminder
        if ($scope.appointmentTmp.tmpReminderIndex) {
          $scope.appointment.reminder = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].value === 0 ? 0 : 1;
          $scope.appointment.reminder_seconds = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].value;
          $timeout(function () {
            $scope.appointmentTmp.tmpReminder = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].name;
            $scope.appointmentTmp.tmpReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpReminderIndex].prefix;
          }, 500);
        }
        // Team reminder
        if ($scope.appointmentTmp.tmpTeamReminderIndex) {
          $scope.appointment.team_reminder = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].value === 0 ? 0 : 1;
          $scope.appointment.team_reminder_seconds = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].value;
          $timeout(function () {
            $scope.appointmentTmp.tmpTeamReminder = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].name;
            $scope.appointmentTmp.tmpTeamReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpTeamReminderIndex].prefix;
          }, 500);
        }
        // Attendee reminder
        if ($scope.appointmentTmp.tmpAttendeeReminderIndex) {
          $scope.appointment.attendee_reminder = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].value === 0 ? 0 : 1;
          $scope.appointment.attendee_reminder_seconds = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].value;
          $timeout(function () {
            $scope.appointmentTmp.tmpAttendeeReminder = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].name;
            $scope.appointmentTmp.tmpAttendeeReminderPrefix = $scope.listReminder[$scope.appointmentTmp.tmpAttendeeReminderIndex].prefix;
          }, 500);
        }
      }

      newDateTimeStart.setSeconds(0);
      newDateTimeStart.setMilliseconds(0);
      newDateTimeStart = new Date(newDateTimeStart);
      newDateTimeEnd.setSeconds(0);
      newDateTimeEnd.setMilliseconds(0);
      newDateTimeEnd = new Date(newDateTimeEnd);

      $scope.getFormat = DateService.getFormat;
      $scope.getTimeFromTwoDate = DateService.getTimeFromTwoDate;
      $scope.calculateDateTime = function (masterDateTimeForRecalculate, recalculateRange, modelName, modelMaster, setModel) {
        AppointmentService.calculateDateTime($scope, masterDateTimeForRecalculate, recalculateRange, modelName, modelMaster, setModel);
      };
      $scope.setType = function (index) {
        $scope.isSettingEvent = true;
        AppointmentService.setType($scope, index);
      };
      $scope.setDefaultPlaces = function (index) {
        AppointmentService.setDefaultPlaces($scope);
      };
      $scope.salesPipelineStages = [];
      $scope.appointment.appointment_tags = $scope.appointment.appointment_tags || [];
      $scope.appointment.company = $scope.appointment.company || [];
      $scope.appointment.salesPipeline = $scope.appointment.salesPipeline || [];
      $scope.appointment.teamReminderMembers = $scope.appointment.teamReminderMembers || [];
      $scope.appointment.attendeeReminderMembers = $scope.appointment.attendeeReminderMembers || [];
      $scope.appointment.locationBox = $scope.appointment.locationBox || [];
      $scope.localDataTags = [];
      $scope.localDataAddress = [];
      $scope.localDataUsers = [];
      $scope.appointment.start_time = newDateTimeStart;
      $scope.appointment.end_time = newDateTimeEnd;
      $scope.appointmentTmp.tmpStartTime = newDateTimeStart;
      $scope.appointmentTmp.tmpStartDate = newDateTimeStart;
      $scope.appointmentTmp.tmpEndDate = newDateTimeEnd;
      $scope.appointmentTmp.tmpEndTime = newDateTimeEnd;
      $scope.timeFromReadOnly = false;
      $scope.timeToReadOnly = false;
      $scope.timeSize = '';
      $scope.timeZones = [];
      $scope.appointment.projects = $scope.appointment.projects || [];
      $scope.appointment.text = $scope.appointment.text || {};
      $scope.attachmentsTable = Constants.ATTACHMENTS_TYPES.APPOINTMENT;
      $scope.attachmentsInfo = {config: {selectFileHash: null}};
      $scope.tasks = [];
      $scope.taskPaging = {};
      $scope.taskPaging.infoPaging = {};
      $scope.taskPaging.dataLoader = TasksService.listForAppointment;
      $scope.taskPaging.dataLoaderParams = {
        sortField: 'id',
        sortDirection: 'asc',
        loadCount: true
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name initButtons
       * @description init actionButtons
       * @returns void
       */
      $scope.initButtons = function () {
        $scope.actionButtons = [
          {
            name: 'DELETE',
            dropDown: [
              {
                name: 'DELETE_APPOINTMENT',
                onClick: $scope.del,
                disabled: function () {
                  return !($scope.appointment.id);
                }
              }
            ],
            disabled: !($scope.appointment.id)
          },
          {
            name: 'CANCEL',
            onClick: $scope.pageAncestor.cancel,
            disabled: function () {
              return !$scope.pageAncestor.log.changes.isChanged;
            }
          },
          {
            name: 'SAVE',
            dropDown: [
              {
                name: 'SAVE',
                onClick: function () {
                  var obj;
                  if ($scope.appointment.id) {
                    obj = {eventAfterOperation: $scope.afterUpdate};
                    $scope.put(obj);
                  } else {
                    obj = {eventAfterOperation: $scope.openRecord};
                    $scope.post(obj);
                  }
                },
                disabled: function () {
                  return false;
                }
              },
              {
                name: 'SAVE_OPEN_CALENDAR',
                onClick: function () {
                  var obj = {eventAfterOperation: $scope.openInCalendar};
                  if ($scope.appointment.id) {
                    $scope.put(obj);
                  } else {
                    $scope.post(obj);
                  }
                },
                disabled: function () {
                  return false;
                }
              },
              {
                name: 'SAVE_OPEN_AGENDA',
                onClick: function () {
                  var obj = {eventAfterOperation: $scope.openInAgenda};
                  if ($scope.appointment.id) {
                    $scope.put(obj);
                  } else {
                    $scope.post(obj);
                  }
                },
                disabled: function () {
                  return false;
                }
              }
            ]
          }
        ];
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name verifyForm
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify type_id input data
        if (!$scope.appointment.type_id) {
          result = false;
          verifyMessages.push({message: 'TYPE'});
        }
        // verify place input data
        if (!$scope.appointment.place) {
          result = false;
          verifyMessages.push({message: 'PLACE'});
        }
        // verify start_time input data
        if (!$scope.appointment.start_time || !(new Date($scope.appointment.start_time) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DATE_FROM'});
        }
        // verify end_time input data
        if (!$scope.appointment.end_time || !(new Date($scope.appointment.end_time) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DATE_TO'});
        }
        // verify end_time input data
        if ($scope.appointment.end_time && $scope.appointment.start_time && new Date($scope.appointment.end_time) < new Date($scope.appointment.start_time)) {
          result = false;
          verifyMessages.push({message: 'DATE_RANGE'});
        }
        // verify time_zone input data
        if (!$scope.appointment.timezone_name) {
          result = false;
          verifyMessages.push({message: 'TIMEZONE'});
        }
        // verify Tags
        if ($('#XXX6_value').val() && !$scope.appointment.appointment_tags[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'TAGS'});
        }
        // verify Company
        if ($('#XXX11_value').val() && !$scope.appointment.company[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'COMPANY'});
        }
        // verify SalesPipeline
        if ($('#XXX12_value').val() && !$scope.appointment.salesPipeline[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'SALES_PIPELINE'});
        }
        // verify team members
        if ($('#XXX23_value').val() && !$scope.appointment.teamReminderMembers[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'TEAM_MEMBERS'});
        }
        // verify attendee
        if ($('#XXX22_value').val() && !$scope.appointment.attendeeReminderMembers[0]) {
          result = false;
          verifyMessages.push({message: 'ANGUCOMPLETE_NOT_SELECTED', sufix: 'ATTENDEE'});
        }

        for (i = 0, l = verifyMessages.length; i < l; i += 1) {
          if (i > 1) {
            verifyMessages[i].prefix = ', ';
          }
        }
        if (!result) {
          $scope.pageAncestor.addAlert({
            type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD,
            messages: verifyMessages
          });
        }
        return result;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name post
       * @description post form
       * @param obj {Object} obj
       * @returns void
       */
      $scope.post = function (obj) {
        if ($scope.verifyForm()) {
          // convert start_time and end_time to timezone 0 as displayed
          $scope.appointment.start_time = DateService.setDateAsUTC0($scope.appointment.start_time);
          $scope.appointment.end_time = DateService.setDateAsUTC0($scope.appointment.end_time);
          $scope.pageAncestor.post(function () {
            return AppointmentService.post($scope.appointment).then(function (promise) {
              if (obj && obj.eventAfterOperation) {
                obj.eventAfterOperation(promise.data);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name put
       * @description put form
       * @param obj {Object} obj
       * @returns void
       */
      $scope.put = function (obj) {
        if ($scope.verifyForm()) {
          // convert start_time and end_time to timezone 0 as displayed
          $scope.appointment.start_time = DateService.setDateAsUTC0($scope.appointment.start_time);
          $scope.appointment.end_time = DateService.setDateAsUTC0($scope.appointment.end_time);
          $scope.pageAncestor.put(function () {
            return AppointmentService.put($scope.appointment).then(function (promise) {
              if (obj && obj.eventAfterOperation) {
                obj.eventAfterOperation(promise.data);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name del
       * @description delete form
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return AppointmentService.del($scope.appointment).then(function (promise) {
            if (promise.data.id) {
              $location.path('/appointment' + promise.data.id);
            } else {
              $location.path('/appointments');
            }
            return promise;
          });
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name loadTags
       * @description load data for tags
       * @returns void
       */
      $scope.loadTags = function () {
        AppointmentService.tags().then(function (result) {
          $scope.localDataTags = result.data;
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name loadTimeZones
       * @description load data for timeZone
       * @returns void
       */
      $scope.loadTimeZones = function () {
        var i, l;
        TimeZonesService.list().then(function (result) {
          $scope.timeZones = result.data;
          if ($scope.appointment.id) {
            return;
          }
          // Only for new Appointment
          for (i = 0, l = $scope.timeZones.length; i < l; i += 1) {
            if ($scope.timeZones[i].default === 1) {
              $scope.appointment.timezone_name = $scope.timeZones[i].name;
              return;
            }
          }
          // set default for new Appointment without user settings
          if ($scope.timeZones) {
            $scope.appointment.timezone_name = $scope.timeZones[0].name;
          }
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name loadTimeZones
       * @description load data for timeZone
       * @returns void
       */
      $scope.loadLatestAddress = function () {
        PeopleService.latestAddress().then(function (result) {
          $scope.localDataAddress = result.data;
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name loadUsers
       * @description load data for users
       * @returns void
       */
      $scope.loadUsers = function () {
        UsersService.list().then(function (result) {
          $scope.localDataUsers = result.data;
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name loadSalesPipelineStages
       * @description load data for sales pipeline stages
       * @returns void
       */
      $scope.loadSalesPipelineStages = function () {
        SalesPipelineService.listMyStages().then(function (result) {
          $scope.salesPipelineStages = result.data;
        });
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name getCompanyId
       * @description get company_id
       * @returns Number
       */
      $scope.getCompanyId = function () {
        var result = 0;
        if ($scope.appointment.company && $scope.appointment.company[0] && Tools.isNumber($scope.appointment.company[0].id)) {
          result = $scope.appointment.company[0].id;
        }
        return result;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setSalesPipelineStage
       * @description set sales pipeline stage
       * @param index {Number} index of sales pipelines stages
       * @returns void
       */
      $scope.setSalesPipelineStage = function (index) {
        $scope.appointment.sales_pipeline_stage_id = $scope.salesPipelineStages[index].id;
        $scope.appointmentTmp.tmpSalesPipelineStage = $scope.salesPipelineStages[index].name;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setTimeZone
       * @description set timeZone
       * @param index {Number} index of timeZones
       * @returns void
       */
      $scope.setTimeZone = function (index) {
        $scope.appointment.timezone_name = $scope.timeZones[index].name;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setDateTimeTo
       * @description set timeTo
       * @param ms {Number} milliseconds
       * @returns void
       */
      $scope.setDateTimeTo = function (ms) {
        if (!ms) {
          ms = $scope.getMillisecondsForType();
        }
        $scope.appointmentTmp.tmpEndDate = DateService.addMilliseconds($scope.appointment.start_time, ms).toISOString();
        $scope.appointmentTmp.tmpEndTime = DateService.addMilliseconds($scope.appointment.start_time, ms).toISOString();
        $scope.appointment.end_time = DateService.addMilliseconds($scope.appointment.start_time, ms).toISOString();
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name $scope.getMillisecondsForType
       * @description get milliseconds for type appointment
       * @returns Number
       */
      $scope.getMillisecondsForType = function () {
        var ms = 0, i, l;
        if ($scope.appointment.type_id) {
          for (i = 0, l = $scope.appointmentTypes.length; i < l; i += 1) {
            if (parseInt($scope.appointmentTypes[i].id, 10) === parseInt($scope.appointment.type_id, 10)) {
              ms = $scope.appointmentTypes[i].addMs;
              break;
            }
          }
        }
        return ms;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setDateFrom
       * @description set date from
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setDateFrom = function (index) {
        var item = $scope.listDateFrom[index], date, nextFreeTime;
        date = (new Date()).toISOString();
        if (item.value === 'NEXT_FREE_TIME') {
          AppointmentService.nextFreeTime().then(function (promise) {
            nextFreeTime = new Date(promise.data.next_free_time);
            if (nextFreeTime < new Date()) {
              nextFreeTime = new Date();
              nextFreeTime.setSeconds(0);
              nextFreeTime.setMilliseconds(0);
            }
            $scope.appointment.start_time = new Date(nextFreeTime);
          });
        } else {
          $scope.appointment.start_time = DateService.round(DateService.addMilliseconds(date, item.value), item.rounding, item.roundingLevel);
        }
        $scope.calculateDateTime($scope.appointment.start_time, true, null, null, null);
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setReminder
       * @description set reminder
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setReminder = function (index) {
        $scope.appointment.reminder = $scope.listReminder[index].value === 0 ? 0 : 1;
        $scope.appointment.reminder_seconds = $scope.listReminder[index].value;
        $scope.appointmentTmp.tmpReminder = $scope.listReminder[index].name;
        $scope.appointmentTmp.tmpReminderPrefix = $scope.listReminder[index].prefix;
        $scope.appointmentTmp.tmpReminderIndex = $scope.listReminder[index].id;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setReminderTeamMembers
       * @description set reminder for team members
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setReminderTeamMembers = function (index) {
        $scope.appointment.team_reminder = $scope.listReminder[index].value === 0 ? 0 : 1;
        $scope.appointment.team_reminder_seconds = $scope.listReminder[index].value;
        $scope.appointmentTmp.tmpTeamReminderPrefix = $scope.listReminder[index].prefix;
        $scope.appointmentTmp.tmpTeamReminder = $scope.listReminder[index].name;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setReminderAttendes
       * @description set reminder for attendees
       * @param index {Number} index of list definitions
       * @returns void
       */
      $scope.setReminderAttendees = function (index) {
        $scope.appointment.attendee_reminder = $scope.listReminder[index].value === 0 ? 0 : 1;
        $scope.appointment.attendee_reminder_seconds = $scope.listReminder[index].value;
        $scope.appointmentTmp.tmpAttendeeReminderPrefix = $scope.listReminder[index].prefix;
        $scope.appointmentTmp.tmpAttendeeReminder = $scope.listReminder[index].name;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setPlace
       * @description set place
       * @param index {Number} index of places
       * @returns void
       */
      $scope.setPlace = function (index) {
        $scope.appointment.place = $scope.appointmentPlaces[index].name;
        $scope.appointmentTmp.tmpPlaceId = $scope.appointmentPlaces[index].id;
        switch (parseInt($scope.appointmentTmp.tmpPlaceId, 10)) {
        case 1:
          PeopleService.businessAddress().then(function (promise) {
            var rec = promise.data;
            $scope.appointment.location = Tools.join([rec.business_addr_street, rec.business_addr_city, rec.business_addr_zip, rec.business_addr_country], ', ');
          });
          break;
        case 2:
          PeopleService.homeAddress().then(function (promise) {
            var rec = promise.data;
            $scope.appointment.location = Tools.join([rec.home_addr_street, rec.home_addr_city, rec.home_addr_zip, rec.home_addr_country], ', ');
          });
          break;
        case 3:
          $scope.appointment.location = '';
          break;
        default:
          $scope.appointment.location = '';
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name openRecord
       * @description open record of appointment
       * @param obj {Object}
       * @returns void
       */
      $scope.openRecord = function (obj) {
        if (obj && !$scope.appointment.id) {
          $location.path('/appointment/' + obj.id);
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name onSelectOpportunity
       * @description on select opportunity
       * @param obj {Object} object
       * @returns void
       */
      $scope.onSelectOpportunity = function (obj) {
        var index = 0;
        $scope.salesPipelineStages.map(function (el, i) {
          if (el.id === obj.stageId) {
            index = i;
          }
        });
        $scope.setSalesPipelineStage(index);
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name onDeleteOpportunity
       * @description on delete opportunity from angucomplete
       * @param index {Number} index
       * @returns void
       */
      $scope.onDeleteOpportunity = function (index) {
        $scope.setSalesPipelineStage(0);
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name newAppointment
       * @description new appointment
       * @returns void
       */
      $scope.newAppointment = function () {
        if ($location.path() === '/appointment') {
          $scope.appointment = {};
        }
        $location.path('/appointment');
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name copy appointment
       * @description copy appointment as new
       * @returns void
       */
      $scope.copyAppointmentAsNew = function () {
        if (!$scope.appointment.id) {
          return;
        }
        MessengerService.clear();
        $scope.appointment.id = null;
        $scope.appointment.isCopy = true;
        MessengerService.setData({appointment: $scope.appointment});
        $location.path('/appointment');
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name openInAgenda
       * @description open in agenda
       * @returns void
       */
      $scope.openInAgenda = function () {
        if (!$scope.appointment.id) {
          return;
        }
        MessengerService.clear();
        MessengerService.setData({selectedDate: $scope.appointment.start_time});
        $location.path('/agenda');
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name openInCalendar
       * @description open in calendar
       * @returns void
       */
      $scope.openInCalendar = function () {
        if (!$scope.appointment.id) {
          return;
        }
        var time, date;
        date = (new Date($scope.appointment.start_time)).toISOString();
        time = date.substring(date.indexOf('T') + 1, date.indexOf('.'));
        MessengerService.clear();
        MessengerService.setData({
          appointmentId: $scope.appointment.id,
          scrollTime: time,
          defaultView: Constants.FULLCALENDAR_WEEK_AGENDA,
          defaultCalendarDate: date
        });
        $location.path('/calendar');
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name showPill
       * @description show and open pill and show main pill
       * @param index {Number} index of pill
       * @returns void
       */
      $scope.showPill = function (index) {
        var i, l;
        for (i = 0, l = $scope.pills.length; i < l; i += 1) {
          $scope.activePillsIndex = i === index ? i : $scope.activePillsIndex;
          $scope.pills[i].active = i === index;
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name deleteDetailedDescription
       * @description delete text and hide text pill
       * @returns void
       */
      $scope.deleteDetailedDescription = function () {
        $scope.pageAncestor.confirm(
          function () {
            var obj = {id: $scope.appointment.text.id};
            return AppointmentService.deleteDetailedDescription(obj).then(function (promise) {
              $scope.appointment.text = {};
              $scope.setPillsDefault();
              return promise;
            });
          },
          Constants.MESSAGE_EXEC_DELETE_TEXT,
          Constants.MESSAGE_EXEC_DELETE_TEXT_SUCCESS,
          Constants.MESSAGE_EXEC_DELETE_TEXT_ERROR
        );
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name setPillsDefault
       * @description default setings of pills
       * @returns void
       */
      $scope.setPillsDefault = function () {
        $scope.pills = [
          {
            name: 'MAIN'
          },
          {
            name: 'EDITOR',
            count: function () { return $scope.appointment.text && $scope.appointment.text.id ? 1 : null; }
          },
          {
            name: 'TASKS',
            count: function () { return $scope.tasks.length; }
          },
          {
            name: 'ATTACHMENTS',
            count: function () {
              return ($scope.attachmentsInfo.paging && $scope.attachmentsInfo.paging.summary ? (parseInt($scope.attachmentsInfo.paging.summary.count, 10) || 0) : 0);
            }
          }
        ];
        $scope.activePillsIndex = 0;
        $scope.pills[0].active = true;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name afterUpdate
       * @description after update operations
       * @param obj {Object}
       * @returns void
       */
      $scope.afterUpdate = function (obj) {
        if (obj) {
          $scope.appointment.text.id = obj.textId;
        }
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name getAttachmentsCount
       * @description count of attachments
       * @returns Number
       */
      $scope.getAttachmentsCount = function () {
        return $scope.attachmentsInfo.paging && $scope.attachmentsInfo.paging.summary && $scope.attachmentsInfo.paging.summary.count ? parseInt($scope.attachmentsInfo.paging.summary.count, 10) : 0;
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name addAttachment
       * @description add attachment
       * @returns void
       */
      $scope.addAttachment = function () {
        if (!$scope.appointment.id) {
          return;
        }
        $scope.showPill(3);
        $scope.attachmentsInfo.config.selectFileHash = Math.random();
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name addTask
       * @description add task
       * @returns void
       */
      $scope.addTask = function () {
        if (!$scope.appointment.id) {
          return;
        }
        var task = $scope.defaultObjectForTask();
        MessengerService.setData(task);
        $location.path(Constants.ROUTES.TASK);
      };

      /**
       * @memberof AppointmentCtrl
       * @method
       * @name defaultObjectForTask
       * @description create object for task
       * @returns Object
       */
      $scope.defaultObjectForTask = function () {
        return {
          task: {
            subject: $scope.appointment.subject,
            company: $scope.appointment.company,
            salesPipeline: $scope.appointment.salesPipeline,
            appointmentId: $scope.appointment.id,
            pathAfterUpdateExt: Constants.ROUTES.APPOINTMENT + $scope.appointment.id
          }
        };
      };

      // Watchers
      $scope.$watch('appointment.company', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.appointment.salesPipeline = [];
          $scope.setSalesPipelineStage(0);
          $scope.appointmentTmp.tmpSalesPipeline = null;
        }
      }, true);

      $scope.$watch('appointment.salesPipeline', function (newValue, oldValue) {
        if (oldValue !== newValue && !$scope.appointment.sales_pipeline_stage_id) {
          var i, l, arr = [], arrN = [];
          for (i = 0, l = $scope.salesPipelineStages.length; i < l; i += 1) {
            arrN[i] = arr[i] = parseInt($scope.salesPipelineStages[i].id, 10);
          }
          $scope.setSalesPipelineStage(arrN.indexOf(arr.sort()[0]));
        }
      }, true);

      $scope.$watch('appointment.start_time', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $timeout(function () {
            $scope.timeSize = $scope.getTimeFromTwoDate($scope.appointment.start_time, $scope.appointment.end_time,
              $scope.appointment.type_id === Constants.APPOINTMENT_TYPES.ALL_DAY_EVENT);
          }, 400);
        }
      }, true);

      $scope.$watch('appointment.end_time', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $timeout(function () {
            $scope.timeSize = $scope.getTimeFromTwoDate($scope.appointment.start_time, $scope.appointment.end_time,
              $scope.appointment.type_id === Constants.APPOINTMENT_TYPES.ALL_DAY_EVENT);
          }, 400);
        }
      }, true);

      $scope.$watch('appointment.locationBox', function (newValue, oldValue) {
        if (oldValue !== newValue) {
          $scope.appointment.location = $scope.appointment.locationBox ? $scope.appointment.locationBox[0].name : null;
        }
      }, true);

      $scope.$watch('attachmentsInfo.paging.summary.count', function (newValue, oldValue) {
        if (parseInt(oldValue || '0', 10) !== parseInt(newValue || '0', 10)) {
          $scope.pills.map(function (el) {
            el.hash = Math.random();
          });
        }
      }, true);

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'appointment',
        table: 'APPOINTMENT'
      });

      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      AppointmentService.setDefaultType($scope);
      $scope.setDefaultPlaces();
      $scope.loadTags();
      $scope.loadTimeZones();
      $scope.loadLatestAddress();
      $scope.loadSalesPipelineStages();
      $scope.loadUsers();
      $scope.setPillsDefault();
      // after setting start and end date time
      $timeout(function () {
        $scope.timeSize = $scope.getTimeFromTwoDate($scope.appointment.start_time, $scope.appointment.end_time,
          $scope.appointment.type_id === Constants.APPOINTMENT_TYPES.ALL_DAY_EVENT);
      }, 600);
      $scope.initButtons();
      $timeout(function () {
        $scope.pageAncestor.setDefault();
      }, 1000);
      // set event for close Timepicket
      $('#btTimeStart').focusout(function () {
        $('#groupTimepickerStart .timepicker').remove();
        $scope.showTPstart = false;
        $scope.$apply();
      });
      $('#btTimeEnd').focusout(function () {
        $('#groupTimepickerEnd .timepicker').remove();
        $scope.showTPend = false;
        $scope.$apply();
      });
    }]);
