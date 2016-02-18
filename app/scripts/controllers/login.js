/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .controller('LoginController', ['$scope', '$timeout', '$cookies', '$translate', '$translatePartialLoader', 'AuthenticationService', 'AlertsService', 'Constants', 'Tools', 'MessengerService',
    function ($scope, $timeout, $cookies, $translate, $translatePartialLoader, auth, AlertsService, Constants, Tools, MessengerService) {
      $translatePartialLoader.addPart('login');
      $translate.refresh();
      // angular.translate have a issue with translate on first show page, remove this after fix issue
      $timeout(function () {
        $translate.refresh();
      }, 300);
      $scope.credentials = {};
      $scope.credentials.pin = '';
      $scope.credentials.login = '';
      $scope.credentials.password = '';
      $scope.messenger = MessengerService.getData();
      $scope.message = $scope.messenger ? $scope.messenger.message : '';

      $scope.credentials = {login: '', password: '', pin: ''};

      $scope.login = function () {
        $scope.credentials.login = $('#lg').val();
        $scope.credentials.password = $('#pw').val();
        $scope.credentials.pin = $('#pinpw').val();
        auth.login($scope.credentials,
          function () {
            $('#login-login').val($scope.credentials.login);
            $('#login-password').val($scope.credentials.password);
            $('#login-password2').val($scope.credentials.pin);
            $('#login-form').submit();
          },
          function (data) {
            AlertsService.add(data.message);
          },
          function (data) {
            AlertsService.add({type: Constants.MESSAGE_ERROR, message: (data ? data.message.msg : Constants.MESSAGE_ERROR)});
          });
      };

      // Run
      Tools.setLanguage($cookies.language || 'en-us');
    }]);
