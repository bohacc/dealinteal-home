/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file tasks
 * @fileOverview TasksService
 */

/**
 * @namespace TasksService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('TasksService', ['$http', 'Tools', function TasksService($http, Tools) {
    /**
     * @memberof TasksService
     * @method
     * @name markAsDone
     * @description set task as done
     * @param id {Number} id
     * @returns Promise
     */
    this.markAsDone = function (id) {
      return $http.post('/api/tasks/' + id + '/mark-as-done', {id: id})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name get
     * @description get task
     * @param id {Number} id
     * @returns Promise
     */
    this.get = function (id) {
      return $http.get('/api/tasks/' + id, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name del
     * @description delete task
     * @param obj {Object} obj
     * @returns Promise
     */
    this.del = function (obj) {
      return $http.delete('/api/tasks/' + obj.id, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name post
     * @description post task
     * @param obj {Object} object
     * @returns Promise
     */
    this.post = function (obj) {
      return $http.post('/api/tasks', obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name put
     * @description put task
     * @param obj {Object} obj
     * @returns Promise
     */
    this.put = function (obj) {
      return $http.put('/api/tasks/' + obj.id, obj)
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name tags
     * @description list of tags
     * @returns Promise
     */
    this.tags = function () {
      return $http.get('/api/tasks/tags/all', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name relatedList
     * @description all related list for task
     * @param obj {Object} object
     * @returns Promise
     */
    this.relatedList = function (obj) {
      return $http.get('/api/tasks/' + obj.id + '/related/all/', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name relatedPrecedingList
     * @description all related preceding list for task
     * @param obj {Object} object
     * @returns Promise
     */
    this.relatedPrecedingList = function (obj) {
      return $http.get('/api/tasks/' + obj.id + '/related/preceding', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name relatedFollowingList
     * @description all related following list for task
     * @param obj {Object} object
     * @returns Promise
     */
    this.relatedFollowingList = function (obj) {
      return $http.get('/api/tasks/' + obj.id + '/related/following', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name list
     * @description all tasks
     * @param params {Object} params
     * @returns Promise
     */
    this.list = function (params) {
      return $http.get('/api/tasks?' + Tools.objectToQueryString(params), {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name userCount
     * @description all tasks for user - count
     * @returns Promise
     */
    this.userCount = function () {
      return $http.get('/api/tasks/user/count', {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name userListOld
     * @description all tasks for user - old
     * @param params {Object} params
     * @returns Promise
     */
    this.userListOld = function (params) {
      return $http.get('/api/tasks/user/list/old/' + params.limit, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name userListToday
     * @description all tasks for user - today
     * @param params {Object} params
     * @returns Promise
     */
    this.userListToday = function (params) {
      return $http.get('/api/tasks/user/list/today/' + params.limit, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name userListTomorrow
     * @description all tasks for user - tomorrow
     * @param params {Object} params
     * @returns Promise
     */
    this.userListTomorrow = function (params) {
      return $http.get('/api/tasks/user/list/tomorrow/' + params.limit, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name userListNew
     * @description all tasks for user - new
     * @param params {Object} params
     * @returns Promise
     */
    this.userListNew = function (params) {
      return $http.get('/api/tasks/user/list/new/' + params.limit, {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
    /**
     * @memberof TasksService
     * @method
     * @name listForAppointment
     * @description all tasks for appointment
     * @param params {Object} params
     * @returns Promise
     */
    this.listForAppointment = function (params) {
      return $http.get('/api/tasks/appointment/' + (params.id || '0') + '?' + Tools.objectToQueryString(params), {cache: false})
        .error(function (data) {
          console.log(data);
        });
    };
  }]);
