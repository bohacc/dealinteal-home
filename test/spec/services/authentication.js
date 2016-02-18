/*jslint node: true, unparam: true */
'use strict';

describe('Service: AuthenticationService', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var auth,
    httpBackend,
    location;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, $location, AuthenticationService) {
    auth = AuthenticationService;
    httpBackend = $httpBackend;
    location = $location;
    $httpBackend.whenGET('views/login.html').respond(200, '');
  }));

  it('logout - odhlášení', function () {
    location.path('/home');
    httpBackend.expectGET('/api/logout').respond(200, function (method, url, data, headers) {
      return {logout: true};
    });
    auth.logout();
    httpBackend.flush();
    expect(location.path()).toBe('/login');
  });

  it('login - přihlášení', function () {
    var tmp = 0, callback1, callback2, callback3;
    callback1 = function () {
      tmp = 1;
    };
    callback2 = function () {
      tmp = 2;
    };
    callback3 = function () {
      tmp = 3;
    };
    httpBackend.expectPOST('/api/login').respond(200, {success: true});
    auth.login({}, callback1, callback2, callback3);
    httpBackend.flush();
    // success
    expect(tmp).toBe(1);

    httpBackend.expectPOST('/api/login').respond(200, {success: false});
    auth.login({}, callback1, callback2, callback3);
    httpBackend.flush();
    // failed
    expect(tmp).toBe(2);

    httpBackend.expectPOST('/api/login').respond(500, {success: false});
    auth.login({}, callback1, callback2, callback3);
    httpBackend.flush();
    // error
    expect(tmp).toBe(3);
  });
});
