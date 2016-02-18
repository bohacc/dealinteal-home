/*jslint node: true, unparam: true, nomen: true */
'use strict';

/**
 * @file calendar
 * @fileOverview CalendarCtrl
 */

/**
 * @namespace CalendarCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('CalendarCtrl', ['$rootScope', '$scope', '$location', '$compile', '$filter', '$timeout', '$translate', '$translatePartialLoader', 'uiCalendarConfig', '$popover', 'Language', 'ReminderService', 'AppointmentService', 'DateService', 'PageAncestor', 'Constants', 'DatepickerFactory', '$tooltip', 'TimeZonesService', 'Tools', 'initialData',
    function ($rootScope, $scope, $location, $compile, $filter, $timeout, $translate, $translatePartialLoader, uiCalendarConfig, $popover, Language, ReminderService, AppointmentService, DateService, PageAncestor, Constants, DatepickerFactory, $tooltip, TimeZonesService, Tools, initialData) {
      // translate
      $translatePartialLoader.addPart('calendar');
      $translate.refresh();
      $scope.getLanguage = Language.getLanguage;
      $scope.calculateDateTime = function (masterDateTimeForRecalculate, recalculateRange, modelName, modelMaster, setModel) {
        AppointmentService.calculateDateTime($scope, masterDateTimeForRecalculate, recalculateRange, modelName, modelMaster, setModel);
      };
      $scope.setAppointmentType = function (index) {
        AppointmentService.setType($scope, index);
      };
      $scope.usersWithoutOwner = initialData.usersWithoutOwner;
      $scope.mw = [];
      $scope.mwn = {};
      $scope.appointment = {};
      $scope.appointmentTmp = {};
      $scope.templatesPopover = ['views/calendar_item_popover_appointment.html', 'views/calendar_item_popover_reminder.html'];
      $scope.showNewRecordDialogAppointment = false;
      $scope.appointmentTypes = [];
      $scope.appointmentPlaces = [];
      $scope.timeZones = [];
      $scope.stopPropagation = false;
      $scope.defaultTimezoneName = '';
      $scope.timeFromReadOnly = false;
      $scope.timeToReadOnly = false;
      $scope.radioOwner = 1;
      $scope.showReminders = true;
      $scope.selectOwner = {};
      $scope.appointmentsCalendar = initialData.appointmentsCalendar;
      $scope.reminderCalendar = initialData.reminderCalendar;
      $scope.eventSources = [initialData.appointmentsCalendar, initialData.reminderCalendar];
      $scope.defaultCalendarDate = new Date('2015-05-10T00:00:00.000Z');

      /**
       * @memberof CalendarCtrl
       * @method
       * @name dayOnClick
       * @description click on day
       * @param date {Date}
       * @param jsEvent {Event}
       * @param view {Object}
       * @returns void
       */
      $scope.dayOnClick = function (date, jsEvent, view) {
        $scope.mwn.left = jsEvent.pageX;
        $scope.mwn.top = jsEvent.pageY;
        $scope.mwn.dateFormat = DateService.getFormat();
        $scope.mwn.timeFormat = DateService.getFormatTime();
        $scope.initNewAppointment(date, jsEvent, view);
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name eventOnDrop
       * @description event on Drop
       * @param event {Event}
       * @param delta {Object}
       * @param revertFunc {Function}
       * @param jsEvent {Event}
       * @param ui {Object}
       * @param view {Object}
       * @returns void
       */
      $scope.eventOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        var reminderTime, ms;
        if (event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
          AppointmentService.putFromCalendar(event.id, {id: event.id, start_time: event.start._d, end_time: event.end._d});
        } else if (event.type === Constants.TYPE_CALENDAR_EVENT_REMINDER) {
          ms = delta._milliseconds + (delta._days * 24 * 60 * 60 * 1000);
          reminderTime = DateService.addMonths(DateService.addMilliseconds(event.reminder_time, ms), delta._months);
          ReminderService.putFromCalendar(event.id, {id: event.id, original_time: event.start._d, reminder_time: reminderTime});
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name eventOnResize
       * @description event on Resize
       * @param event {Event}
       * @param delta {Object}
       * @param revertFunc {Function}
       * @param jsEvent {Event}
       * @param ui {Object}
       * @param view {Object}
       * @returns void
       */
      $scope.eventOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        if (event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
          AppointmentService.putFromCalendar(event.id, {id: event.id, start_time: event.start._d, end_time: event.end._d});
        } else if (event.type === Constants.TYPE_CALENDAR_EVENT_REMINDER) {
          revertFunc();
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name changeView
       * @description Change View
       * @param view {Object}
       * @param calendar {Object}
       * @returns void
       */
      $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name changeView
       * @description Change View
       * @param calendar {Object}
       * @returns void
       */
      $scope.renderCalender = function (calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
          uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name eventRender
       * @description Render Tooltip
       * @param event {Object}
       * @param element {Object}
       * @param view {Object}
       * @returns void
       */
      $scope.eventRender = function (event, element, view) {
        // mark event after insert from record of appointment
        $scope.markEventAppointment(event, element);
        // dbclick on event go to record detail
        $scope.setDblClickForEvent(event, element);
        // for week and day
        $scope.setViewForEvent(event, element, view);
        // Popover
        $scope.mw[event.id] = event;
        $scope.mw[event.id].attendeesArray = event.attendees ? event.attendees.split(',') : [];
        $popover(element,  {
          content: event.id,
          scope: $scope,
          html: true,
          trigger: 'hover',
          placement: 'top',
          template: event.type === 'APPOINTMENT' ? $scope.templatesPopover[0] : $scope.templatesPopover[1],
          container: 'body'
        });
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name initNewAppointment
       * @description init reminder modal properties
       * @param date {Date}
       * @param jsEvent {Event}
       * @param view {Object}
       * @returns void
       */
      $scope.initNewAppointment = function (date, jsEvent, view) {
        var currentTime = new Date(), convertDate = new Date(date._d), newDateTime;
        $scope.appointment = {};
        $scope.appointment.timezoneName = $scope.defaultTimezoneName;
        newDateTime = view.name === 'month' ? DateService.setTime(convertDate, currentTime) : convertDate;
        $scope.appointment.start_time = newDateTime;
        $scope.appointment.end_time = null;
        $scope.appointmentTmp.tmpStartDate = newDateTime.toISOString();
        $scope.appointmentTmp.tmpStartTime = newDateTime.toISOString();
        $scope.appointmentTmp.tmpEndDate = newDateTime.toISOString();
        $scope.appointmentTmp.tmpEndTime = newDateTime.toISOString();
        $scope.showNewRecordDialogAppointment = true;
        AppointmentService.setDefaultType($scope);
        AppointmentService.setDefaultPlaces($scope);
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name goToEvent
       * @description go to event page
       * @param event {Event}
       * @returns void
       */
      $scope.goToEvent = function (event) {
        if (event.type === Constants.TYPE_CALENDAR_EVENT_REMINDER) {
          $location.path('/reminder/' + event.id);
        } else if (event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
          $location.path('/appointment/' + event.id);
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name postAppointment
       * @description post appointment
       * @returns void
       */
      $scope.postAppointment = function () {
        var obj = {};
        obj.recipient_id = $scope.meta.ownerId;
        obj.type_id = $scope.appointment.type_id;
        obj.subject = $scope.appointment.subject;
        obj.place = $scope.appointment.place;
        obj.start_time = DateService.setDateAsUTC0($scope.appointment.start_time);
        obj.end_time = DateService.setDateAsUTC0($scope.appointment.end_time);
        obj.timezone_name = $scope.appointment.timezoneName;
        obj.type = Constants.TYPE_CALENDAR_EVENT_APPOINTMENT;
        if ($scope.verifyFormAppointment(obj)) {
          $scope.pageAncestor.post(function () {
            return AppointmentService.post(obj).then(function (promise) {
              if (promise.data.id) {
                $scope.appointmentCalendar.push({ //initialData.appointmentsCalendar
                  id: promise.data.id,
                  type: obj.type,
                  typeId: String(obj.type_id),
                  place: obj.place,
                  title: obj.subject,
                  start: $scope.appointment.start_time.toISOString(), // without time convert - obj
                  end: $scope.appointment.end_time.toISOString(), // without time convert - obj
                  backgroundColor: Tools.getColorEventForCalendar({type: obj.type, typeId: obj.type_id}),
                  editable: !(((new Date(obj.end) - new Date(obj.start)) < 30 * 60 * 1000) || obj.allDay)
                });
              }
              return promise;
            });
          });
        }
        $scope.showNewRecordDialogAppointment = false;
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name verifyFormAppointment
       * @description verify form appointment
       * @param obj {Object}
       * @returns Boolean
       */
      $scope.verifyFormAppointment = function (obj) {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        // verify recipient_id input data
        if (!obj.recipient_id) {
          result = false;
          verifyMessages.push({message: 'RECIPIENT_ID'});
        }
        // verify type_id input data
        if (!obj.type_id) {
          result = false;
          verifyMessages.push({message: 'TYPE_ID'});
        }
        // verify subject input data
        if (!obj.subject) {
          result = false;
          verifyMessages.push({message: 'SUBJECT'});
        }
        // verify start_time input data
        if (!obj.start_time || !(new Date(obj.start_time) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DATE_FROM'});
        }
        // verify end_time input data
        if (!obj.end_time || !(new Date(obj.end_time) > new Date(1899, 0, 1))) {
          result = false;
          verifyMessages.push({message: 'DATE_TO'});
        }
        // verify time_zone input data
        if (!obj.timezone_name) {
          result = false;
          verifyMessages.push({message: 'TIME_ZONE'});
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
       * @memberof CalendarCtrl
       * @method
       * @name loadAppointmentTypes
       * @description load appointment types
       * @returns void
       */
      $scope.loadAppointmentTypes = function () {
        AppointmentService.types().then(function (promise) {
          $scope.appointmentTypes = promise.data;
        });
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name loadAppointmentPlaces
       * @description load appointment places
       * @returns void
       */
      $scope.loadAppointmentPlaces = function () {
        AppointmentService.places().then(function (promise) {
          $scope.appointmentPlaces = promise.data;
        });
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name loadTimeZones
       * @description load data for timeZone
       * @returns void
       */
      $scope.loadTimeZones = function () {
        var i, l;
        TimeZonesService.list().then(function (result) {
          $scope.timeZones = result.data;
          for (i = 0, l = $scope.timeZones.length; i < l; i += 1) {
            if ($scope.timeZones[i].default === 1) {
              $scope.defaultTimezoneName = $scope.timeZones[i].name;
              return;
            }
          }
        });
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name setPlace
       * @description set place
       * @param index {Number} index of places
       * @returns void
       */
      $scope.setPlace = function (index) {
        $scope.appointment.place = $scope.appointmentPlaces[index].name;
        $scope.appointmentTmp.tmpPlaceId = $scope.appointmentPlaces[index].id;
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name setTimeZone
       * @description set timeZone
       * @param index {Number} index of timeZones
       * @returns void
       */
      $scope.setTimeZone = function (index) {
        $scope.appointment.timezoneName = $scope.timeZones[index].name;
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name getTimezone
       * @description get current locale timeZone
       * @returns void
       */
      $scope.getTimezone = function () {
        $scope.showTimezone = !$scope.showTimezone;
        $scope.timezone = (new Date()).toString();
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name changeCalendarConditions
       * @description change calendar for setting properties
       * @param obj {Object} properties
       * @returns void
       */
      $scope.changeCalendarConditions = function (obj) {
        $timeout(function () {
          var id = parseInt($scope.radioOwner, 10) === 0 ? $scope.selectOwner.id : $scope.meta.ownerId;
          if (!id) {
            return;
          }
          obj.ownerId = id;
          AppointmentService.listForCalendar(obj).then(function (promise) {
            $scope.appointmentCalendar = promise.data;
            $scope.eventSources[0] = $scope.appointmentCalendar;
          });
          ReminderService.listForCalendar(obj).then(function (promise) {
            $scope.reminderCalendar = promise.data;
            $scope.eventSources[1] = $scope.reminderCalendar;
          });
        }, 100);
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name remindersChange
       * @description change calendar for current/selected user
       * @param setProperty {Boolean} set property value
       * @returns void
       */
      $scope.remindersChange = function (setProperty) {
        if (setProperty) {
          $scope.showReminders = !$scope.showReminders;
        }
        if ($scope.showReminders) {
          $scope.eventSources[1] = $scope.reminderCalendar;
        } else {
          $scope.eventSources.splice(1, 1);
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name markEventAppointment
       * @description mark event from apointment
       * @param event {Object} handle for event
       * @returns void
       */
      $scope.markEventAppointment = function (event, element) {
        if (initialData.appointmentId) {
          if (parseInt(event.id, 10) === parseInt(initialData.appointmentId, 10) && event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
            element.fadeOut(700).delay(300).fadeIn(600);
            initialData.appointmentId = null;
          }
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name setDblClickForEvent
       * @description set dblClick on event
       * @param event {Object} handle for event
       * @param element {Object} html element
       * @returns void
       */
      $scope.setDblClickForEvent = function (event, element) {
        element.bind('dblclick', function () {
          $('.popover').hide();
          $scope.goToEvent(event);
          $scope.$apply();
        });
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name setViewForEvent
       * @description set view for event in calendar
       * @param event {Object} handle for event
       * @param element {Object} html element
       * @param view {Object} html view of element
       * @returns void
       */
      $scope.setViewForEvent = function (event, element, view) {
        if (event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
          element.append('<div class="fc-title">' + (event.location || '') + '</div>');
        }
      };

      /**
       * @memberof CalendarCtrl
       * @method
       * @name events
       * @description set view for event in calendar
       * @param start {Object} object for start Date
       * @param end {Object} object for end Date
       * @param timezone {String} timezone
       * @param callback {Function} callback
       * @returns void
       */
      $scope.events = function (start, end, timezone, callback) {
        $scope.changeCalendarConditions({startTime: start._d.toISOString(), endTime: end._d.toISOString()});
        callback({});
      };

      /* config object */
      $scope.uiConfig = {
        calendar: {
          defaultDate: initialData.defaultCalendarDate,
          eventSources: $scope.eventSources,
          timezone: 'local',
          lang: Language.getLanguageCalendar(),
          monthNames: Language.getMonthNames(),
          selectable: true,
          scrollTime: (initialData.scrollTime || '06:00:00'),
          slotDuration: '00:30:00',
          snapDuration: '00:30:00',
          defaultTimedEventDuration: '00:00:00',
          timeFormat: DateService.getFormatTime() || 'H:mm',
          eventLimit: {
            'agenda': 3,
            'default': true
          },
          firstDay: 1,
          buttonText: {
            today: $filter('translate')('TODAY'),
            day: $filter('translate')('DAY'),
            week: $filter('translate')('WEEK'),
            month: $filter('translate')('MONTH')
          },
          defaultView: (initialData.defaultView || 'agendaWeek'),
          height: 600,
          editable: true,
          header: {
            left: 'month agendaWeek agendaDay',
            center: 'title',
            right: 'today prev,next'
          },
          eventDrop: $scope.eventOnDrop,
          eventResize: $scope.eventOnResize,
          eventRender: $scope.eventRender,
          events: $scope.events,
          dayClick: $scope.dayOnClick
        }
      };

      // Watchers
      $scope.$watch('getLanguage()', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $('#calendar').fullCalendar($scope.uiConfig.calendar);
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

      $scope.loadAppointmentTypes();
      $scope.loadAppointmentPlaces();
      $scope.loadTimeZones();
      // set event for close Timepicket
      $('.btTimeStart').focusout(function () {
        $('.groupTimepickerStart .timepicker').remove();
        $scope.showTPstart = false;
        $scope.$digest();
      });
      $('.btTimeEnd').focusout(function () {
        $('.groupTimepickerEnd .timepicker').remove();
        $scope.showTPend = false;
        $scope.$digest();
      });
      // for managing close dialog
      $('html').click(function () {
        // for managing close dialog
        if (!$scope.stopPropagation) {
          $scope.showNewRecordDialogAppointment = false;
          $scope.$digest();
        }
      });
      $('#mwnCalendarAppointment').click(function (event) {
        // for close datepicker popup on focusout
        $scope.opened.appointmentDateFrom = false;
        $scope.opened.appointmentDateTo = false;
        $scope.$digest();
        // for managing close dialog
        $scope.stopPropagation = true;
      });
    }]);
