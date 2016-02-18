/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file sales_plan
 * @fileOverview SalesPlanService
 */

/**
 * @namespace SalesPlanService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('SalesPlanService', ['$http', 'Tools', function SalesPlanService($http, Tools) {
    /**
     * @memberof SalesPlanService
     * @method
     * @name sumForCompany
     * @description sum sales plan for company
     * @param obj {Object} obj
     * @returns HttpPromise
     */
    this.sumForCompany = function (obj) {
      return $http.get('/api/sales-plan/my-company?' + Tools.objectToQueryString(obj), {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name sumForDomain
     * @description sum sales plan for domain
     * @param obj {Object} obj
     * @returns HttpPromise
     */
    this.sumForDomain = function (obj) {
      return $http.get('/api/sales-plan/domain?' + Tools.objectToQueryString(obj), {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };

    /**
     * @memberof SalesPlanService
     * @method
     * @name sumForPersonal
     * @description sum sales plan for personal
     * @param obj {Object} obj
     * @returns HttpPromise
     */
    this.sumForPersonal = function (obj) {
      return $http.get('/api/sales-plan/personal?' + Tools.objectToQueryString(obj), {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name yearsForFilter
     * @description list of years from sales plan
     * @returns HttpPromise
     */
    this.yearsForFilter = function () {
      return $http.get('/api/sales-plan/filter/years', {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name monthsForFilter
     * @description list of years from sales plan
     * @returns HttpPromise
     */
    this.monthsForFilter = function () {
      return $http.get('/api/sales-plan/filter/months', {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name quarterForFilter
     * @description list of quarter from sales plan
     * @returns HttpPromise
     */
    this.quarterForFilter = function () {
      return $http.get('/api/sales-plan/filter/quarter', {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name monthsArrayForFilter
     * @description arry struct for filter
     * @param data {Array} array with data
     * @returns Array
     */
    this.monthsArrayForFilter = function (data) {
      var i, l, arr = [];
      for (i = 0, l = data.length; i < l; i += 1) {
        arr.push({
          id: i,
          name: data[i].name,
          month: data[i].month,
          year: data[i].year,
          from: data[i].from,
          to: data[i].to
        });
      }
      return arr;
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name yearsArrayForFilter
     * @description arry struct for filter
     * @param data {Array} array with data
     * @returns Array
     */
    this.yearsArrayForFilter = function (data) {
      var i, l, arr = [];
      for (i = 0, l = data.length; i < l; i += 1) {
        arr.push({id: i, name: 'fullName' + data[i].year, year: data[i].year});
      }
      return arr;
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name listCompanyGroup
     * @description list company group
     * @param obj {Object} object
     * @returns HttpPromise
     */
    this.listCompanyGroup = function (obj) {
      return $http.get('/api/sales-plan/products/group/company?' + Tools.objectToQueryString(obj), {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
    /**
     * @memberof SalesPlanService
     * @method
     * @name listProductGroup
     * @description list product group
     * @param obj {Object} object
     * @returns HttpPromise
     */
    this.listProductGroup = function (obj) {
      return $http.get('/api/sales-plan/products/group/product?' + Tools.objectToQueryString(obj), {cache: false})
        .error(function (result) {
          console.log(result);
        });
    };
  }]);
