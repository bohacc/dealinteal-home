/*jslint node: true */
'use strict';

/**
 * @file SalesPipeline
 * @fileOverview SalesPipelineService
 */

/**
 * @namespace SalesPipelineService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('SalesPipelineService', ['$http', function SalesPipeline($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof SalesPipelineService
       * @method
       * @name get
       * @description get sales pipeline JSON
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/sales-pipeline/' + id)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineService
       * @method
       * @name list
       * @description list of sales pipeline JSON
       * @param obj {Object} properties for server
       * @returns Promise
       */
      list: function (obj) {
        return $http.post('/api/sales-pipeline/stages/', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineService
       * @method
       * @name listMyStages
       * @description list of stages for sales pipeline JSON
       * @returns Promise
       */
      listMyStages: function () {
        return $http.get('/api/sales-pipeline/my/stages/', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
