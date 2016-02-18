/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Test
 * @fileOverview TestCtrl
 */

/**
 * @namespace TestCtrl
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('TestCtrl', ['$scope', '$translate', '$translatePartialLoader', '$rootScope', '$timeout', 'CountriesService', 'PageAncestor', 'DateService', 'CompaniesService', '$locale', 'DatepickerFactory', function ($scope, $translate, $translatePartialLoader, $rootScope, $timeout, Countries, PageAncestor, DateService, CompaniesService, $locale, DatepickerFactory) {
    $translatePartialLoader.addPart('test');
    $translate.refresh();

    $scope.boxItems = [];
    $scope.box = '';
    $scope.countries = [];
    $scope.form = {};
    $scope.datum = null;
    $scope.datumStr = '';
    $scope.localData = [
      {id: 1, name: 'Martin Boháč'},
      {id: 2, name: 'Iva Hlinková'}
    ];
    $scope.tmpSearch = {};
    $scope.dt = (new Date()).toISOString();

    $scope.dp = DatepickerFactory.getInstance();
    $scope.dp.init($scope);

    $scope.test = function (event) {
      $scope.testm2 = event.which;
    };

    $scope.dateToWord = function (event, str) {
      if (event.keyCode === 13) {
        $scope.datum = DateService.wordFromDateRange(DateService.strToDate(str), DateService.strToDate('7.8.2014'));
      }
    };

    // DATEPICKER
    /*$scope.dateOptions = {};
    // Disable weekend selection
    $scope.disabled = function (date, mode) {
      return false; //(mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };
    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };*/
    /*$scope.$watch($locale.id, function () {
      console.log('Change locale');
      $timeout(function () {
        $scope.dateOptions = {
          showWeeks: false,
          startingDay: ($locale.id === 'en-us' ? 0 : 1)
        };
        $scope.setDatepicker();
      }, 1000);
    }, true);*/
    $scope.setDatepicker = function () {
      //$scope.dt = new Date($scope.dt.getTime());
      //$scope.minDate = new Date();
      console.log('setDatepicker');
      angular.bootstrap();
    };
    // KONEC DATEPICKER

    /**
     * @memberof TestCtrl
     * @method
     * @name getCountries
     * @description load count Countries into property countries
     * @returns void
     */
    $scope.getCountries = function () {
      Countries.list().then(function (obj) {
        $scope.countries = obj.data;
      });
    };

    /**
     * @memberof TestCtrl
     * @method
     * @name save
     * @description save data from form
     * @returns void
     */
    $scope.save = function () {
      PageAncestor.post(function () {
        return $timeout(function () {
          console.log('POST');
        }, 1000);
      });
    };

    /**
     * @memberof TestCtrl
     * @method
     * @name delete
     * @description delete data from form
     * @returns void
     */
    $scope.del = function () {
      PageAncestor.del(function () {
        return $timeout(function () {
          console.log('DELETE');
        }, 1000);
      });
    };

    // Run
    $scope.getCountries();
    PageAncestor.init({
      scope: $scope,
      formObject: 'form',
      table: 'TEST'
    });

    // Events
    $rootScope.$on('$translateChangeSuccess', function (event, current, previous) {
      $scope.getCountries();
    });
  }]);
