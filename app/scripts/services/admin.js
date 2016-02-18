/*jslint node: true, unparam: true*/
'use strict';

angular.module('crmPostgresWebApp')
  .service('Admin', function Admin($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      createUser: function (callback) {
        $http.post('/api/user/create')
          .success(function (data) {
            callback(data.message);
          });
      }
    };
  });
