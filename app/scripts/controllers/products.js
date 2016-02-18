/*jslint node: true */
'use strict';

/**
 * @file Products
 * @fileOverview ProductsCtrl
 */

/**
 * @namespace ProductsCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('ProductsCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'ProductsService', 'initialData',
    function ($scope, $location, $translate, $translatePartialLoader, ProductsService, initialData) {
      $translatePartialLoader.addPart('products');
      $translate.refresh();

      $scope.products = initialData.products || [];

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        sortField: 'name',
        sortDirection: 'asc'
      };
      $scope.infoPaging = {};

      /**
       * @memberof ProductsCtrl
       * @method
       * @name setSearch
       * @description set search after enter
       * @param event {Object} handle for DOM event
       * @returns void
       */
      $scope.setSearch = function (event) {
        if (event.which === 13) {
          $scope.dataLoaderParams.searchStr = $scope.searchStr;
        }
      };

      /**
       * @memberof ProductsCtrl
       * @method
       * @name newProduct
       * @description show new product page
       * @returns void
       */
      $scope.newProduct = function () {
        $location.path('/product');
      };

      // list
      $scope.dataLoader = ProductsService.list;

    }]);
