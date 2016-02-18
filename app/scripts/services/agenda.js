/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file agenda
 * @fileOverview AgendaService
 */

/**
 * @namespace AgendaService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('AgendaService', ['$http', '$filter', 'Constants', 'AlertsService', 'Tools', function AgendaService($http, $filter, Constants, AlertsService, Tools) {
    /**
     * @memberof AgendaService
     * @method
     * @name listForWeek
     * @description load data for view list
     * @param dateFrom {Date} start date, first day of week
     * @returns HttpPromise
     */
    this.listForWeek = function (dateFrom) {
      return $http.get('/api/agenda/week/' + (new Date(dateFrom)).toISOString(), {cache: false}).then(function (promise) {
        var message = promise.data.message;
        if (message && message.type === Constants.MESSAGE_ERROR_MODAL) {
          AlertsService.add({type: message.type, message: message.msg});
        }
        return promise;
      });
    };
    /**
     * @memberof AgendaService
     * @method
     * @name listForWeek
     * @description load data for view list
     * @param id {Number} id of person
     * @returns HttpPromise
     */
    this.sendEmail = function (id) {
      return $http.post('/api/agenda/email', {person: id}).then(function (promise) {
        var message = promise.data.message;
        if (message && message.type === Constants.MESSAGE_SUCCESS) {
          AlertsService.add({type: Constants.MESSAGE_SUCCESS, message: ($filter('translate')('EMAIL_HAS_SEND'))});
        }
      });
    };
  }]);
