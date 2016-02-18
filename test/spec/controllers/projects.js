/*jslint node: true, unparam: true */
'use strict';

describe('Controller: ProjectsCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var ProjectsCtrl,
    scope,
    loc;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    loc = $location;
    ProjectsCtrl = $controller('ProjectsCtrl', {
      $scope: scope,
      initialData: {projects: []}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'Va�en�';
    scope.dataLoaderParams.searchStr = 'n�co';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'Va�en';
    scope.dataLoaderParams.searchStr = 'n�co';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('n�co');
  });

  it('newProject - new project', function () {
    scope.newProject();
    expect(loc.path()).toBe('/project');
  });

});
