/*jslint node: true*/
'use strict';

/**
 * @file auth_http_response_interceptor
 * @fileOverview authHttpResponseInterceptor
 */

/**
 * @namespace authHttpResponseInterceptor
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .factory('authHttpResponseInterceptor', ['$q', '$location', 'AlertsService', 'Constants', function ($q, $location, AlertsService, Constants) {
    return {
      response: function (response) {
        if (response.status === 401) {
          $location.path('/login');
          AlertsService.add({type: Constants.MESSAGE_ERROR, message: Constants.MESSAGE_CONNECTION_LOST});
        }
        // information about close connection
        if (response.status === 203) {
          AlertsService.add({type: Constants.MESSAGE_WARNING_MODAL, message: Constants.MESSAGE_CONNECTION_SOON_LOST});
        }
        return response || $q.when(response);
      },
      responseError: function (rejection) {
        if (rejection.status === 401) {
          $location.path('/login');
          AlertsService.add({type: Constants.MESSAGE_ERROR, message: Constants.MESSAGE_CONNECTION_LOST});
        }
        return $q.reject(rejection);
      }
    };
  }]);
