/*jslint node: true */
'use strict';

/**
 * @file OurCompanyCtrl
 * @fileOverview OurCompany
 */

/**
 * @namespace OurCompany
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('OurCompanyCtrl', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('ourCompany');
    $translate.refresh();

    /**
     * @memberof OurCompany
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
