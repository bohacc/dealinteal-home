/*jslint node: true */
'use strict';

angular.module('crmPostgresWebApp')
  .directive('footer', function () {
    return {
      templateUrl: 'views/directives/d_footer.html',
      restrict: 'E'
    };
  });
