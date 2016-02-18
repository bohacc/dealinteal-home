'use strict';

describe('Directive: dashboardTasks', function () {

  // load the directive's module
  beforeEach(module('crmPostgresWebApp'));

  var location,
    messengerService,
    constants,
    DashboardTaskCtrl,
    scope;

  beforeEach(inject(function ($controller, $rootScope, $location, MessengerService, Constants) {
    scope = $rootScope.$new();
    location = $location;
    constants = Constants;
    messengerService = MessengerService;
    DashboardTaskCtrl = $controller('DashboardTaskCtrl', {
      $scope: scope
    });
  }));

  it('should make hidden element visible', inject(function () {
    /*scope.showAll(0);
    expect(location.path()).toBe('/tasks');
    expect(messengerService.getData()).toEqual({type: constants.TASK.FILTER.OLD});

    scope.showAll(1);
    expect(location.path()).toBe('/tasks');
    expect(messengerService.getData()).toEqual({type: constants.TASK.FILTER.TODAY});

    scope.showAll(2);
    expect(location.path()).toBe('/tasks');
    expect(messengerService.getData()).toEqual({type: constants.TASK.FILTER.TOMORROW});

    scope.showAll(3);
    expect(location.path()).toBe('/tasks');
    expect(messengerService.getData()).toEqual({type: constants.TASK.FILTER.NEW});*/
  }));
});
