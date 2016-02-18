/*jslint node: true, unparam: true */
'use strict';

/**
 * @file Companies
 * @fileOverview CompaniesService
 */

/**
 * @namespace CompaniesService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('CompaniesService', ['$http', '$q', 'Tools', 'AlertsService', 'Constants', function Companies($http, $q, Tools, AlertsService, Constants) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof CompaniesService
       * @method
       * @name list
       * @description list of companies
       * @param params {object}
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/companies?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name get
       * @description get current company
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/companies/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name del
       * @description delete current company
       * @param obj {Object} company
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/companies/' + obj.id)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name post
       * @description post new company
       * @param obj {Object} data of company
       * @returns Promise
       */
      post: function (obj) {
        return $http.post('/api/companies', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name put
       * @description put current company
       * @param obj {Object} data of company
       * @returns Promise
       */
      put: function (obj) {
        return $http.put('/api/companies/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name people
       * @description get people of current company
       * @param params {Object} data
       * @returns Promise
       */
      people: function (params) {
        return $http.get('/api/companies/' + params.id + '/people?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name searchGlobal
       * @description search company global
       * @param params {Object} data
       * @returns Promise
       */
      searchGlobal: function (params) {
        return $http.get('/api/companies/search-all/' + params.str)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name listForAgenda
       * @description load data for agenda list
       * @param params {Object} params
       * @returns HttpPromise
       */
      listForAgenda: function (params) {
        return $http.get('/api/agenda/list/company/' + params.id + '?' + Tools.objectToQueryString(params), {cache: false}).then(function (promise) {
          var message = promise.data.message;
          if (message && message.type === Constants.MESSAGE_ERROR_MODAL) {
            AlertsService.add({type: message.type, message: message.msg});
          }
          return promise;
        });
      },
      /**
       * @memberof CompaniesService
       * @method
       * @name opportunities
       * @description get opportunities for current company
       * @param params {Object} data
       * @returns Promise
       */
      opportunities: function (params) {
        return $http.get('/api/companies/' + params.id + '/opportunities?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
