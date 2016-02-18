/*jslint node: true, unparam: true */
'use strict';

/**
 * @file html_text_editor
 * @fileOverview htmlTextEditor
 */

/**
 * @namespace htmlTextEditor
 * @author Pavel Kolomazník
 */
angular.module('crmPostgresWebApp')
  .directive('htmlTextEditor', [function () {
    return {
      templateUrl: 'views/directives/html_text_editor.html',
      restrict: 'E',
      scope: {
        model: '='
      }
    };
  }]);
