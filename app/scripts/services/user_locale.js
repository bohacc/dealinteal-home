/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .service('UserLocale', function Translate($http, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var deferred = $q.defer();
    return {
      getKey: function () {
        $http.get('/api/user')
          .success(function (data) {
            deferred.resolve(data.translate);
          })
          .error(function (data) {
            deferred.reject(data);
          });
        return deferred.promise;
      }
    };
  });
