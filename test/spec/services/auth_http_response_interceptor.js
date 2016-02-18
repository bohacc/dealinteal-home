/*jslint node: true, unparam: true */
'use strict';

describe('Service: authHttpResponseInterceptor', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var httpInterceptor,
    alerts,
    location,
    constants,
    q;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($location, $q, authHttpResponseInterceptor, AlertsService, Constants) {
    httpInterceptor = authHttpResponseInterceptor;
    location = $location;
    alerts = AlertsService;
    constants = Constants;
    q = $q;
  }));

  it('response - kontrola zpracování response', function () {
    var response = {status: 401}, result;
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.response(response);
    expect(result).toEqual(response);
    expect(location.path()).toEqual('/login');
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].type).toEqual(constants.MESSAGE_ERROR);
    expect(alerts.get().items[0].message).toEqual(constants.MESSAGE_CONNECTION_LOST);

    response = {status: 200};
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.response(response);
    expect(result).toEqual(response);
    expect(location.path()).toEqual('/home');
    expect(alerts.get().items.length).toBe(0);
  });

  it('responseError - kontrola zpracování responseError', function () {
    var response = {status: 401}, result;
    // ERROR
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.responseError(response);
    expect(JSON.stringify(result)).toBe(JSON.stringify(q.reject(response)));
    expect(location.path()).toEqual('/login');
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].type).toEqual(constants.MESSAGE_ERROR);
    expect(alerts.get().items[0].message).toEqual(constants.MESSAGE_CONNECTION_LOST);

    response = {status: 200};
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.responseError(response);
    expect(JSON.stringify(result)).toBe(JSON.stringify(q.reject(response)));
    expect(location.path()).toEqual('/home');
    expect(alerts.get().items.length).toBe(0);

    // SUCCESS
    response = {status: 401};
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.response(response);
    expect(result).toBe(result);
    expect(location.path()).toEqual('/login');
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].type).toEqual(constants.MESSAGE_ERROR);
    expect(alerts.get().items[0].message).toEqual(constants.MESSAGE_CONNECTION_LOST);

    response = {status: 200};
    location.path('/home');
    alerts.clear();
    result = httpInterceptor.response(response);
    expect(result).toBe(response);
    expect(location.path()).toEqual('/home');
    expect(alerts.get().items.length).toBe(0);
  });
});
