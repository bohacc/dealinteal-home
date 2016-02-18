/*jslint node: true */
'use strict';

/**
 * @file changelogs
 * @fileOverview ChangelogsCtrl
 */

/**
 * @namespace ChangelogsCtrl
 * @author Martin Boh8č
 */

angular.module('crmPostgresWebApp')
  .controller('ChangelogsCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'ChangelogsService', 'Constants', 'initialData',
    function ($scope, $location, $translate, $translatePartialLoader, ChangelogsService, Constants, initialData) {
      // translate
      $translatePartialLoader.addPart('changelogs');
      $translate.refresh();

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        sortField: 'table_name',
        sortDirection: 'asc'
      };
      $scope.infoPaging = {};

      $scope.showDetail = function (obj) {
        if (obj.pk && obj.table_name && Constants.ROUTES[obj.table_name]) {
          $location.path(Constants.ROUTES[obj.table_name] + obj.pk);
        }
      };

      // list
      $scope.changelogs = initialData.changelogs || [];
      $scope.dataLoader = ChangelogsService.list;
    }]);
