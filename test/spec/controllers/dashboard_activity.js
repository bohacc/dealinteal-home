'use strict';

describe('Directive: dashboardActivity', function () {

  // load the directive's module
  beforeEach(module('crmPostgresWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dashboard-activity></dashboard-activity>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the dashboardActivity directive');
  }));
});
