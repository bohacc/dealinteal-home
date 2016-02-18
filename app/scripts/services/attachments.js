/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Attachments
 * @fileOverview AttachmentsService
 */

/**
 * @namespace AttachmentsService
 * @author Pavel Kolomazník
 */
angular.module('crmPostgresWebApp')
  .service('AttachmentsService', ['$http', 'Tools', 'Constants', function AttachmentsService($http, Tools, Constants) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof AttachmentsService
       * @method
       * @name list
       * @description get attachments list
       * params {object}
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/attachments?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof AttachmentsService
       * @method
       * @name del
       * @description delete current attachment
       * @param obj {object}
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/attachments/' + obj.id)
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
