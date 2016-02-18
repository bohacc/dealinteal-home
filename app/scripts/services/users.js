/*jslint node: true */
'use strict';

/**
 * @file Users
 * @fileOverview UsersService
 */

/**
 * @namespace UsersService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('UsersService', ['$http', function ($http) {
    return {
      /**
       * @memberof UsersService
       * @method
       * @name saveLanguage
       * @description save language into database
       * param key {String}
       * @returns HttpPromise
       */
      saveLanguage: function (key) {
        return $http.put('/api/user', {language: key});
      },
      /**
       * @memberof UsersService
       * @method
       * @name get
       * @description get user from DB
       * @returns HttpPromise
       */
      get: function () {
        return $http.get('/api/user');
      },
      /**
       * @memberof UsersService
       * @method
       * @name list
       * @description get users list from DB
       * @returns HttpPromise
       */
      list: function () {
        return $http.get('/api/users', {cache: false});
      },
      /**
       * @memberof UsersService
       * @method
       * @name listWithoutOwner
       * @description get users list from DB without owner
       * @returns HttpPromise
       */
      listWithoutOwner: function () {
        return $http.get('/api/users/without-owner', {cache: false});
      },
      /**
       * @memberof UsersService
       * @method
       * @name logout
       * @description logout user
       * @returns HttpPromise
       */
      logout: function () {
        return $http.get('/api/logout', {cache: false});
      },
      /**
       * @memberof UsersService
       * @method
       * @name createPermission
       * @description create permission for user
       * @returns HttpPromise
       */
      createPermission: function (obj) {
        return $http.post('/api/admin/create-restrictions/user', obj);
      }
    };
  }]);
