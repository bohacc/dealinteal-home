/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Countries
 * @fileOverview CountriesService
 */

/**
 * @namespace CountriesService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('CountriesService', ['$http', function Countries($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof CountriesService
       * @method
       * @name list
       * @description list of countries
       * @returns Promise
       */
      list: function () {
        return $http.get('/api/countries/')
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
