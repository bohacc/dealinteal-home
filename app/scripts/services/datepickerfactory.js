/*jslint node: true */
'use strict';

/**
 * @file datepickerfactory
 * @fileOverview DatepickerFactory
 */

/**
 * @namespace DatepickerFactory
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('DatepickerFactory', ['$timeout', '$locale', 'Tools', 'DateService', 'Language', function DatepickerFactory($timeout, $locale, Tools, DateService, Language) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var Obj = function () {
      var scope = {};
      /**
       * @memberof DatepickerFactory
       * @method
       * @name init
       * @description init methods for datepickers
       * @params scope {Object} scope
       * @params arr {Array} datepickers
       * @returns Object
       */
      this.init = function ($scope) {
        scope = $scope;
        scope.opened = {};
        scope.minDate = new Date(1899, 1, 1);
        //scope.format = $locale.DATETIME_FORMATS.shortDate;
        scope.format = 'd.M.yyyy';
        scope.formatTime = $locale.DATETIME_FORMATS.shortTime;
        scope.getLanguage = Language.getLanguage;
        scope.$watch('getLanguage()', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            // set format local for runtime
            //scope.format = $locale.DATETIME_FORMATS.shortDate;
            scope.format = 'd.M.yyyy';
            scope.formatTime = $locale.DATETIME_FORMATS.shortTime;
            DateService.setFormat(scope.format);
            DateService.setFormatTime($locale.DATETIME_FORMATS.shortTime);
            // set format global
            //uibDatepickerPopupConfig.datepickerPopup = $locale.DATETIME_FORMATS.shortDate;
            //uibDatepickerConfig.startingDay = $locale.id === 'en-us' ? 0 : 1;
            // refresh Datepicker
            scope.minDate = new Date(scope.minDate.getTime());
          }
        });
        /*return {open: this.open, invalidDate: this.invalidDate, disabledDateTo: this.disabledDateTo};*/
      };

      /**
       * @memberof DatepickerFactory
       * @method
       * @name open
       * @description open popup
       * @params name {String} name of property
       * @params id {String} if for focus
       * @returns void
       */
      this.open = function (name, id) {
        $timeout(function () {
          scope.opened[name] = !scope.opened[name];
          $('#' + id).focus();
        }, 100);
      };

      /**
       * @memberof DatepickerFactory
       * @method
       * @name invalidDate
       * @description check for valid date
       * @params id {String}
       * @returns Boolean
       */
      this.invalidDate = function (id) {
        return $('#' + id).val() ? !Tools.validateDate($('#' + id).val(), null) : false;
      };

      /**
       * @memberof DatepickerFactory
       * @method
       * @name disabledDateTo
       * @description disable any date
       * @params date {Date}
       * @params mode {String}
       * @returns Boolean
       */
      this.disabledDateTo = function (date, mode, dateFrom) {
        return (mode === 'day' && date < new Date((new Date(dateFrom))).setHours(0, 0, 0, 0));
      };
    };

    this.getInstance = function () {
      return new Obj();
    };
  }]);
