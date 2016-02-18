/*jslint node: true, unparam: true */
'use strict';

describe('Service: PageAncestor', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var pageAncestor,
    pageAncestorService,
    httpBackend,
    scope,
    rootScope,
    alerts,
    location,
    http,
    constants;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, PageAncestor, $rootScope, AlertsService, $location, $http, Constants) {
    pageAncestorService = PageAncestor;
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    rootScope = $rootScope;
    alerts = AlertsService;
    location = $location;
    http = $http;
    constants = Constants;
    httpBackend.whenGET('/api/user').respond(200, {language: 'cs-cz'});
    $httpBackend.whenGET('views/login.html').respond(200, '');
  }));

  it('init - inicializace', function () {
    var log;
    scope.form = {name: 'TEST'};
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    pageAncestor = pageAncestorService.getInstance();
    pageAncestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    scope.$apply();
    expect(typeof pageAncestor.cancel).toBe('function');
    expect(typeof pageAncestor.log).toBe('object');
    expect(typeof pageAncestor.openUrl).toBe('function');

    log = pageAncestor.log;
    expect(log.oldObject.companyName).toBe('TEST');
    expect(typeof log.newObject.companyName).toBe('undefined');

    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    log = pageAncestor.log;
    // provedl jsem zmenu v hlidanem objektu, isChanged je TRUE, stary objekt beze zmeny novy obsahuje zmenu
    expect(log.oldObject.companyName).toBe('TEST');
    //expect(log.newObject.companyName).toBe('TEST TEST');
    expect(log.changes.isChanged).toBe(true);

    expect(alerts.getModal().length).toBe(0);
    location.path('/home');
    scope.$apply();
    expect(alerts.getModal().length).toBe(1);
  });

  it('cancel - storno zmen ve sledovanem objektu', function () {
    scope.form = {name: 'TEST'};
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    pageAncestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    scope.$apply();
    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    expect(scope.company.companyName).toBe('TEST TEST');
    pageAncestor.cancel();
    expect(scope.company.companyName).toBe('TEST');
  });

  it('post - proces ulozeni do databaze', function () {
    var ancestor;
    httpBackend.expectPOST('/api/post').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    httpBackend.expectPOST('/api/log').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    // provedu inicializaci
    ancestor = pageAncestorService.getInstance();
    ancestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    // spustim proces POST
    ancestor.post(function () {
      return http.post('/api/post', {id: 1});
    });
    scope.$apply();
    // melo by to byt v procesu inProcess je TRUE
    expect(scope.inProcess).toBe(true);
    // zmeny zatim nebyly provedeny
    expect(ancestor.log.changes.isChanged).toBe(false);

    // provedu nejakou zmenu
    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    // otestuju jestli se zmeny provedly
    expect(ancestor.log.changes.isChanged).toBe(true);
    expect(ancestor.log.oldObject.companyName).toBe('TEST');
    //expect(ancestor.log.newObject.companyName).toBe('TEST TEST');

    // provede se http request
    httpBackend.flush();
    scope.$apply();
    // je konec takze inProcess ja FALSE
    expect(scope.inProcess).toBe(false);
    // sledovany objekt se pronuluje metodou clear
    expect(ancestor.log.changes.isChanged).toBe(false);
    expect(ancestor.log.oldObject.companyName).toBe('TEST TEST');
    expect(JSON.stringify(ancestor.log.newObject)).toBe('{}');
    // mela by byt ulozena success zprava do zasobniku
    expect(alerts.get().items.length).toBe(1);

    // provedu request, ktery skonci chybou
    httpBackend.expectPOST('/api/post').respond(500, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    expect(scope.inProcess).toBe(false);
    ancestor.post(function () {
      return http.post('/api/post', {id: 1});
    });
    scope.$apply();
    expect(scope.inProcess).toBe(true);
    httpBackend.flush();
    expect(scope.inProcess).toBe(false);
    // zapise se modalni zprava do zasobniku
    expect(alerts.getModal().length).toBe(1);
  });

  it('put - proces ulozeni do databaze', function () {
    var ancestor;
    httpBackend.expectPUT('/api/put').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    httpBackend.expectPOST('/api/log').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    // provedu inicializaci
    ancestor = pageAncestorService.getInstance();
    ancestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    // spustim proces POST
    ancestor.put(function () {
      return http.put('/api/put', {id: 1});
    });
    scope.$apply();
    // melo by to byt v procesu inProcess je TRUE
    expect(scope.inProcess).toBe(true);
    // zmeny zatim nebyly provedeny
    expect(ancestor.log.changes.isChanged).toBe(false);

    // provedu nejakou zmenu
    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    // otestuju jestli se zmeny provedly
    expect(ancestor.log.changes.isChanged).toBe(true);
    expect(ancestor.log.oldObject.companyName).toBe('TEST');
    //expect(ancestor.log.newObject.companyName).toBe('TEST TEST');

    // provede se http request
    httpBackend.flush();
    scope.$apply();
    // je konec takze inProcess ja FALSE
    expect(scope.inProcess).toBe(false);
    // sledovany objekt se pronuluje metodou clear
    expect(ancestor.log.changes.isChanged).toBe(false);
    expect(ancestor.log.oldObject.companyName).toBe('TEST TEST');
    expect(JSON.stringify(ancestor.log.newObject)).toBe('{}');
    // mela by byt ulozena success zprava do zasobniku
    expect(alerts.get().items.length).toBe(1);

    // provedu request, ktery skonci chybou
    httpBackend.expectPUT('/api/put').respond(500, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    expect(scope.inProcess).toBe(false);
    ancestor.put(function () {
      return http.put('/api/put', {id: 1});
    });
    scope.$apply();
    expect(scope.inProcess).toBe(true);
    httpBackend.flush();
    expect(scope.inProcess).toBe(false);
    // zapise se modalni zprava do zasobniku
    expect(alerts.getModal().length).toBe(1);
  });

  it('del - proces ulozeni do databaze', function () {
    var ancestor;
    httpBackend.expectDELETE('/api/delete').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    httpBackend.whenPOST('/api/log').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    alerts.clear();
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    // provedu inicializaci
    ancestor = pageAncestorService.getInstance();
    ancestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    scope.$apply();
    // zmeny zatim nebyly provedeny
    expect(ancestor.log.changes.isChanged).toBe(false);

    // provedu nejakou zmenu
    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    // otestuju jestli se zmeny provedly
    expect(ancestor.log.changes.isChanged).toBe(true);
    expect(ancestor.log.oldObject.companyName).toBe('TEST');
    //expect(ancestor.log.newObject.companyName).toBe('TEST TEST');

    // spustim proces POST
    ancestor.del(function () {
      return http.delete('/api/delete', {id: 1});
    });
    scope.$apply();
    // mela by se zobraziz zprava na potvrzeni smazani zaznamu
    expect(alerts.getModal().length).toBe(1);
    expect(alerts.getModal()[0].type).toBe(constants.MESSAGE_WARNING_MODAL);
    // melo by to byt v procesu inProcess je TRUE
    expect(scope.inProcess).toBe(true);
    // kliknu na tlacitko OK smazat
    alerts.getModal()[0].buttons[0].onClick();
    // provede se http request
    httpBackend.flush();
    scope.$apply();
    // je konec takze inProcess ja FALSE
    expect(scope.inProcess).toBe(false);
    // sledovany objekt old nastavi podle new pomoci fce default
    expect(ancestor.log.changes.isChanged).toBe(true);
    expect(ancestor.log.oldObject.companyName).toBe('TEST TEST');
    //expect(ancestor.log.newObject.companyName).toBe('TEST TEST');
    expect(JSON.stringify(ancestor.log.oldObject)).toBe('{"companyName":"TEST TEST","companyPhone":"777846191"}');
    //expect(JSON.stringify(ancestor.log.newObject)).toBe('{"companyName":"TEST TEST","companyPhone":"777846191"}');
    // mela by byt ulozena success zprava do zasobniku
    expect(alerts.get().items.length).toBe(1);

    // provedu request, ktery skonci chybou
    alerts.clear();
    httpBackend.expectDELETE('/api/delete').respond(500, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    expect(scope.inProcess).toBe(false);
    ancestor.del(function () {
      return http.delete('/api/delete', {id: 1});
    });
    scope.$apply();
    // funkce je v procesu
    expect(scope.inProcess).toBe(true);
    // zapise se modalni zprava do zasobniku
    expect(alerts.getModal().length).toBe(1);
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    // funkce uz neni v procesu
    expect(scope.inProcess).toBe(false);
  });

  it('initFormChangeWatcher - sledovani zmen a upozorneni pred orechodem na jinou stranku', function () {
    var ancestor;
    location.path('/home');
    scope.company = {companyName: 'TEST', companyPhone: '777846191'};
    // provedu inicializaci
    ancestor = pageAncestorService.getInstance();
    ancestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    scope.$apply();
    expect(ancestor.log.changes.isChanged).toBe(false);

    // provedu nejakou zmenu
    scope.company.companyName = 'TEST TEST';
    scope.$apply();
    expect(ancestor.log.changes.isChanged).toBe(true);

    // zasobni modalnich zprav je prazdny
    expect(alerts.getModal().length).toBe(0);

    // zmenim stranku a melo by to vyvolat dialog
    location.path('/login');
    scope.$apply();
    expect(alerts.getModal().length).toBe(1);

    // po kliknuti na OK to odejde na jinou stranku a vynuluje zmeny
    alerts.getModal()[0].buttons[0].onClick();
    expect(ancestor.log.changes.isChanged).toBe(false);
    expect(location.path()).toBe('/login');
  });

  it('addAlert - pridani zpravy do zasobniku zprav', function () {
    pageAncestor = pageAncestorService.getInstance();
    pageAncestor.addAlert({type: 'WARNING_MODAL', message: 'FORM_CHANGE_ONCLOSE_CONFIRM', title: 'WARNING'});
    expect(alerts.getModal().length).toBe(1);
    pageAncestor.addAlert({type: 'WARNING', message: 'FORM_CHANGE_ONCLOSE_CONFIRM', title: 'WARNING'});
    expect(alerts.get().items.length).toBe(1);
  });

  it('confirm - check confirm', function () {
    var tmp, ancestor;
    tmp = 0;
    httpBackend.expectDELETE('/api/delete').respond(200, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    alerts.clear();
    // provedu inicializaci
    ancestor = pageAncestorService.getInstance();
    ancestor.init({scope: scope, formObject: 'company', table: 'TABLE'});
    // spustim proces DELETE
    ancestor.confirm(function () {
      tmp = 1;
      return http.delete('/api/delete', {id: 1});
    });
    // mela by se zobraziz zprava na potvrzeni smazani zaznamu
    expect(alerts.getModal().length).toBe(1);
    expect(alerts.getModal()[0].type).toBe(constants.MESSAGE_WARNING_MODAL);
    // melo by to byt v procesu inProcess je TRUE
    expect(scope.inProcess).toBe(true);
    // kliknu na tlacitko OK smazat
    alerts.getModal()[0].buttons[0].onClick();
    // provede se http request
    httpBackend.flush();
    // mela by byt ulozena success zprava do zasobniku
    expect(alerts.get().items.length).toBe(1);
    expect(tmp).toBe(1);

    // provedu request, ktery skonci chybou
    tmp = 0;
    alerts.clear();
    httpBackend.expectDELETE('/api/delete').respond(500, {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}});
    expect(scope.inProcess).toBe(false);
    ancestor.del(function () {
      return http.delete('/api/delete', {id: 1});
    });
    scope.$apply();
    // funkce je v procesu
    expect(scope.inProcess).toBe(true);
    // zapise se modalni zprava do zasobniku
    expect(alerts.getModal().length).toBe(1);
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    // funkce uz neni v procesu
    expect(scope.inProcess).toBe(false);
    expect(tmp).toBe(0);
  });
});
