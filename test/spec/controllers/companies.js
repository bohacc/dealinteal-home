/*jslint node: true, unparam: true */
'use strict';

describe('Controller: CompaniesCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var CompaniesCtrl,
    scope,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    location = $location;
    CompaniesCtrl = $controller('CompaniesCtrl', {
      $scope: scope,
      companies: {}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'Notia';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'Notia';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('něco');
  });

  it('newCompany', function () {
    scope.newCompany();
    expect(location.path()).toBe('/company');
  });

  it('getType - get filter type', function () {
    scope.dataLoaderParams.filter.type = -1;
    expect(scope.getType().ID).toBe(-1);
    expect(scope.getType().NAME).toBe('ALL');
  });
});
