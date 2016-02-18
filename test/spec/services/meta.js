/*jslint node: true, unparam: true */
'use strict';

describe('Service: Meta', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var meta,
    httpBackend,
    rootScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, Meta, $rootScope) {
    meta = Meta;
    httpBackend = $httpBackend;
    rootScope = $rootScope;
    $httpBackend.whenGET('views/login.html').respond(200, '');
  }));

  it('setMetaInformations - informace o aplikaci a uživateli, nastavení', function () {
    httpBackend.expectGET('/api/user').respond(200, {loginName: 'BOHAC', language: 'cs-cz'});
    meta.setMetaInformations();
    httpBackend.flush();
    expect(rootScope.meta.title).toBe('BOHAC');
    expect(rootScope.meta.language).toBe('cs-cz');
  });
});
