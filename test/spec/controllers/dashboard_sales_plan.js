'use strict';

describe('Controller: DashboardSalesPlanCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var DashboardSalesPlanCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DashboardSalesPlanCtrl = $controller('DashboardSalesPlanCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    //expect(scope.awesomeThings.length).toBe(3);
  });
});
