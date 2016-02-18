/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .controller('HomeCtrl', ['$scope', '$translate', '$translatePartialLoader', function ($scope, $translate, $translatePartialLoader) {
    $translatePartialLoader.addPart('home');
    $translate.refresh();
  }]);
