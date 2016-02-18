/*jslint node: true, unparam: true */
'use strict';

/**
 * @file timezones
 * @fileOverview TimeZonesService
 */

/**
 * @namespace TimeZonesService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('TimeZonesService', ['$http', function TimeZonesService($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof TimeZonesService
       * @method
       * @name list
       * @description list of timezones
       * @returns Promise
       */
      list: function () {
        return $http.get('/api/timezones', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
