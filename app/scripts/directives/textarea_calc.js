'use strict';

/**
 * @ngdoc directive
 * @name crmPostgresWebApp.directive:textareaCalc
 * @description
 * # textareaCalc
 */
angular.module('crmPostgresWebApp')
  .directive('textareaCalc', ['AlertsService', 'Constants', function (AlertsService, Constants) {
    return {
      templateUrl: 'views/directives/d_textarea_calc.html',
      restrict: 'E',
      replace: true,
      scope: {
        textareaId: '@',
        textareaName: '@',
        textareaClass: '@',
        textareaPlaceholder: '@',
        textareaTabindex: '@',
        model: '=',
        textareaMaxlength: '@'
      },
      link: function postLink(scope, element, attrs) {
        //element.text('this is the textareaCalc directive');
        scope.$watch('model', function (oldValue, newValue) {
          if (newValue !== oldValue) {
            if (scope.model && scope.model.length > parseInt(scope.textareaMaxlength, 10)) {
              AlertsService.add({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: [{message: Constants.MESSAGE_TEXTAREA_OVERFLOW}]});
            }
          }
        });
      }
    };
  }]);
