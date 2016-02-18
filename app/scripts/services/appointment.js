/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file appointment
 * @fileOverview AppointmentService
 */

/**
 * @namespace AppointmentService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('AppointmentService', ['$http', '$timeout', 'DateService', 'Tools', function Companies($http, $timeout, DateService, Tools) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof AppointmentService
       * @method
       * @name types
       * @description types of appointment event
       * @returns Promise
       */
      types: function () {
        return $http.get('/api/appointment/types', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name places
       * @description places of appointment event
       * @returns Promise
       */
      places: function () {
        return $http.get('/api/appointment/places', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name tags
       * @description list of tags
       * @returns Promise
       */
      tags: function () {
        return $http.get('/api/appointment/tags', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name nextFreeTime
       * @description get next free time for appointment
       * @returns Promise
       */
      nextFreeTime: function () {
        return $http.get('/api/appointment/login-user/next-free-time', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name post
       * @description post appointment
       * @param obj {Object}
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/appointments', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name put
       * @description put appointment
       * @param obj {Object}
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/appointments/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name get
       * @description get appointment
       * @param id {Number}
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/appointments/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name get
       * @param obj {Object}
       * @description del appointment
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/appointments/' + obj.id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name listForCalendar
       * @description list of appointments for calendar
       * @param obj {Object} properties
       * @returns Promise
       */
      listForCalendar: function (obj) {
        var tmp = obj.ownerId ? '?' : '';
        return $http.get('/api/appointments/calendar/current/' + (obj.ownerId || '') + tmp + Tools.objectToQueryString(obj), {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name putFromCalendar
       * @description small put for calendar
       * @returns Promise
       */
      putFromCalendar: function (id, obj) {
        return $http.put('/api/appointments/' + id + '/calendar', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name calculateDateTime
       * @description calculate date time properties
       * @param scope {scope} scope of controller
       * @param masterDateTimeForRecalculate {Date} master date time for recalculate all, default null
       * @param recalculateRange {Boolean} recalculate range date time
       * @param modelName {String} name of model properties
       * @param modelMaster {String} name of model master properties
       * @param setModel {Boolean} set value from input to model after convert
       * @returns void
       */
      calculateDateTime: function (scope, masterDateTimeForRecalculate, recalculateRange, modelName, modelMaster, setModel) {
        if (scope.appointment.id && !scope.isEnableCalculate) {
          return;
        }

        $timeout(function () { // timeout for jQuery selector, model is changed slowly
          var dateFrom, dateTo, timeFrom, timeTo, newDateFrom, newDateTo, recalculate = false, recalculateInverse = false,
            dateReference, setRange = true;
          dateFrom = DateService.getDateWithMomemtJs(scope.appointmentTmp.tmpStartDate, $('#XXX11').val());
          dateTo = DateService.getDateWithMomemtJs(scope.appointmentTmp.tmpEndDate, $('#XXX13').val());
          timeFrom = DateService.getDateTimeWithMomemtJs(scope.appointment.start_time, scope.appointmentTmp.tmpStartTime, $('#XXX12').val());
          timeTo = DateService.getDateTimeWithMomemtJs(scope.appointment.end_time, scope.appointmentTmp.tmpEndTime, $('#XXX14').val());
          // All day event
          if (parseInt(scope.appointment.type_id, 10) === 2) {
            // disable inputs
            scope.timeFromReadOnly = true;
            scope.timeToReadOnly = true;
            dateTo = dateFrom;
            if (timeFrom) {
              timeFrom = new Date(timeFrom.setHours(0, 0, 0, 0));
            }
            if (scope.appointment.start_time) {
              scope.appointment.start_time = new Date(scope.appointment.start_time.setHours(0, 0, 0, 0));
            }
          } else {
            // enable inputs
            scope.timeFromReadOnly = false;
            scope.timeToReadOnly = false;
          }

          // date with dateTo
          if (dateTo && dateFrom && dateTo < dateFrom && modelMaster === 'end_time') {
            scope.appointment.end_time = timeTo ? DateService.setTime(dateTo, timeTo) : dateTo;
            recalculate = true;
            recalculateInverse = true;
            setRange = false;
          }
          // date with timeTo
          if (timeTo && timeFrom && timeTo < timeFrom && modelMaster === 'end_time') {
            scope.appointment.end_time = timeTo ? DateService.setTime(dateFrom, timeTo) : dateFrom;
            dateTo = dateFrom;
            timeTo = timeFrom;
            recalculate = true;
            recalculateInverse = true;
            setRange = false;
            if (!$('#XXX14').is(':focus')) {
              setModel = true;
            }
          }
          if (timeTo && timeFrom && timeTo < timeFrom && modelMaster === 'start_time') {
            scope.appointment.end_time = timeTo ? DateService.setTime(dateFrom, timeTo) : dateFrom;
            recalculate = true;
            setRange = true;
          }

          // recalculate range
          if (recalculateRange || recalculate) {
            if (masterDateTimeForRecalculate) {
              newDateFrom = new Date(masterDateTimeForRecalculate);
            } else {
              if (recalculateInverse) {
                if (scope.appointment.end_time) {
                  dateReference = timeFrom ? DateService.setTime(new Date(scope.appointment.end_time), timeFrom) : (new Date(scope.appointment.end_time)).setHours(0, 0, 0, 0);
                }
              } else {
                if (scope.appointment.start_time) {
                  dateReference = timeFrom ? DateService.setTime(new Date(scope.appointment.start_time), timeFrom) : scope.appointment.start_time;
                }
              }
              if (dateReference) {
                newDateFrom = new Date(dateReference);
              } else {
                newDateFrom = new Date();
                newDateFrom = newDateFrom.setSeconds(0);
                newDateFrom = newDateFrom.setMilliseconds(0);
              }
            }
            if (setRange) {
              newDateTo = new Date((new Date(newDateFrom)).setMilliseconds(scope.appointmentTmp.tmpTypeItem.addMs));
            } else {
              newDateTo = DateService.setTime(new Date(newDateFrom), timeTo);
            }
          } else {
            newDateFrom = timeFrom ? DateService.setTime(dateFrom, timeFrom) : dateFrom;
            newDateTo = timeTo ? DateService.setTime(dateTo, timeTo) : dateTo;
          }

          scope.appointment.start_time = newDateFrom;
          scope.appointment.end_time = newDateTo;

          // set others model properties
          if (!modelName || modelName !== 'tmpStartDate') {
            scope.appointmentTmp.tmpStartDate = newDateFrom.toISOString();
          }
          if (!modelName || modelName !== 'tmpEndDate') {
            scope.appointmentTmp.tmpEndDate = newDateTo.toISOString();
          }
          if (!modelName || modelName !== 'tmpStartTime') {
            scope.appointmentTmp.tmpStartTime = newDateFrom.toISOString();
          }
          if (!modelName || modelName !== 'tmpEndTime') {
            scope.appointmentTmp.tmpEndTime = newDateTo.toISOString();
          }

          // set current model after setting(format) with master model start_time or end_time
          if (setModel) {
            scope.appointmentTmp[modelName] = (new Date(scope.appointment[modelMaster])).toISOString();
          }
        }, 400);
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name setDefaultType
       * @description set default type for appointment or set from record
       * @param scope {scope}
       * @returns void
       */
      setDefaultType: function (scope) {
        var i, l;
        // set default value
        scope.appointment.type_id = parseInt(scope.appointment.type_id, 10) || 3;
        for (i = 0, l = scope.appointmentTypes.length; i < l; i += 1) {
          // add milliseconds from types
          switch (parseInt(scope.appointmentTypes[i].id, 10)) {
          case 1:
            scope.appointmentTypes[i].addMs = 15 * 60 * 1000;
            break;
          case 2:
            scope.appointmentTypes[i].addMs = 0;
            break;
          case 3:
            scope.appointmentTypes[i].addMs = 2 * 60 * 60 * 1000;
            break;
          case 4:
            scope.appointmentTypes[i].addMs = 60 * 60 * 1000;
            break;
          }
          if (scope.appointment.type_id === parseInt(scope.appointmentTypes[i].id, 10)) {
            scope.appointmentTmp.tmpTypeName = scope.appointmentTypes[i].name;
            scope.appointmentTmp.tmpTypeItem = scope.appointmentTypes[i];
          }
        }
        // recalculate date from and to - for new appointment
        this.calculateDateTime(scope, null, scope.appointment.id ? false : true, null, null, null);
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name setType
       * @description set types
       * @param scope {scope}
       * @param index {Number} index of types
       * @returns void
       */
      setType: function (scope, index) {
        var date = null;
        scope.appointment.type_id = scope.appointmentTypes[index].id;
        scope.appointmentTmp.tmpTypeName = scope.appointmentTypes[index].name;
        scope.appointmentTmp.tmpTypeItem = scope.appointmentTypes[index];
        if (parseInt(scope.appointment.type_id, 10) !== 2) {
          date = DateService.round(new Date(), [0, 30, 60], 'mi');
        }
        this.calculateDateTime(scope, date, true, null, null, null);
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name setDefaultPlaces
       * @description set default places or set from record
       * @param scope {scope}
       * @returns void
       */
      setDefaultPlaces: function (scope) {
        var i, l;
        // exit if appointment found
        if (scope.appointment.place) {
          return;
        }
        // set default
        scope.appointmentTmp.tmpPlaceId = 3;
        for (i = 0, l = scope.appointmentPlaces.length; i < l; i += 1) {
          if (parseInt(scope.appointmentPlaces[i].id, 10) === scope.appointmentTmp.tmpPlaceId) {
            scope.appointment.place = scope.appointmentPlaces[i].name;
          }
        }
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name list
       * @description list of  appointments
       * @param params {Object} params
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/appointments?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AppointmentService
       * @method
       * @name deleteDetailedDescription
       * @description delete appointment's description
       * @param obj {object}
       * @returns Promise
       */
      deleteDetailedDescription: function (obj) {
        return $http.delete('/api/texts/' + obj.id)
          .error(function (data) {
            console.log(data);
          });
      }

    };
  }]);
