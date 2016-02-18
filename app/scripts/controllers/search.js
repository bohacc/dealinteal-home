/*jslint node: true */
'use strict';

/**
 * @file SearchCtrl
 * @fileOverview Search
 */

/**
 * @namespace Search
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('SearchCtrl', ['$scope', '$route', '$translate', '$translatePartialLoader', 'CompaniesService', 'PeopleService', 'ProjectsService', 'OpportunitiesService',
    function ($scope, $route, $translate, $translatePartialLoader, CompaniesService, PeopleService, ProjectsService, OpportunitiesService) {
      // translate
      $translatePartialLoader.addPart('search');
      $translate.refresh();

      $scope.searchCode = $route.current ? $route.current.params.code : '';
      $scope.companies = [];
      $scope.people = [];
      $scope.team = [];
      $scope.opportunities = [];
      $scope.projects = [];

      /**
       * @memberof Search
       * @method
       * @name defaultFunction
       * @description search
       * @returns void
       */
      $scope.search = function () {
        $scope.searchCompanies();
        $scope.searchPeople();
        $scope.searchTeam();
        $scope.searchOpportunites();
        $scope.searchProjects();
      };

      $scope.searchCompanies = function () {
        CompaniesService.searchGlobal({str: $scope.searchCode}).then(
          function (promise) {
            $scope.companies = promise.data || [];
          }
        );
      };

      $scope.searchPeople = function () {
        PeopleService.searchGlobal({str: $scope.searchCode}).then(
          function (promise) {
            $scope.people = promise.data || [];
          }
        );
      };

      $scope.searchTeam = function () {
        PeopleService.searchGlobalTeam({str: $scope.searchCode}).then(
          function (promise) {
            $scope.team = promise.data || [];
          }
        );
      };

      $scope.searchOpportunites = function () {
        OpportunitiesService.searchGlobal({str: $scope.searchCode}).then(
          function (promise) {
            $scope.opportunities = promise.data || [];
          }
        );
      };

      $scope.searchProjects = function () {
        ProjectsService.searchGlobal({str: $scope.searchCode}).then(
          function (promise) {
            $scope.projects = promise.data || [];
          }
        );
      };

      // Run
      $scope.search();
    }]);
