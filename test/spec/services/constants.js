/*jslint node: true, unparam: true */
'use strict';

describe('Service: Constants', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var constants;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (Constants) {
    constants = Constants;
  }));

  it('LANGUAGE_KEYS - kódy lokalizace', function () {
    expect(constants.LANGUAGE_KEYS[0]).toBe('cs-cz');
    expect(constants.LANGUAGE_KEYS[1]).toBe('en-us');
    expect(constants.LANGUAGE_KEYS[2]).toBe('sk-sk');
    expect(constants.CRUD_POST).toBe('POST');
    expect(constants.CRUD_PUT).toBe('PUT');
    expect(constants.CRUD_DELETE).toBe('DELETE');
    expect(constants.MESSAGE_INFO).toBe('INFO');
    expect(constants.MESSAGE_SUCCESS).toBe('SUCCESS');
    expect(constants.MESSAGE_WARNING).toBe('WARNING');
    expect(constants.MESSAGE_ERROR).toBe('ERROR');
    expect(constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD).toBe('WARNING_VALIDATION_BEFORE_CRUD');
    expect(constants.MESSAGE_CONNECTION_LOST).toBe('CONNECTION_LOST');
    expect(constants.MESSAGE_INFO_MODAL).toBe('INFO_MODAL');
    expect(constants.MESSAGE_SUCCESS_MODAL).toBe('SUCCESS_MODAL');
    expect(constants.MESSAGE_WARNING_MODAL).toBe('WARNING_MODAL');
    expect(constants.MESSAGE_ERROR_MODAL).toBe('ERROR_MODAL');
  });
});