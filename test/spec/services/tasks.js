'use strict';

describe('Service: tasks', function () {

  // load the service's module
  beforeEach(module('crmPostgresWebApp'));

  // instantiate service
  var tasks;
  beforeEach(inject(function (TasksService) {
    tasks = TasksService;
  }));

  it('should do something', function () {
    //expect(!!tasks).toBe(true);
  });

});
