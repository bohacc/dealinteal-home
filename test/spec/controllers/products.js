/*jslint node: true, unparam: true */
'use strict';

describe('Controller: ProductsCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var ProductsCtrl,
    scope,
    loc;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    loc = $location;
    ProductsCtrl = $controller('ProductsCtrl', {
      $scope: scope,
      initialData: {products: {}}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'doprava';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'doprava';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('něco');
  });

  it('newProduct - new product', function () {
    scope.newProduct();
    expect(loc.path()).toBe('/product');
  });

});
