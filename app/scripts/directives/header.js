/*jslint node: true, unparam: true */
'use strict';

/**
 * @file header
 * @fileOverview header
 */

/**
 * @namespace header
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .directive('header', function () {
    return {
      templateUrl: 'views/directives/d_header.html',
      restrict: 'E',
      controller: ['$scope', '$http', '$location', 'AuthenticationService', 'MessengerService', 'AlertsService', 'Constants',
        function ($scope, $http, $location, auth, MessengerService, AlertsService, Constants) {
          $scope.pagesWithoutHeader = ['/login', '/'];
          $scope.modules = {
            home: [
              {name: 'HOME2', redirect: '/home'}
            ],
            contacts: [
              {name: 'COMPANIES', redirect: '/companies'},
              {name: 'PEOPLE', redirect: '/people'}
            ],
            activity: [
              {name: 'AGENDA', redirect: '/agenda'},
              {name: 'CALENDAR', redirect: '/calendar'},
              {name: 'APPOINTMENTS', redirect: '/appointments'},
              {name: 'TASKS', redirect: '/tasks'},
              {name: 'REMINDERS', redirect: '/reminders'}
            ],
            pipeline: [
              {name: 'OPPORTUNITIES', redirect: '/opportunities'},
              {name: 'SALES_PIPELINE', redirect: '/sales-pipeline'}
            ],
            sales: [
              {name: 'SALES_PLAN', redirect: '/sales-plan'},
              {name: 'SALES', redirect: '/sales'},
              {name: 'PRODUCTS', redirect: '/products'},
              {name: 'PROJECTS', redirect: '/projects'},
              {name: 'CONTRACTS', redirect: '/contracts'}
            ],
            team: [
              {name: 'TEAM_MEMBERS', redirect: '/team-members'}
            ]
          };
          $scope.logout = auth.logout;
          $scope.headerTitle = '';
          $scope.hideMenu = false;

          /**
           * @memberof ContactCtrl
           * @method
           * @name setShowMenu
           * @description show menu for XS
           * @returns void
           */
          $scope.setShowMenu = function () {
            $scope.hideMenu = false;
          };

          /**
           * @memberof ContactCtrl
           * @method
           * @name setHideMenu
           * @description hide menu for XS
           * @returns void
           */
          $scope.setHideMenu = function () {
            $scope.hideMenu = true;
          };

          /**
           * @memberof ContactCtrl
           * @method
           * @name activeMenuItem
           * @description return true for redirect is in array
           * @returns Boolean
           */
          $scope.activeMenuItem = function (array) {
            var tmp = false, i, l;
            for (i = 0, l = array.length; i < l; i += 1) {
              if ($location.path() === array[i].redirect) {
                tmp = true;
                break;
              }
            }
            return tmp;
          };

          /**
           * @memberof ContactCtrl
           * @method
           * @name enterSearch
           * @description enter in search input
           * @returns void
           */
          $scope.enterSearch = function (event) {
            if (event.which === 13) {
              $scope.search();
            }
          };

          /**
           * @memberof ContactCtrl
           * @method
           * @name search
           * @description global search
           * @returns void
           */
          $scope.search = function () {
            if ($scope.searchCode.length > 1) {
              MessengerService.clear();
              MessengerService.setData({searchCode: $scope.searchCode});
              $location.path('/search/' + encodeURIComponent($scope.searchCode) + '/' + Math.random());
            } else {
              AlertsService.add({type: Constants.MESSAGE_WARNING, messages: [{message: 'SEARCH_STR_LENGTH'}]});
            }
          };

          $scope.pageWithoutHeader = function () {
            return $scope.pagesWithoutHeader.indexOf($location.path()) > -1;
          };
        }]
    };
  });
