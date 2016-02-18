/*jslint node: true, unparam: true */
'use strict';

/**
 * @file ratingnotia
 * @fileOverview ratingNotia
 */

/**
 * @namespace ratingNotia
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('ratingNotia', function () {
    /**
     * @memberof ratingNotia
     * @method
     * @name directive
     * @description rating
     * @param readonly {Object} set read only
     * @param onHover {Event} event onHover
     * @param onLeave {Event} event onLeave
     * @returns void
     */
    return {
      templateUrl: 'views/directives/d_ratingnotia.html',
      restrict: 'EA',
      require: ['ratingNotia', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: ['$scope', '$attrs', function ($scope, $attrs) {
        var ngModelCtrl = { $setViewValue: angular.noop },
          ratingConfig = {
            max: 5,
            stateOn: null,
            stateOff: null
          },
          i,
          n;

        this.init = function (ngModelCtrl_) {
          ngModelCtrl = ngModelCtrl_;
          ngModelCtrl.$render = this.render;

          this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
          this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;

          var ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) : new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
          $scope.range = this.buildTemplateObjects(ratingStates);
        };

        this.buildTemplateObjects = function (states) {
          for (i = 0, n = states.length; i < n; i += 1) {
            states[i] = angular.extend({ index: i }, { stateOn: this.stateOn, stateOff: this.stateOff }, states[i]);
          }
          return states;
        };

        $scope.rate = function (value) {
          if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
            ngModelCtrl.$setViewValue(value);
            ngModelCtrl.$render();
          }
        };

        $scope.enter = function (value) {
          if (!$scope.readonly) {
            $scope.value = value;
          }
          $scope.onHover({value: value});
        };

        $scope.reset = function () {
          $scope.value = ngModelCtrl.$viewValue;
          $scope.onLeave();
        };

        $scope.onKeydown = function (evt) {
          if (/(37|38|39|40)/.test(evt.which)) {
            evt.preventDefault();
            evt.stopPropagation();
            $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
          }
        };

        this.render = function () {
          $scope.value = ngModelCtrl.$viewValue;
        };

      }],
      replace: true,
      link: function postLink(scope, element, attrs, ctrls) {
        var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          ratingCtrl.init(ngModelCtrl);
        }
      }
    };
  });