/*jslint node: true */
'use strict';

/**
 * @file SalesPipelineStages
 * @fileOverview SalesPipelineStagesService
 */

/**
 * @namespace SalesPipelineStagesService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('SalesPipelineStagesService', ['$http', 'Tools', function SalesPipelineStagesService($http, Tools) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name get
       * @description list of sales pipeline stages JSON
       * @returns Promise
       */
      list: function () {
        return $http.get('/api/sales-pipeline-stages/')
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name info
       * @description get sales pipeline stages info JSON
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/sales-pipeline/stages/' + id)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name owners
       * @description get owners for stages JSON
       * @returns Promise
       */
      owners: function () {
        return $http.get('/api/sales-pipeline/stages/all/owners/')
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name post
       * @description post sales pipeline stage
       * @param obj {Object}
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/sales-pipeline-stages', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name put
       * @description put sales pipeline stage
       * @param obj {Object}
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/sales-pipeline-stages/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name del
       * @description delete sales pipeline stage
       * @param obj {Object}
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/sales-pipeline-stages/' + obj.id)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof SalesPipelineStagesService
       * @method
       * @name replace
       * @description replace sales pipeline stage
       * @param obj {Object}
       * @returns Promise
       */
      replace: function (obj) {
        return $http.put('/api/sales-pipeline-stages/replace/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
