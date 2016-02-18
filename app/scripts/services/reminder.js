/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file reminder
 * @fileOverview ReminderService
 */

/**
 * @namespace ReminderService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('ReminderService', ['$http', 'Tools', function ReminderService($http, Tools) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof ReminderService
       * @method
       * @name post
       * @description post reminder
       * @param obj {Object}
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/reminder', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name put
       * @description put reminder
       * @param obj {Object}
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/reminder/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name get
       * @description get reminder
       * @param id {Number}
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/reminder/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name del
       * @description delete reminder
       * @param id {Number}
       * @returns Promise
       */
      del: function (id) {
        return $http.delete('/api/reminder/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name list
       * @description list of reminders
       * @param params {Object} params
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/reminders?' + Tools.objectToQueryString(params), {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name listForCalendar
       * @description list of reminders for calendar
       * @param obj {Object} properties
       * @returns Promise
       */
      listForCalendar: function (obj) {
        var tmp = obj.ownerId ? '?' : '';
        return $http.get('/api/reminders/calendar/current/' + (obj.ownerId || '') + tmp + Tools.objectToQueryString(obj), {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name putFromCalendar
       * @description small put for calendar
       * @returns Promise
       */
      putFromCalendar: function (id, obj) {
        return $http.put('/api/reminder/' + id + '/calendar', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ReminderService
       * @method
       * @name markAsDone
       * @description set reminder as done
       * @param id {Number} id
       * @returns Promise
       */
      markAsDone: function (id) {
        return $http.post('/api/reminder/' + id + '/mark-as-done', {id: id})
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
