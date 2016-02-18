/*jslint node: true */
'use strict';

/**
 * @file <%= classedName %>Ctrl
 * @fileOverview <%= classedName %>
 */

/**
 * @namespace <%= classedName %>
 * @author Name
 */

angular.module('<%= scriptAppName %>')
  .controller('<%= classedName %>Ctrl', function ($scope, $translate, $translatePartialLoader) {
    // translate
    $translatePartialLoader.addPart('<%= cameledName %>');
    $translate.refresh();

    /**
     * @memberof <%= classedName %>
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
