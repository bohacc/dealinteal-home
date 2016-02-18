/*jslint node: true, unparam: true*/
'use strict';

angular.module('crmPostgresWebApp')
  .directive('paginationNotia', ['$timeout', 'usSpinnerService', function ($timeout, usSpinnerService) {
    return {
      templateUrl: 'views/directives/d_pagination.html',
      restrict: 'E',
      scope: {
        loadData: '=',
        loadDataParams: '=',
        loadDataParamsRuntime: '=',
        listData: '=',
        buttonAll: '=',
        amount: '=',
        info: '=',
        refresh: '=?',
        loadDataCallback: '=?'
      },
      link: function (scope, element, attrs) {
        if (scope.info) {
          scope.info.inProcess = false;
          scope.info.summary = {};
          scope.info.inProcessCount = false;
        } else {
          scope.info = {inProcess: false, summary: {}, inProcessCount: false};
        }

        scope.getPagingDefault = function () {
          var tmp = {
            page: 1,
            amount: (scope.amount || '10'),
            count: 0,
            pageCount: 1
          };
          //scope.info = tmp;
          return tmp;
        };

        scope.paging = scope.getPagingDefault();

        scope.getLoadDataParams = function (obj) {
          var params = {};
          $.extend(params, scope.paging);
          $.extend(params, scope.loadDataParams);
          $.extend(params, scope.loadDataParamsRuntime);
          $.extend(params, obj);
          return params;
        };

        scope.loadCount = function () {
          if (scope.paging.count === 0) {
            scope.info.inProcessCount = true;
            scope.startSpin();
            scope.loadData(scope.getLoadDataParams({loadCount: 1})).then(
              function (promise) {
                scope.info.inProcessCount = false;
                scope.stopSpin();
                if (promise.data) {
                  scope.paging.count = parseInt(promise.data.count, 10);
                  scope.paging.pageCount = Math.ceil(parseInt(promise.data.count, 10) / scope.paging.amount);
                  scope.info.summary = promise.data;
                }
              },
              function () {
                scope.info.inProcessCount = false;
              }
            );
          }
        };

        scope.load = function (loadCount) {
          if (scope.info.inProcess) {
            return;
          }
          scope.info.inProcess = true;
          scope.loadData(scope.getLoadDataParams()).then(
            function (promise) {
              scope.info.inProcess = false;
              scope.listData.splice(0, scope.listData.length);
              if (promise.data && promise.data.length > 0 && promise.data.map) {
                promise.data.map(function (el) {
                  scope.listData.push(el);
                });
              }
              if (scope.loadDataCallback) {
                scope.loadDataCallback();
              }
            },
            function () {
              scope.info.inProcessCount = false;
            }
          );
          if (loadCount) {
            scope.paging = scope.getPagingDefault();
            scope.loadCount();
          }
        };

        scope.next = function () {
          if (scope.info.inProcess) {
            return;
          }
          if (scope.paging.pageCount > scope.paging.page) {
            scope.paging.page += 1;
            scope.load();
          }
        };

        scope.prior = function (enable) {
          if (scope.info.inProcess) {
            return;
          }
          if (scope.paging.page > 1) {
            scope.paging.page -= 1;
            scope.load();
          }
        };

        scope.all = function () {
          if (scope.paging.pageCount > 1) {
            scope.paging.page = 1;
            scope.paging.amount = 9999;
            scope.paging.pageCount = 1;
            scope.load();
          }
        };

        scope.startSpin = function () {
          usSpinnerService.spin('spinner-paging');
        };

        scope.stopSpin = function () {
          usSpinnerService.stop('spinner-paging');
        };

        // watchers
        scope.timerLoadData = null;
        scope.$watch('loadDataParams', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            // Pokud bude vice promennych, ktere filtruji data, je treba to tady udelat univarzalne
            var loadCount = newValue.searchStr !== oldValue.searchStr || JSON.stringify(newValue.filter) !== JSON.stringify(oldValue.filter);

            $timeout.cancel(scope.timerLoadData);
            scope.timerLoadData = $timeout(function () {
              scope.load(loadCount || (scope.loadDataParams && scope.loadDataParams.loadCount));
            }, 500);
          }
        }, true);

        scope.refresh = function () {
          scope.load(true);
        };

        // Run
        scope.load(true);
      }
    };
  }]);
