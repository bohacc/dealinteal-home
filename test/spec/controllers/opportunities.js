/*jslint node: true, unparam: true */
'use strict';

describe('Controller: OpportunitiesCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var OpportunitiesCtrl,
    scope,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    location = $location;
    OpportunitiesCtrl = $controller('OpportunitiesCtrl', {
      $scope: scope,
      initialData: {opportunities: []}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'test';
    scope.dataLoaderParams.searchStr = 'aa';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'test';
    scope.dataLoaderParams.searchStr = 'aa';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('aa');
  });

  it('newOpportunity', function () {
    scope.newOpportunity();
    expect(location.path()).toBe('/opportunity');
  });

  it('viewSalesPipeline', function () {
    scope.viewSalesPipeline();
    expect(location.path()).toBe('/sales-pipeline');
  });
});
