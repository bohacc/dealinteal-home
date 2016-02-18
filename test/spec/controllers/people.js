/*jslint node: true, unparam: true */
'use strict';

describe('Controller: PeopleCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var PeopleCtrl,
    scope,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    location = $location;
    PeopleCtrl = $controller('PeopleCtrl', {
      $scope: scope,
      initialData: {people: [], teamMember: 0},
      actionButtons: {}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'test';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'test';
    scope.dataLoaderParams.searchStr = 'aa';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('aa');
  });

  it('newPerson', function () {
    scope.teamMember = 0;
    scope.newPerson();
    expect(location.path()).toBe('/person');

    scope.teamMember = 1;
    scope.newPerson();
    expect(location.path()).toBe('/team-member');
  });

  it('getType - get filter type', function () {
    scope.dataLoaderParams.filter.type = -1;
    expect(scope.getType().ID).toBe(-1);
    expect(scope.getType().NAME).toBe('ALL');
  });

});
