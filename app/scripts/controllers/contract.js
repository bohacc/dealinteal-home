/*jslint node: true */
'use strict';

/**
 * @file ContractCtrl
 * @fileOverview Contract
 */

/**
 * @namespace Contract
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('ContractCtrl', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('contract');
    $translate.refresh();

    /**
     * @memberof Contract
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
