/*jslint node: true */
'use strict';

/**
 * @file ContractsCtrl
 * @fileOverview Contracts
 */

/**
 * @namespace Contracts
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('ContractsCtrl', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('contracts');
    $translate.refresh();

    /**
     * @memberof Contracts
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
