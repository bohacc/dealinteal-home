/*jslint node: true, unparam: true, regexp: true */
'use strict';

/**
 * @file format_currency
 * @fileOverview formatCurrency
 */

/**
 * @namespace formatCurrency
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('formatCurrency', ['$filter', '$parse', function ($filter, $parse) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function (data) {
          // Attempt to convert user input into a numeric type to store
          // as the model value (otherwise it will be stored as a string)
          // NOTE: Return undefined to indicate that a parse error has occurred
          //       (i.e. bad user input)
          var parsed = parseFloat(data);
          return !isNaN(parsed) ? parsed : undefined;
        });

        ngModelController.$formatters.push(function (data) {
          //convert data from model format to view format
          return $filter('currency')(data); //converted
        });

        element.bind('focus', function () {
          element.val(ngModelController.$modelValue);
        });

        element.bind('blur', function () {
          // Apply formatting on the stored model value for display
          var formatted = $filter('currency')(ngModelController.$modelValue);
          element.val(formatted);
        });
      }
    };
  }]);
