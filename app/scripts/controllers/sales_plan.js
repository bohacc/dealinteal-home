/*jslint node: true */
'use strict';

/**
 * @file SalesPlanCtrl
 * @fileOverview SalesPlan
 */

/**
 * @namespace SalesPlan
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('SalesPlanCtrl', ['$scope', '$q', '$filter', '$translate', '$translatePartialLoader', 'SalesPlanService', 'usSpinnerService', 'initialData', function ($scope, $q, $filter, $translate, $translatePartialLoader, SalesPlanService, usSpinnerService, initialData) {
    // translate
    $translatePartialLoader.addPart('sales_plan');
    $translate.refresh();

    $scope.sum = {};
    $scope.intervalTypes = [{id: 1, name: $filter('translate')('MONTHLY')}, {id: 2, name: $filter('translate')('QUARTERLY')}, {id: 3, name: $filter('translate')('YEARLY')}];
    $scope.selectedIntervalType = $scope.intervalTypes[0];
    $scope.items = {};
    $scope.years = initialData.years || [];
    $scope.year = {};
    $scope.months = initialData.months || [];
    $scope.month = {};
    $scope.quarter = initialData.quarter || [];
    $scope.monthsIndex = 0;
    $scope.yearIndex = 0;
    $scope.disabledPrior = false;
    $scope.disabledNext = false;
    $scope.disableInterval = false;
    $scope.disableMonth = false;
    $scope.disableYear = false;
    $scope.current = {};
    $scope.range = '';
    $scope.salesItemsshowDetail = false;
    $scope.sortFields = [{name: 'REVENUE', sortField: 'revenueSum'}, {name: 'NAME2', sortField: 'name'}];
    $scope.salesItemsSortField = $scope.sortFields[1];
    $scope.groupFields = [{name: 'PRODUCT', fce: SalesPlanService.listProductGroup}, {name: 'COMPANY', fce: SalesPlanService.listCompanyGroup}];
    $scope.salesItemsGroupField = $scope.groupFields[1];

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name loadData
     * @description load all data for year
     * @returns HttpPromise
     */
    $scope.loadData = function () {
      if (!$scope.year || !$scope.month) {
        return null;
      }
      var company, team, domain, products, params;
      if ($scope.notLoaded()) {
        $scope.clearCurrent();
        usSpinnerService.spin('spinner-load-data');
        company = SalesPlanService.sumForCompany($scope.createFilterObject());
        team = SalesPlanService.sumForPersonal($scope.createFilterObject());
        domain = SalesPlanService.sumForDomain($scope.createFilterObject());
        params = $scope.createFilterObject();
        params.sortField = $scope.salesItemsSortField.sortField;
        products = SalesPlanService.listCompanyGroup(params);
        $scope.disableFilter();
        return $q.all([company, team, domain, products]).then(function (results) {
          $scope.setResults(results);
          $scope.enableFilter();
          $scope.setNavbar();
          usSpinnerService.stop('spinner-load-data');
          $scope.setRange();
          $scope.setCurrent();
        });
      }
      $scope.setRange();
      $scope.setCurrent();
      return null;
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setInterval
     * @description set intervalName
     * @param index {Number} index of intervalTypes
     * @returns void
     */
    $scope.setInterval = function (index) {
      $scope.selectedIntervalType = $scope.intervalTypes[index];
      $scope.monthsIndex = 0;
      $scope.yearIndex = 0;
      $scope.initMonths();
      $scope.setYear($scope.yearIndex);
      $scope.setMonths($scope.monthsIndex);
      $scope.setNavbar();
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setTabsForItems
     * @description set tabs for sales plan items
     * @param index {Number} index of intervalTypes
     * @returns void
     */
    $scope.setTabsForItems = function (index) {
      $scope.selectedTab = index;
      /*if (index === 0) {
        $scope.items = $scope.current.team;
      }
      if (index === 1) {
        $scope.items = $scope.current.domain;
      }*/
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name prevRange
     * @description set prev range
     * @returns void
     */
    $scope.prevRange = function () {
      // for year interval
      if ($scope.selectedIntervalType.id === 3) {
        $scope.yearIndex += 1;
        $scope.setYear($scope.yearIndex);
        $scope.setNavbar();
        return;
      }
      // for quarter and monthly interval
      var months = $filter('filter')($scope.months, {year: $scope.year.year});
      if ($scope.monthsIndex === months.length - 1) {
        $scope.monthsIndex = 0;
        $scope.yearIndex += 1;
        $scope.setYear($scope.yearIndex);
      } else {
        $scope.monthsIndex += 1;
      }
      $scope.setMonths($scope.monthsIndex);
      $scope.setNavbar();
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name nextRange
     * @description set next range
     * @returns void
     */
    $scope.nextRange = function () {
      // for year interval
      if ($scope.selectedIntervalType.id === 3) {
        $scope.yearIndex -= 1;
        $scope.setYear($scope.yearIndex);
        $scope.setNavbar();
        return;
      }
      // for quarter and monthly interval
      var months = $filter('filter')($scope.months, {year: $scope.year.year});
      if ($scope.monthsIndex === 0) {
        $scope.yearIndex -= 1;
        $scope.setYear($scope.yearIndex);
        months = $filter('filter')($scope.months, {year: $scope.year.year});
        $scope.monthsIndex = months.length - 1;
      } else {
        $scope.monthsIndex -= 1;
      }
      $scope.setMonths($scope.monthsIndex);
      $scope.setNavbar();
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setYear
     * @description set year value for filter
     * @param index {Number} index of years
     * @returns void
     */
    $scope.setYear = function (index) {
      $scope.year = $scope.years[index];
      $scope.monthsIndex = 0;
      $scope.yearIndex = index;
      $scope.setMonths($scope.monthsIndex);
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setMonths
     * @description set month value for filter
     * @param index {Number} index of months
     * @returns void
     */
    $scope.setMonths = function (index) {
      if (!$scope.year) {
        return;
      }
      $scope.month = $filter('filter')($scope.months, {year: $scope.year.year})[index];
      $scope.monthsIndex = index;
      $scope.setNavbar();
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setNavbar
     * @description set enabled/disabled navbar
     * @returns void
     */
    $scope.setNavbar = function () {
      $scope.disabledNext = !!($scope.monthsIndex === 0 && $scope.yearIndex === 0);
      $scope.disabledPrior = !!($scope.monthsIndex === $filter('filter')($scope.months, {year: $scope.year.year}).length - 1 && $scope.yearIndex === $scope.years.length - 1);
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name disableFilter
     * @description disabled filter
     * @returns void
     */
    $scope.disableFilter = function () {
      $scope.disabledPrior = true;
      $scope.disabledNext = true;
      $scope.disableInterval = true;
      $scope.disableMonth = true;
      $scope.disableYear = true;
      $scope.disableShow = true;
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name enableFilter
     * @description enable filter
     * @returns void
     */
    $scope.enableFilter = function () {
      $scope.disabledPrior = false;
      $scope.disabledNext = false;
      $scope.disableInterval = false;
      $scope.disableMonth = false;
      $scope.disableYear = false;
      $scope.disableShow = false;
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name clearCurrent
     * @description clear current property
     * @returns void
     */
    $scope.clearCurrent = function () {
      $scope.current = {company: {}, team: {}, domain: {}, products: []};
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setRange
     * @description set range property
     * @returns void
     */
    $scope.setRange = function () {
      $scope.range = $scope.selectedIntervalType.id === 3 ? $scope.year.year : $scope.month.name + '/' + $scope.year.year;
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setCurrent
     * @description set current property
     * @returns void
     */
    $scope.setCurrent = function () {
      $scope.current = $scope.selectedIntervalType.id === 3 ? $scope.sum[$scope.year.name] : $scope.sum[$scope.year.year][$scope.month.name];
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name notLoaded
     * @description check exists data locally
     * @returns Boolean
     */
    $scope.notLoaded = function () {
      return $scope.selectedIntervalType.id === 3 ? !($scope.sum[$scope.year.name]) : !($scope.sum[$scope.year.year] && $scope.sum[$scope.year.year][$scope.month.name]);
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setResults
     * @description set results to sum property
     * @param results {Promise} results
     * @returns void
     */
    $scope.setResults = function (results) {
      if ($scope.selectedIntervalType.id === 3) {
        $scope.sum[$scope.year.name] = $scope.sum[$scope.year.name] || {};
        $scope.sum[$scope.year.name].company = results[0].data;
        $scope.sum[$scope.year.name].team = results[1].data;
        $scope.sum[$scope.year.name].domain = results[2].data;
        $scope.sum[$scope.year.name].products = results[3].data;
      } else {
        $scope.sum[$scope.year.year] = $scope.sum[$scope.year.year] || {};
        $scope.sum[$scope.year.year][$scope.month.name] = {};
        $scope.sum[$scope.year.year][$scope.month.name].company = results[0].data;
        $scope.sum[$scope.year.year][$scope.month.name].team = results[1].data;
        $scope.sum[$scope.year.year][$scope.month.name].domain = results[2].data;
        $scope.sum[$scope.year.year][$scope.month.name].products = results[3].data;
      }
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name createFilterObject
     * @description create object for filter
     * @returns Object
     */
    $scope.createFilterObject = function () {
      var res;
      if ($scope.selectedIntervalType.id === 3) { // for year interval
        res = {year: $scope.year.year, from: 1, to: 12};
      } else {
        res = {year: $scope.year.year, from: $scope.month.from, to: $scope.month.to};
      }
      return res;
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name initMonths
     * @description initialization months
     * @returns void
     */
    $scope.initMonths = function () {
      if ($scope.selectedIntervalType.id === 1) {
        $scope.months = initialData.months || [];
      }
      if ($scope.selectedIntervalType.id === 2) {
        $scope.months = initialData.quarter || [];
      }
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setSort
     * @description sort list
     * @param index {Number} index
     * @returns void
     */
    $scope.setSort = function (index) {
      $scope.salesItemsSortField = $scope.sortFields[index];
      $scope.loadProducts($scope.salesItemsGroupField.fce);
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name setGroup
     * @description group list
     * @param index {Number} index
     * @returns void
     */
    $scope.setGroup = function (index) {
      $scope.salesItemsGroupField = $scope.groupFields[index];
      $scope.loadProducts($scope.salesItemsGroupField.fce);
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name loadProducts
     * @description load products
     * @returns void
     */
    $scope.loadProducts = function (fce) {
      var obj;
      obj = $scope.createFilterObject();
      obj.sortField = $scope.salesItemsSortField.sortField;
      usSpinnerService.spin('spinner-load-data-sales-items');
      fce(obj).then(function (result) {
        usSpinnerService.stop('spinner-load-data-sales-items');
        if ($scope.selectedIntervalType.id === 3) {
          $scope.sum[$scope.year.name].products = result.data;
        } else {
          $scope.sum[$scope.year.year][$scope.month.name].products = result.data;
        }
      });
    };

    /**
     * @memberof SalesPlanCtrl
     * @method
     * @name init
     * @description initialization
     * @returns void
     */
    $scope.init = function () {
      $scope.setYear($scope.yearIndex);
      if (!$scope.year || JSON.stringify($scope.year) === '{}') {
        $scope.disableFilter();
        return;
      }
      $scope.setMonths($scope.monthsIndex);
      $scope.loadData();
      $scope.setNavbar();
      $scope.setTabsForItems(0);
    };

    // Run
    $scope.init();
  }]);
