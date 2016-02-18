/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Opportunities
 * @fileOverview OpportunitiesService
 */

/**
 * @namespace OpportunitiesService
 * @author Pavel Kolomazník
 */
angular.module('crmPostgresWebApp')
  .service('OpportunitiesService', ['$http', 'Tools', 'Constants', 'AlertsService', function OpportunitiesService($http, Tools, Constants, AlertsService) {
    /**
     * @memberof OpportunitiesService
     * @method
     * @name list
     * @description list of opportunities
     * @param params {Object} params
     * @returns Promise
     */
    this.list = function (params) {
      return $http.get('/api/opportunities?' + Tools.objectToQueryString(params))
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name get
     * @description get current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.get = function (obj) {
      return $http.get('/api/opportunities/' + obj.id)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name put
     * @description put current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.put = function (obj) {
      return $http.put('/api/opportunities/' + obj.id, obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name post
     * @description post current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.post = function (obj) {
      return $http.post('/api/opportunities', obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name del
     * @description del current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.del = function (obj) {
      return $http.delete('/api/opportunities/' + obj.id)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name listItems
     * @description list items of current opportunity
     * @param obj {Object} obj
     * @param params {Object} params
     * @returns Promise
     */
    this.listItems = function (obj, params) {
      return $http.get('/api/opportunities/' + obj.id + '/items?' + Tools.objectToQueryString(params))
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name postItem
     * @description post item of current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.postItem = function (obj) {
      return $http.post('/api/opportunities/' + obj.id + '/item', obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name putItem
     * @description put item of current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.putItem = function (obj) {
      return $http.put('/api/opportunities/' + obj.id + '/item/' + obj.item.number, obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name delItem
     * @description del item of current opportunity
     * @param obj {Object} obj
     * @returns Promise
     */
    this.delItem = function (obj) {
      return $http.delete('/api/opportunities/' + obj.id + '/item/' + obj.number)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name tags
     * @description load tags
     * @returns Promise
     */
    this.tags = function () {
      return $http.get('/api/opportunity/tags', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name history
     * @description load history
     * @param obj {Object} obj
     * @returns Promise
     */
    this.history = function (obj) {
      return $http.get('/api/opportunities/' + obj.id + '/history', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name listForAgenda
     * @description load data for agenda list
     * @param params {Object} params
     * @returns HttpPromise
     */
    this.listForAgenda = function (params) {
      return $http.get('/api/agenda/list/opportunity/' + params.id + '?' + Tools.objectToQueryString(params), {cache: false}).then(function (promise) {
        var message = promise.data.message;
        if (message && message.type === Constants.MESSAGE_ERROR_MODAL) {
          AlertsService.add({type: message.type, message: message.msg});
        }
        return promise;
      });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name searchGlobal
     * @description search opportunity global
     * @param params {Object} data
     * @returns Promise
     */
    this.searchGlobal = function (params) {
      return $http.get('/api/opportunity/search-all/' + params.str)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name setSuccess
     * @description set success
     * @param params {Object} data
     * @returns Promise
     */
    this.setSuccess = function (params) {
      return $http.put('/api/opportunities/' + params.id + '/success', params)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name setFailed
     * @description set failed
     * @param params {Object} data
     * @returns Promise
     */
    this.setFailed = function (params) {
      return $http.put('/api/opportunities/' + params.id + '/failed', params)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof OpportunitiesService
     * @method
     * @name setOpen
     * @description set open
     * @param params {Object} data
     * @returns Promise
     */
    this.setOpen = function (params) {
      return $http.put('/api/opportunities/' + params.id + '/open', params)
        .error(function (data) {
          console.log(data);
        });
    };
  }]);
