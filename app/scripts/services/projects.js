/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Projects
 * @fileOverview ProjectsService
 */

/**
 * @namespace ProjectsService
 * @author Pavel Kolomazník
 */
angular.module('crmPostgresWebApp')
  .service('ProjectsService', ['$http', 'Tools', 'Constants', 'AlertsService', function ProjectsService($http, Tools, Constants, AlertsService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof ProjectsService
       * @method
       * @name list
       * @description get projects list
       * @param params {object}
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/projects?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name get
       * @description get current project
       * @param id {integer}
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/project/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name post
       * @description post project
       * @param obj {Object}
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/project', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name put
       * @description put project
       * @param obj {Object}
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/project/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name get
       * @param obj {Object}
       * @description delete project
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/project/' + obj.id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name listForAgenda
       * @description load data for agenda list
       * @param params {Object} params
       * @returns HttpPromise
       */
      listForAgenda: function (params) {
        return $http.get('/api/agenda/list/project/' + params.id + '?' + Tools.objectToQueryString(params), {cache: false}).then(function (promise) {
          var message = promise.data.message;
          if (message && message.type === Constants.MESSAGE_ERROR_MODAL) {
            AlertsService.add({type: message.type, message: message.msg});
          }
          return promise;
        });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name history
       * @description load history
       * @param obj {Object} obj
       * @returns Promise
       */
      history: function (obj) {
        return $http.get('/api/project/' + obj.id + '/history', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof ProjectsService
       * @method
       * @name searchGlobal
       * @description search projects global
       * @param params {Object} data
       * @returns Promise
       */
      searchGlobal: function (params) {
        return $http.get('/api/projects/search-all/' + params.str)
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
