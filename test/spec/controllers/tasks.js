/*jslint node: true, unparam: true */
'use strict';

describe('Controller: TasksCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var TasksCtrl,
    scope,
    loc;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    loc = $location;
    TasksCtrl = $controller('TasksCtrl', {
      $scope: scope,
      initialData: {tasks: {}}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'Test task';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'Test task';
    scope.dataLoaderParams.searchStr = 'něco';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('něco');
  });

  it('newTask - new product', function () {
    scope.newTask();
    expect(loc.path()).toBe('/task');
  });

  it('getType - get filter type', function () {
    scope.dataLoaderParams.filter.type = -1;
    expect(scope.getType().ID).toBe(-1);
    expect(scope.getType().NAME).toBe('ALL');
  });

});

