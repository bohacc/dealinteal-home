/*jslint node: true */
'use strict';

/**
 * @file datepickerNotia
 * @fileOverview datepickerNotia
 */

/**
 * @namespace datepickerNotia
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .directive('timepickerNotia', ['$locale', '$compile', 'Language', 'uibDatepickerPopupConfig', 'DateService', 'Tools', function ($locale, $compile, Language, uibDatepickerPopupConfig, DateService, Tools) {
    return {
      template: '<div></div>',
      restrict: 'A',
      replace: true,
      scope: {},
      link: function ($scope, element, attrs) {
        $scope.opened = false;
        $scope.formatTime = $locale.DATETIME_FORMATS.shortTime;
        $scope.template = '<input type="text" data-time-format="{{formatTime}}" data-model-time-format="{{formatTime}}" class="form-control" bs-timepicker/>';
        $scope.minDate = new Date(1899, 1, 1);
        $scope.getLanguage = Language.getLanguage;
        $scope.$watch('getLanguage()', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            // set format local for runtime
            $scope.formatTime = 'h:mm';//$locale.DATETIME_FORMATS.shortTime;
            DateService.setFormatTime($scope.formatTime);
            element.html($scope.template).show();
            $compile(element.contents())($scope);
            // set format global
            //uibDatepickerPopupConfig.datepickerPopup = $locale.DATETIME_FORMATS.shortDate;
            //uibDatepickerConfig.startingDay = $locale.id === 'en-us' ? 0 : 1;
            // refresh Datepicker
            //$scope.minDate = new Date($scope.minDate.getTime());
          }
        });
      }
    };
  }]);
