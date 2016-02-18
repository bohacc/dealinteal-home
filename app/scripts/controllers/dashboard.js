/*jslint node: true */
'use strict';

/**
 * @file DashboardCtrl
 * @fileOverview Dashboard
 */

/**
 * @namespace Dashboard
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('DashboardCtrl', ['$scope', '$translate', '$translatePartialLoader', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('dashboard');
    $translate.refresh();

    /**
     * @memberof Dashboard
     * @method
     * @name defaultFunction
     * @description description
     * @param {string} arg1
     * @param {string} arg2
     * @returns void
     */
    $scope.defaultFunction = function (arg1, arg2) {

    };
  }]);
