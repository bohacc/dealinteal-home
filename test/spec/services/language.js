/*jslint node: true */
'use strict';

describe('Service: Language', function () {

  // load the service's module
  beforeEach(module('crmPostgresWebApp'));

  // instantiate service
  var language;
  beforeEach(inject(function (Language) {
    language = Language;
  }));

  it('getLanguage - ziskani nastaveni language', function () {
    expect(language.getLanguage()).toBe(null);
    language.setLanguage('xx-xx');
    expect(language.getLanguage()).toBe('xx-xx');
  });

  it('setLanguage - nastaveni language', function () {
    expect(language.getLanguage()).toBe(null);
    language.setLanguage('xx-xx');
    expect(language.getLanguage()).toBe('xx-xx');
  });

});
