/*jslint node: true */
'use strict';

/**
 * @file People
 * @fileOverview PeopleService
 */

/**
 * @namespace PeopleService
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .service('PeopleService', ['$http', 'Tools', 'AlertsService', 'Constants', function PeopleService($http, Tools, AlertsService, Constants) {
    return {
      /**
       * @memberof PeopleService
       * @method
       * @name list
       * @description get people list
       * @param params {object} params
       * @returns Promise
       */
      list: function (params) {
        return $http.get('/api/people?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name get
       * @description get current person
       * @param id {integer}
       * @returns Promise
       */
      get: function (id) {
        return $http.get('/api/people/' + id, {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name put
       * @description put current person
       * @param obj {Object} data of person
       * @returns Promise
       */
      put: function (obj) {
        /*obj = Tools.setDateFormat(obj, ['birthday', 'anniversary', 'work_since', 'work_to']);*/
        return $http.put('/api/people/' + obj.id, obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name post
       * @description post current person
       * @param obj {object}
       * @returns Promise
       */
      post: function (obj) {
        /*obj = Tools.setDateFormat(obj, ['birthday', 'anniversary', 'work_since', 'work_to']);*/
        return $http.post('/api/people', obj)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name delete
       * @description delete current person
       * @param obj {object}
       * @returns Promise
       */
      del: function (obj) {
        return $http.delete('/api/people/' + obj.id)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name homeAddress
       * @description get home address for login user
       * @returns Promise
       */
      homeAddress: function () {
        return $http.get('/api/people/login-user/home-address', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name businessAddress
       * @description get business address for login user
       * @returns Promise
       */
      businessAddress: function () {
        return $http.get('/api/people/login-user/business-address', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name latestAddress
       * @description get latest address
       * @returns Promise
       */
      latestAddress: function () {
        return $http.get('/api/people/login-user/latest-address', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name loginUser
       * @description get people of login user
       * @returns Promise
       */
      loginUser: function () {
        return $http.get('/api/people/login-user/all', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name loginUser
       * @description get people of login user
       * @returns Promise
       */
      loginUserEmails: function () {
        return $http.get('/api/people/login-user/emails', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name teamMembersList
       * @description get team members list
       * @param params {object}
       * @returns Promise
       */
      teamMembersList: function (params) {
        return $http.get('/api/team-members?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name searchGlobal
       * @description search company global
       * @param params {Object} data
       * @returns Promise
       */
      searchGlobal: function (params) {
        return $http.get('/api/people/search-all/' + params.str)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name searchGlobal
       * @description search company global
       * @param params {Object} data
       * @returns Promise
       */
      searchGlobalTeam: function (params) {
        return $http.get('/api/people/team/search-all/' + params.str)
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name listForAgenda
       * @description load data for agenda list
       * @param params {Object} params
       * @returns HttpPromise
       */
      listForAgenda: function (params) {
        return $http.get('/api/agenda/list/person/' + params.id + '?' + Tools.objectToQueryString(params), {cache: false}).then(function (promise) {
          var message = promise.data.message;
          if (message && message.type === Constants.MESSAGE_ERROR_MODAL) {
            AlertsService.add({type: message.type, message: message.msg});
          }
          return promise;
        });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name anniversaryCount
       * @description people with anniversary - count
       * @returns HttpPromise
       */
      anniversaryCount: function () {
        return $http.get('/api/people/anniversary/count', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name anniversaryToday
       * @description people with anniversary - today
       * @returns HttpPromise
       */
      anniversaryToday: function () {
        return $http.get('/api/people/anniversary/list/today/', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name anniversaryTomorrow
       * @description people with anniversary - tomorrow
       * @returns HttpPromise
       */
      anniversaryTomorrow: function () {
        return $http.get('/api/people/anniversary/list/tomorrow/', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name anniversaryAfterTomorrow
       * @description people with anniversary - after tomorrow
       * @returns HttpPromise
       */
      anniversaryAfterTomorrow: function () {
        return $http.get('/api/people/anniversary/list/aftertomorrow/', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      },
      /**
       * @memberof PeopleService
       * @method
       * @name anniversaryNextDays
       * @description people with anniversary - next days
       * @returns HttpPromise
       */
      anniversaryNextDays: function () {
        return $http.get('/api/people/anniversary/list/nextdays/', {cache: false})
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);
