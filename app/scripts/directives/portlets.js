'use strict';

angular.module('crmPostgresWebApp')
  .directive('portlets', function ($compile, $http) {
    return {
      template: '',
      restrict: 'E',
      link: function(scope, element, attrs){
          $http.post('/test');
          var contentTr = angular.element('<portlet_reservation_office></portlet_reservation_office>');
          contentTr.insertBefore(element, contentTr.nextSibling);
          $compile(contentTr)(scope);
      }
    };
  });
