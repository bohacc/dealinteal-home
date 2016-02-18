/*jslint node: true */
'use strict';

/**
 * @file changelog
 * @fileOverview ChangelogCtrl
 */

/**
 * @namespace ChangelogCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('ChangelogCtrl', ['$scope', '$translate', '$translatePartialLoader', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('changelog');
    $translate.refresh();

    /**
     * @memberof Changelog
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
