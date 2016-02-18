/*jslint node: true, unparam: true */
'use strict';

describe('Service: Admin', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var logData,
    LogDataService,
    httpBackend,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, $rootScope, LogData) {
    LogDataService = LogData;
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    $httpBackend.whenGET('views/login.html').respond(200, '');
    logData = LogDataService.getInstance();
  }));

  it('default - nastavení výchozího stavu pro sledování změn', function () {
    var formObj, log;
    formObj = {companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt
    expect(log.oldObject.companyName).toBe('TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');
    expect(log.changes.isChanged).toBe(false);

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = logData.getChanges();
    // provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);

    logData.clear();
    // metodou clear jsem vyrusil zmeny tim, ze jsem je predal do objektu pro puvodni(vychozi) stav, stary objekt tedy nyni obsahuje zmeny, isChanged je FALSE
    expect(log.oldObject.companyName).toBe('TEST TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');
    expect(log.changes.isChanged).toBe(false);

    logData.default({companyName: 'TEST', companyPhone: '777846191'});
    log = logData.getChanges();
    // metodat default prenastavi vychozi objekt, mela by tam byt tedy opet puvodni hodnota jako na zacatku
    expect(log.oldObject.companyName).toBe('TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');
  });

  it('clear - změny uloží do výchozího stavu a changes nastaví na FALSE', function () {
    var formObj, log;
    formObj = {companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt
    expect(log.oldObject.companyName).toBe('TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = logData.getChanges();
    // provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);

    logData.clear();
    log = logData.getChanges();
    // metodou clear jsem vyrusil zmeny tim, ze jsem je predal do objektu pro puvodni(vychozi) stav, stary objekt tedy nyni obsahuje zmeny, isChanged je FALSE
    expect(log.oldObject.companyName).toBe('TEST TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');
    expect(log.changes.isChanged).toBe(false);
  });

  it('addChanges - přidá změny do newObject', function () {
    var formObj, log;
    formObj = {companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt
    expect(log.oldObject.companyName).toBe('TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');

    logData.addChanges({companyName: 'TEST TEST', companyPhone: '777846191'});
    log = logData.getChanges();
    // pridal jsem zmenu, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');

    logData.clear();
    log = logData.getChanges();
    // metodou clear jsem vyrusil zmeny tim, ze jsem je predal do objektu pro puvodni(vychozi) stav, stary objekt tedy nyni obsahuje zmeny, isChanged je FALSE
    expect(log.oldObject.companyName).toBe('TEST TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');
  });

  it('init - inicializace sledovani zmen', function () {
    var formObj, log;
    formObj = {companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt, zkontroluju objekty po initu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(JSON.stringify(log.newObject)).toBe('{}');
    expect(log.logObject.table).toBe('TEST');

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = logData.getChanges();
    // zkontroluju jestli mi to hlida zmeny, provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);
  });

  it('save - ulozeni zmen', function () {
    var formObj, log;
    formObj = {id: 1, companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt, zkontroluju objekty po initu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(JSON.stringify(log.newObject)).toBe('{}');
    expect(log.logObject.table).toBe('TEST');

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = logData.getChanges();
    // zkontroluju jestli mi to hlida zmeny, provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);

    logData.save({method: 'DELETE'});
    log = logData.getChanges();
    expect(JSON.stringify(log.logObject.old)).toBe('{"companyName":"TEST"}');
    expect(JSON.stringify(log.logObject.new)).toBe('{}');
    expect(log.logObject.method).toBe('DELETE');
    expect(log.logObject.id).toBe(1);

    logData.save({method: 'POST'});
    log = logData.getChanges();
    expect(JSON.stringify(log.logObject.old)).toBe('{"companyName":"TEST"}');
    expect(JSON.stringify(log.logObject.new)).toBe('{"companyName":"TEST TEST"}');
    expect(log.logObject.method).toBe('POST');
    expect(log.logObject.id).toBe(1);
  });

  it('getChanges - ziskani odkazu na objekty old, new, log, changes', function () {
    var formObj, log;
    formObj = {id: 1, companyName: 'TEST', companyPhone: '777846191'};
    scope.company = formObj;
    logData.init(scope, 'company', 'TEST');
    scope.$apply();
    log = logData.getChanges();
    // nastavil jsem hlidani zmen a definoval objekt, zkontroluju objekty po initu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(JSON.stringify(log.newObject)).toBe('{}');
    expect(log.logObject.table).toBe('TEST');
    expect(log.changes.isChanged).toBe(false);

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = logData.getChanges();
    // zkontroluju jestli mi to hlida zmeny, provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);

    logData.save({method: 'POST'});
    log = logData.getChanges();
    expect(JSON.stringify(log.logObject.old)).toBe('{"companyName":"TEST"}');
    expect(JSON.stringify(log.logObject.new)).toBe('{"companyName":"TEST TEST"}');
    expect(log.logObject.method).toBe('POST');
    expect(log.logObject.id).toBe(1);
  });

  it('clearPart - nastavení/promazání změn pouze jedné vlastnosti', function () {

  });
});
