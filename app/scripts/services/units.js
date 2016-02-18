/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Units
 * @fileOverview UnitsService
 */

/**
 * @namespace UnitsService
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .service('UnitsService', ['$http', function Units($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof UnitsService
       * @method
       * @name list
       * @description list of units
       * @returns Promise
       */
      list: function () {
        return $http.get('/api/units')
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
