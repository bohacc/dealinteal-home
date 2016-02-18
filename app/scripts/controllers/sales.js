/*jslint node: true */
'use strict';

/**
 * @file SalesCtrl
 * @fileOverview Sales
 */

/**
 * @namespace Sales
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('SalesCtrl', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('sales');
    $translate.refresh();

    /**
     * @memberof Sales
     * @method
     * @name defaultFunction
     * @description description
     * @param {string} arg1
     * @param {string} arg2
     * @returns void
     */
    $scope.defaultFunction = function (arg1, arg2) {
    
    };
  });
