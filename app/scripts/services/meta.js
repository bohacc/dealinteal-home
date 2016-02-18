/*jslint node: true */
'use strict';

/**
 * @file Meta
 * @fileOverview MetaService
 */

/**
 * @namespace MetaService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('Meta', ['$rootScope', 'UsersService', 'Tools', function Meta($rootScope, UsersService, Tools) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var isLoaded = null;
    return {
      /**
       * @memberof MetaService
       * @method
       * @name setMetaInformations
       * @description set meta informations for application (language, user login atc.)
       * @returns Promise
       */
      setMetaInformations: function () {
        if (!isLoaded) {
          return UsersService.get().then(function (promise) {
            // set meta
            $rootScope.meta = {
              title: promise.data.loginName,
              language: promise.data.language,
              ownerId: promise.data.id,
              ownerName: promise.data.ownerName,
              version: ('v' + promise.data.version || 'v000'),
              env: promise.data.env
            };
            // set language
            if (promise.data.language) {
              isLoaded = true;
            }
            return Tools.setLanguage(promise.data.language || 'en-us');
          });
        }
        return null;
      }
    };
  }]);
