/*jslint node: true */
'use strict';

/**
 * @file agenda
 * @fileOverview AgendaCtrl
 */

/**
 * @namespace AgendaCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('AgendaCtrl', ['$scope', '$filter', '$window', '$location', '$q', '$locale', '$translate', '$translatePartialLoader', 'DateService', 'Tools', 'AgendaService', 'Constants', 'DatepickerFactory', 'ReminderService', 'PageAncestor', 'TasksService', 'AlertsService', 'MessengerService', 'AppointmentService', 'UsersService',
    function ($scope, $filter, $window, $location, $q, $locale, $translate, $translatePartialLoader, DateService, Tools, AgendaService, Constants, DatepickerFactory, ReminderService, PageAncestor, TasksService, AlertsService, MessengerService, AppointmentService, UsersService) {
      // translate
      $translatePartialLoader.addPart('agenda');
      $translate.refresh();
      var today = DateService.setDateAsUTC0(new Date((new Date()).setHours(0, 0, 0, 0)));

      // Initialization
      $scope.usersWithoutOwner = [];
      $scope.allUsersMenuItem = {id: -1, name: $filter('translate')('TEAM_AGENDA')};
      $scope.selectedTeamUser = $scope.allUsersMenuItem;

      $scope.weeks = {};
      $scope.daysOfWeek = [
        {id: 1, name: $locale.DATETIME_FORMATS.DAY[1]},
        {id: 2, name: $locale.DATETIME_FORMATS.DAY[2]},
        {id: 3, name: $locale.DATETIME_FORMATS.DAY[3]},
        {id: 4, name: $locale.DATETIME_FORMATS.DAY[4]},
        {id: 5, name: $locale.DATETIME_FORMATS.DAY[5]},
        {id: 6, name: $locale.DATETIME_FORMATS.DAY[6]},
        {id: 0, name: $locale.DATETIME_FORMATS.DAY[0]}
      ];
      $scope.routeCurrentDate = MessengerService.getData().selectedDate;
      $scope.routeStartDate = $scope.routeCurrentDate ? DateService.moveToDayOfWeek($scope.routeCurrentDate, 1) : null;
      $scope.startISODate = DateService.clearISOTime(($scope.routeStartDate || new Date(today.setDate(today.getDate() - (today.getDay() - 1)))).toISOString());
      $scope.weekStartDate = $scope.startISODate;
      $scope.weekEndDate = (new Date($scope.startISODate)).setMilliseconds(($scope.daysOfWeek.length - 1) * 24 * 60 * 60 * 1000);
      $scope.agenda = {};
      $scope.agenda.weekSelectDate = new Date($scope.startISODate);
      $scope.collapseDays = {};
      $scope.sortDayTypes = [
        Constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL,
        Constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING,
        Constants.AGENDA_TYPE_APPOINTMENT_OTHER,
        Constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT,
        Constants.AGENDA_TYPE_TASK,
        Constants.AGENDA_TYPE_REMINDER,
        Constants.AGENDA_TYPE_BIRTHDAY,
        Constants.AGENDA_TYPE_ANNIVERSARY
      ];
      $scope.actionsForDay = [
        {type: Constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL, name: $filter('translate')('PHONE_CALL')},
        {type: Constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING, name: $filter('translate')('BUSINESS_MEETING')},
        {type: Constants.AGENDA_TYPE_APPOINTMENT_OTHER, name: $filter('translate')('OTHER_APPOINTMENT')},
        {type: Constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT, name: $filter('translate')('ALL_DAY_EVENT')},
        {type: Constants.AGENDA_TYPE_REMINDER, name: $filter('translate')('REMINDER')}
      ];
      $scope.timeFormat = DateService.getFormatTime();
      $scope.show = {myAgenda: true, teamAgenda: false};
      $scope.usersForFilter = [{id: $scope.meta.ownerId, name: $scope.meta.ownerName}];
      $scope.showAsList = false;
      $scope.dataLoaderParams = {
        sortField: '"datePrimary"',
        sortDirection: 'asc',
        datePrimary: DateService.clearISOTime((new Date(null)).toISOString())
      };
      $scope.infoPaging = {};
      $scope.list = [];
      $scope.loadDataForList = null;
      $scope.directionButton = 2;
      $scope.dashboardsToggle = {};
      $scope.agenda.dataForMenuActions = {};

      /**
       * @memberof AgendaCtrl
       * @method
       * @name loadDataWeek
       * @description load data for view list
       * @param startDate {Date} start date, first day of week
       * @param data {Array} data
       * @returns Object
       */
      $scope.loadDataWeek = function (startDate, data) {
        var deferred = $q.defer();
        if (data && data.length > 0) {
          deferred.resolve(data);
        } else {
          AgendaService.listForWeek(startDate).then(function (result) {
            deferred.resolve(result);
          });
        }
        return deferred.promise;
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name createWeek
       * @description create new week
       * @param startDate {Date} start date, first day of week
       * @param data {Array} data
       * @returns void
       */
      $scope.createWeek = function (startDate, data) {
        var startDateISO = DateService.clearISOTime((new Date(startDate)).toISOString());
        if ($scope.weeks[startDateISO]) {
          return;
        }
        $scope.weeks[startDateISO] = {days: []};
        $scope.createDays(startDateISO, $scope.weeks[startDateISO]);
        $scope.loadDataWeek(startDateISO, data).then(function (result) {
          var i, l;
          // set datePrimary for group id
          for (i = 0, l = result.data.length; i < l; i += 1) {
            if (new Date(result.data[i].datePrimary) instanceof Date) {
              result.data[i].datePrimary = DateService.clearISOTime(DateService.setDateAsUTC0((new Date(result.data[i].datePrimary)).setHours(0, 0, 0, 0)).toISOString());
            }
          }
          $scope.loadDataForDays($scope.weeks[startDateISO], result.data);
          $scope.initCollapse($scope.weeks[startDateISO].days);
        });
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name createDays
       * @description create days for week
       * @param startDate {Date} start date of week
       * @param week {Object} week object
       * @returns void
       */
      $scope.createDays = function (startDate, week) {
        var i, l, day = {}, currentDate;
        for (i = 0, l = $scope.daysOfWeek.length; i < l; i += 1) {
          day = Object.create($scope.daysOfWeek[i]);
          currentDate = DateService.moveToDayOfWeek(startDate, day.id).toISOString();
          day.prefix = DateService.getTimeLineString(currentDate);
          day.date = DateService.clearISOTime(currentDate);
          week.days.push(day);
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name loadDataForDays
       * @description create days for week
       * @param week {Object} week object
       * @param weekData {Array} array of events
       * @returns void
       */
      $scope.loadDataForDays = function (week, weekData) {
        var i, l, data;
        data = Tools.objectFromArrayByGroup(weekData, 'datePrimary');
        for (i = 0, l = week.days.length; i < l; i += 1) {
          week.days[i].types = data[week.days[i].date] ? Tools.sortArrayWithObjectsIntoGroups(data[week.days[i].date].rows, 'type', $scope.sortDayTypes) : {count: 0};
          week.days[i].dayEvents = data[week.days[i].date] ? data[week.days[i].date].rows : [];
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name setCollapse
       * @description set collapse for days
       * @param day {Number} day
       * @returns void
       */
      $scope.setCollapse = function (day) {
        $scope.collapseDays[day] = !$scope.collapseDays[day];
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name collapseAll
       * @description set collapse for all days
       * @param state {Boolean} state for all items
       * @returns void
       */
      $scope.collapseAll = function (state) {
        var prop;
        for (prop in $scope.collapseDays) {
          if ($scope.collapseDays.hasOwnProperty(prop)) {
            $scope.collapseDays[prop] = state;
          }
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name prevWeek
       * @description set week to prev
       * @returns void
       */
      $scope.prevWeek = function () {
        $scope.startISODate = DateService.clearISOTime((DateService.addMilliseconds($scope.startISODate, $scope.daysOfWeek.length * 24 * 60 * 60 * 1000 * -1)).toISOString());
        $scope.createWeek($scope.startISODate, null);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name nextWeek
       * @description set week to next
       * @returns void
       */
      $scope.nextWeek = function () {
        $scope.startISODate = DateService.clearISOTime((DateService.addMilliseconds($scope.startISODate, $scope.daysOfWeek.length * 24 * 60 * 60 * 1000)).toISOString());
        $scope.createWeek($scope.startISODate, null);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name customWeek
       * @description set week to custom
       * @returns void
       */
      $scope.customWeek = function () {
        $scope.startISODate = DateService.clearISOTime(new Date($scope.agenda.weekSelectDate).toISOString());
        $scope.createWeek($scope.startISODate, null);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name thisWeek
       * @description set week to actual
       * @returns void
       */
      $scope.thisWeek = function () {
        $scope.startISODate = DateService.clearISOTime((new Date(today.setDate(today.getDate() - (today.getDay() - 1)))).toISOString());
        $scope.createWeek($scope.startISODate, null);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name twoWeek
       * @description set week to actual
       * @returns void
       */
      $scope.twoWeek = function () {
        $scope.startISODate = DateService.clearISOTime((new Date((new Date(today.setDate(today.getDate() - (today.getDay() - 1)))).setMilliseconds($scope.daysOfWeek.length * 24 * 60 * 60 * 1000))).toISOString());
        $scope.createWeek($scope.startISODate, null);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name recalculateWeekDateRange
       * @description set startDate and endDate for week range
       * @returns void
       */
      $scope.recalculateWeekDateRange = function () {
        var selectedDate = $scope.agenda.weekSelectDate;
        $scope.weekStartDate = new Date(selectedDate.setDate(selectedDate.getDate() - (selectedDate.getDay() - 1)));
        $scope.weekEndDate = new Date((new Date($scope.weekStartDate)).setMilliseconds(($scope.daysOfWeek.length - 1) * 24 * 60 * 60 * 1000));
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name selectTeamUser
       * @description select team user
       * @param index {Number} index of users
       * @returns void
       */
      $scope.selectTeamUser = function (index) {
        $scope.selectedTeamUser = index === -1 ? $scope.allUsersMenuItem : $scope.usersWithoutOwner[index];
        $scope.changeUserFilter(index);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name changeUser
       * @description change user
       * @returns void
       */
      $scope.changeUserFilter = function () {
        var i, l;
        $scope.usersForFilter.splice(0, $scope.usersForFilter.length);
        if ($scope.show.teamAgenda) {
          if ($scope.selectedTeamUser.id === -1) {
            for (i = 0, l = $scope.usersWithoutOwner.length; i < l; i += 1) {
              $scope.usersForFilter.push($scope.usersWithoutOwner[i]);
            }
          } else {
            $scope.usersForFilter.push($scope.selectedTeamUser);
          }
        }
        if ($scope.show.myAgenda) {
          $scope.usersForFilter.push({id: $scope.meta.ownerId, name: $scope.meta.ownerName});
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name getEventsForDay
       * @description events for day
       * @param day {Object} object of day
       * @returns Number
       */
      $scope.getEventsForDay = function (day) {
        var i, l, e, j, item, arr = [];
        if (!day || !day.types) {
          return 0;
        }
        for (i = 0, l = $scope.sortDayTypes.length; i < l; i += 1) {
          item = day.types[$scope.sortDayTypes[i]];
          if (item) {
            for (e = 0, j = item.length; e < j; e += 1) {
              arr.push(item[e]);
            }
          }
        }
        return ($filter('filterOwner')(arr, {list: $scope.usersForFilter})).length;
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name delReminder
       * @description delete reminder
       * @param obj {Object} object
       * @param day {Object} day
       * @returns void
       */
      $scope.delReminder = function (obj, day) {
        $scope.pageAncestor.del(function () {
          return ReminderService.del(obj.id).then(function (promise) {
            // delete item from day
            $scope.deleteDayEvent(obj, day);
            return promise;
          });
        });
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name delTask
       * @description delete task
       * @param obj {Object} object
       * @param day {Object} day
       * @returns void
       */
      $scope.delTask = function (obj, day) {
        $scope.pageAncestor.del(function () {
          return TasksService.del(obj.id).then(function (promise) {
            // delete item from day
            $scope.deleteDayEvent(obj, day);
            return promise;
          });
        });
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name delAppointment
       * @description delete appointment
       * @param obj {Object} object
       * @param day {Object} day
       * @returns void
       */
      $scope.delAppointment = function (obj, day) {
        $scope.pageAncestor.del(function () {
          return AppointmentService.del(obj).then(function (promise) {
            // delete item from day
            $scope.deleteDayEvent(obj, day);
            return promise;
          });
        });
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name deleteDayEvent
       * @description delete event from day
       * @param obj {Object} object
       * @param day {Object} day
       * @returns void
       */
      $scope.deleteDayEvent = function (obj, day) {
        var arr, i, l;
        arr = day.types[obj.type];
        for (i = 0, l = arr.length; i < l; i += 1) {
          if (arr[i].id === obj.id) {
            arr.splice(i, 1);
            break;
          }
        }
        if (day.dayEvents) {
          arr = day.dayEvents;
          for (i = 0, l = arr.length; i < l; i += 1) {
            if (arr[i].id === obj.id) {
              arr.splice(i, 1);
              break;
            }
          }
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name sendEmail
       * @description mailto
       * @param email {String} email
       * @returns void
       */
      $scope.sendEmail = function (email) {
        $window.location.href = 'mailto:' + email;
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name markAsDone
       * @description set event as done
       * @param obj {Object} object
       * @param day {Object} day
       * @returns void
       */
      $scope.markAsDone = function (obj, day) {
        if (obj.type === Constants.AGENDA_TYPE_REMINDER) {
          ReminderService.markAsDone(obj.id).then(function (promise) {
            if (promise.data.message && promise.data.message.type === Constants.MESSAGE_SUCCESS) {
              $scope.deleteDayEvent(obj, day);
              AlertsService.add({type: Constants.MESSAGE_ERROR, message: $filter('translate')('MARK_AS_DONE_EXECUTE_SUCCESS')});
            }
          });
        }
        if (obj.type === Constants.AGENDA_TYPE_TASK) {
          TasksService.markAsDone(obj.id).then(function (promise) {
            if (promise.data.message && promise.data.message.type === Constants.MESSAGE_SUCCESS) {
              $scope.deleteDayEvent(obj, day);
              AlertsService.add({type: Constants.MESSAGE_ERROR, message: $filter('translate')('MARK_AS_DONE_EXECUTE_SUCCESS')});
            }
          });
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name copyToNew
       * @description new event from current
       * @param obj {Object} object of event
       * @returns void
       */
      $scope.copyToNew = function (obj) {
        var newObj;
        MessengerService.clear();
        if (obj.type === Constants.AGENDA_TYPE_REMINDER) {
          ReminderService.get(obj.id).then(function (result) {
            newObj = result.data;
            newObj.id = null;
            MessengerService.setData(newObj);
            $location.path('/reminder');
          });
        }
        if (obj.type === Constants.AGENDA_TYPE_TASK) {
          TasksService.get(obj.id).then(function (result) {
            newObj = result.data;
            newObj.id = null;
            MessengerService.setData({task: newObj});
            $location.path('/task');
          });
        }
        if (obj.type === Constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT ||
            obj.type === Constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING ||
            obj.type === Constants.AGENDA_TYPE_APPOINTMENT_OTHER ||
            obj.type === Constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL) {
          AppointmentService.get(obj.id).then(function (result) {
            newObj = result.data;
            newObj.id = null;
            MessengerService.setData({appointment: newObj});
            $location.path('/appointment');
          });
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name dayAction
       * @description new event from current
       * @param obj {Object} object
       * @param day {Object} object of day
       * @returns void
       */
      $scope.dayAction = function (obj, day) {
        var newObj, path, newDate, currentDate = DateService.round(new Date(), [0, 30, 60], 'mi');
        newDate = DateService.setDateAsUTC0((new Date(day.date)).setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), 0)).toISOString();
        MessengerService.clear();
        if (obj.type === Constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL) {
          newObj = {appointment: {start_time: newDate, end_time: newDate, type_id: '1'}};
          path = '/appointment';
        }
        if (obj.type === Constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT) {
          newObj = {appointment: {start_time: newDate, end_time: newDate, type_id: '2'}};
          path = '/appointment';
        }
        if (obj.type === Constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING) {
          newObj = {appointment: {start_time: newDate, end_time: newDate, type_id: '3'}};
          path = '/appointment';
        }
        if (obj.type === Constants.AGENDA_TYPE_APPOINTMENT_OTHER) {
          newObj = {appointment: {start_time: newDate, end_time: newDate, type_id: '4'}};
          path = '/appointment';
        }
        if (obj.type === Constants.AGENDA_TYPE_REMINDER) {
          newObj = {original_time: newDate};
          path = '/reminder';
        }
        MessengerService.setData(newObj);
        $location.path(path);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name loadUsers
       * @description load users
       * @returns void
       */
      $scope.loadUsers = function () {
        UsersService.listWithoutOwner().then(function (promise) {
          $scope.usersWithoutOwner = promise.data;
        });
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name dataLoader
       * @description data loader
       * @returns Array
       */
      $scope.dataLoader = function (params) {
        return $scope.loadDataForList(params).then(
          function (result) {
            //exit for paging
            if (result.data.count !== undefined) {
              return result;
            }
            var i, l, arr, obj, key, list = [];/*, startDateISO = DateService.clearISOTime((new Date(result.data)).toISOString());*/
            for (i = 0, l = result.data.length; i < l; i += 1) {
              if (new Date(result.data[i].datePrimary) instanceof Date) {
                result.data[i].datePrimary = DateService.clearISOTime(DateService.setDateAsUTC0((new Date(result.data[i].datePrimary)).setHours(0, 0, 0, 0)).toISOString());
              }
            }
            obj = Tools.objectFromArrayByGroup(result.data, 'datePrimary');
            for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                arr = obj[key].rows;
                list.push({date: key, types: Tools.sortArrayWithObjectsIntoGroups(arr, 'type', $scope.sortDayTypes), dayEvents: arr});
              }
            }
            $scope.initCollapse(list);
            return {data: list};
          }
        );
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name setFilterRecent
       * @description set filter recent
       * @returns Array
       */
      $scope.setFilterRecent = function () {
        $scope.dataLoaderParams.datePrimary = DateService.clearISOTime((new Date()).toISOString());
        $scope.dataLoaderParams.sortDirection = 'desc';
        $scope.dataLoaderParams.direction = '<=';
        $scope.dataLoaderParams.searchStr = Math.random();
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name setFilterOncomming
       * @description set filter oncomming
       * @returns Array
       */
      $scope.setFilterOncomming = function () {
        $scope.dataLoaderParams.datePrimary = DateService.clearISOTime((new Date()).toISOString());
        $scope.dataLoaderParams.sortDirection = 'asc';
        $scope.dataLoaderParams.direction = '>=';
        $scope.dataLoaderParams.searchStr = Math.random();
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name setFilterAll
       * @description set filter all
       * @returns Array
       */
      $scope.setFilterAll = function () {
        $scope.dataLoaderParams.datePrimary = DateService.clearISOTime((new Date(null)).toISOString());
        $scope.dataLoaderParams.sortDirection = 'asc';
        $scope.dataLoaderParams.direction = '>=';
        $scope.dataLoaderParams.searchStr = Math.random();
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name collapseAllFromToday
       * @description set collapse for all days from today
       * @param arr {Array} arr
       * @returns void
       */
      $scope.collapseAllFromToday = function (arr) {
        var i, l;
        for (i = 0, l = arr.length; i < l; i += 1) {
          $scope.collapseDays[arr[i].date] = (new Date(arr[i].date) >= new Date((new Date()).setHours(0, 0, 0, 0)) || $scope.collapseDays[arr[i].date]) === true;
        }
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name initCollapse
       * @description initial collapse
       * @param arr {Array} arr
       * @returns void
       */
      $scope.initCollapse = function (arr) {
        var date;
        if ($scope.routeCurrentDate) {
          date = DateService.clearISOTime($scope.routeCurrentDate.toISOString());
          $scope.collapseDays[date] = true;
        }
        $scope.collapseAllFromToday(arr);
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name newAppointment
       * @description open new appointment
       * @returns void
       */
      $scope.newAppointment = function () {
        MessengerService.clear();
        MessengerService.setData($scope.agenda.dataForMenuActions);
        $location.path('/appointment');
      };

      /**
       * @memberof AgendaCtrl
       * @method
       * @name newTask
       * @description open new task
       * @returns void
       */
      $scope.newTask = function () {
        MessengerService.clear();
        MessengerService.setData($scope.agenda.dataForMenuActions);
        $location.path('/task');
      };

      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope
      });
      $scope.dp = DatepickerFactory.getInstance();
      $scope.dp.init($scope);

      $scope.loadUsers();
      $scope.createWeek($scope.startISODate, []);
    }]);
