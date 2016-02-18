/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .service('AuthenticationService', ['$location', '$http', '$cookies', function ($location, $http, $cookies) {
    var isLogin = false;
    return {
      isLogin: isLogin,
      /**
       * @memberof AuthenticationService
       * @method
       * @name login
       * @description login
       * @returns void
       */
      login: function (credentials, fce, fceErrorAuth, fceError) {
        $http.post('/api/login', {credentials: credentials}).
          success(function (data) {
            if (data.success) {
              isLogin = true;
              fce(data);
            } else {
              fceErrorAuth(data);
            }
          })
          .error(function (data) {
            fceError(data);
          });
      },
      /**
       * @memberof AuthenticationService
       * @method
       * @name logout
       * @description logout
       * @returns void
       */
      logout: function () {
        $cookies.auth_token = '';
        $location.path('/login');
        $http.get('/api/logout', {cache: false});
      },
      /**
       * @memberof AuthenticationService
       * @method
       * @name sendConnectionRefresh
       * @description send request for refresh connection
       * @returns void
       */
      sendConnectionRefresh: function () {
        $http.post('/api/authentication/alive', {});
      }
    };
  }]);
