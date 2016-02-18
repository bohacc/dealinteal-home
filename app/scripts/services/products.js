/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Products
 * @fileOverview ProductsService
 */

/**
 * @namespace ProductsService
 * @author Pavel Kolomazník
 */
angular.module('crmPostgresWebApp')
  .service('ProductsService', ['$http', 'Tools', function ProductsService($http, Tools) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof ProductsService
       * @method
       * @name list
       * @description get products list
       * @param params {object}
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/products?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProductsService
       * @method
       * @name get
       * @description get current product
       * @param id {integer}
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/product/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProductsService
       * @method
       * @name post
       * @description post project
       * @param obj {Object}
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/product', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProductsService
       * @method
       * @name put
       * @description put project
       * @param obj {Object}
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/product/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProductsService
       * @method
       * @name get
       * @param obj {Object}
       * @description delete project
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/product/' + obj.id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
