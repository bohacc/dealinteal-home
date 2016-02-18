/*jslint node: true, unparam: true */
'use strict';

describe('Controller: AppointmentsCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var AppointmentsCtrl,
    scope,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    location = $location;
    AppointmentsCtrl = $controller('AppointmentsCtrl', {
      $scope: scope,
      initialData: {appointments: []}
    });
  }));

  it('setSearch', function () {
    var event = {which: 13};
    scope.searchStr = 'schůzka na slepo';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe(scope.searchStr);

    event = {which: 1};
    scope.searchStr = 'schůzka na slepo';
    scope.dataLoaderParams.searchStr = 'aa';
    scope.setSearch(event);
    expect(scope.dataLoaderParams.searchStr).toBe('aa');
  });

  it('newAppointment', function () {
    scope.newAppointment();
    expect(location.path()).toBe('/appointment');
  });

  it('getType - get filter type', function () {
    scope.dataLoaderParams.filter.type = -1;
    expect(scope.getType().ID).toBe(-1);
    expect(scope.getType().NAME).toBe('ALL');
  });

});
