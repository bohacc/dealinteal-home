/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file action_buttons
 * @fileOverview actionButtons
 */

/**
 * @namespace actionButtons
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('ActionButtonsCtrl', ['$scope', function ($scope) {
    /**
     * @memberof actionButtons
     * @method
     * @name clickBtn
     * @description run event for not disabled item
     * @returns void
     */
    $scope.clickBtn = function (obj) {
      if (!obj.disabled()) {
        obj.onClick();
      }
    };
  }])
  .directive('actionButtons', [function () {
    /**
     * @memberof actionButtons
     * @method
     * @name directive
     * @description actionButtons
     * @param buttons {Object} buttons
     * @returns void
     */
    return {
      templateUrl: 'views/directives/d_action_buttons.html',
      restrict: 'E',
      replace: true,
      scope: {
        buttons: '='
      },
      controller: 'ActionButtonsCtrl'
    };
  }]);
