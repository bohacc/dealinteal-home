'use strict';

/**
 * @file changelogs_service
 * @fileOverview ChangelogsService
 */

/**
 * @namespace ChangelogsService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('ChangelogsService', ['$http', 'Tools', function changelogsService($http, Tools) {
    /**
     * @memberof ChangelogsService
     * @method
     * @name list
     * @description get changelogs list
     * @param params {object}
     * @returns Promise
     */
    this.list = function (params) {
      return $http.get('/api/changelogs?' + Tools.objectToQueryString(params))
        .error(function (data) {
          console.log(data);
        });
    };
  }]);
