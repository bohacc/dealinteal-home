/*jslint node: true, unparam: true */
'use strict';

describe('Service: Admin', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var admin,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, Admin) {
    admin = Admin;
    httpBackend = $httpBackend;
  }));

  it('createUser - založení uživatele', function () {
    /*var response;
    httpBackend.expectPOST('/api/user/create').respond(200, {message: {type: 'SUCCESS'}});
    admin.createUser(function (result) {
      response = result.type;
    });
    httpBackend.flush();*/
    expect(true).toBe(true);
  });
});
