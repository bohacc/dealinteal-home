/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Currency
 * @fileOverview CurrencyService
 */

/**
 * @namespace CurrencyService
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .service('CurrencyService', ['$http', function Currency($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof CurrencyService
       * @method
       * @name list
       * @description list of currency
       * @returns Promise
       */
      list: function () {
        return $http.get('/api/currency')
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
