/*jslint node: true */
'use strict';

/**
 * @file Projects
 * @fileOverview ProjectsCtrl
 */

/**
 * @namespace ProjectsCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('ProjectsCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'ProjectsService', 'initialData',
    function ($scope, $location, $translate, $translatePartialLoader, ProjectsService, initialData) {
      $translatePartialLoader.addPart('projects');
      $translate.refresh();

      $scope.projects = initialData.projects || [];

      $scope.searchStr = '';
      $scope.dataLoaderParams = {
        sortField: 'subject',
        sortDirection: 'asc'
      };
      $scope.infoPaging = {};

      /**
       * @memberof ProjectsCtrl
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
       * @memberof ProjectsCtrl
       * @method
       * @name newProject
       * @description show new project page
       * @returns void
       */
      $scope.newProject = function () {
        $location.path('/project');
      };

      // list
      $scope.dataLoader = ProjectsService.list;

    }]);
