/*jslint node: true, unparam: true */
'use strict';

describe('Service: AlertsService', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var alerts,
    constants,
    timeout;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (AlertsService, Constants, $timeout, $httpBackend) {
    alerts = AlertsService;
    constants = Constants;
    timeout = $timeout;
    $httpBackend.whenGET('views/login.html').respond(200, '');
  }));

  it('add - přidání zprávy', function () {
    var message = {type: constants.MESSAGE_ERROR, message: 'ERROR'};
    alerts.clear();
    alerts.add(message);
    // vložím zprávu a zkontroluju zda bude v zásobníku
    expect(alerts.get().items.length).toBe(1);

    // po skončení timeDelay se zpráva odstraní
    timeout(function () {
      expect(alerts.get().items.length).toBe(0);
    }, 11000);
    timeout.flush();

    message = {type: constants.MESSAGE_ERROR_MODAL, message: 'ERROR'};
    alerts.clear();
    alerts.add(message);
    // vložím modální zprávu a zkontroluju zda bude v zásobníku
    expect(alerts.getModal().length).toBe(1);
  });

  it('get - získání zpráv', function () {
    var message = {type: constants.MESSAGE_ERROR, message: 'ERROR'};
    alerts.clear();
    alerts.add(message);
    // vložím zprávu a zkontroluju zda bude v zásobníku
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].type).toBe(constants.MESSAGE_ERROR);
  });

  it('getModal - získání zpráv', function () {
    var message = {type: constants.MESSAGE_ERROR_MODAL, message: 'ERROR'};
    alerts.clear();
    alerts.add(message);
    // vložím zprávu a zkontroluju zda bude v zásobníku
    expect(alerts.getModal().length).toBe(1);
    expect(alerts.getModal()[0].type).toBe(constants.MESSAGE_ERROR_MODAL);
  });

  it('deleteType - odstranění zpráv typu x', function () {
    var message = {type: constants.MESSAGE_ERROR, message: 'ERROR'};
    alerts.clear();
    alerts.add(message);
    // vložím zprávu a zkontroluju zda bude v zásobníku
    expect(alerts.get().items.length).toBe(1);

    message = {type: constants.MESSAGE_SUCCESS, message: 'SUCCESS'};
    alerts.add(message);
    // vložím zprávu druh0ho typu a zkontroluju zda bude v zásobníku
    expect(alerts.get().items.length).toBe(2);

    alerts.deleteType(constants.MESSAGE_ERROR);
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].type).toBe(constants.MESSAGE_SUCCESS);

    // po skončení timeDelay se zprávy odstraní
    timeout(function () {
      expect(alerts.get().items.length).toBe(0);
    }, 11000);
    timeout.flush();
  });

  it('prepareMessage - zpracování zprávy z responsu(Promise)', function () {
    var promise = {data: {message: {type: constants.MESSAGE_ERROR_MODAL, msg: 'ERROR'}}},
      infoError = 'TEST ERROR',
      infoSuccess = 'TEST SUCCESS',
      result;
    alerts.clear();
    // MODAL - pustím prepare Promisu, zkontroluju zda zpráva bude v zásobníku ve správném tvaru
    result = alerts.prepareMessage(promise, infoSuccess, infoError);
    // pokud mám pouze jednu chybovou zprávu typu MESSAGE_ERROR_MODAL vrátí se isSuccess FALSE
    expect(result).toBe(false);
    // kontrola zda existuje v zásobníku
    expect(alerts.getModal().length).toBe(1);
    // kontrola hodnot ve zprávě
    expect(alerts.getModal()[0].type).toBe(constants.MESSAGE_ERROR_MODAL);
    expect(alerts.getModal()[0].message).toBe(infoError);
    expect(alerts.getModal()[0].message2).toBe('(ERROR)');
    expect(alerts.getModal()[0].title).toBe('ERROR');

    promise = {
      data: [
        {message: {type: constants.MESSAGE_ERROR_MODAL, msg: 'ERROR'}},
        {message: {type: constants.MESSAGE_ERROR_MODAL, msg: 'ERROR2'}},
        {message: {type: constants.MESSAGE_ERROR_MODAL, msg: 'ERROR3'}}
      ]
    };
    alerts.clear();
    result = alerts.prepareMessage(promise, infoSuccess, infoError);
    // pokud mám více zpráv v responsu, ale některé jsou typu MESSAGE_ERROR_MODAL isSuccess vrátí FALSE
    expect(result).toBe(false);
    expect(alerts.getModal()[0].type).toBe(constants.MESSAGE_ERROR_MODAL);
    expect(alerts.getModal()[0].messages.length).toBe(4); // vloží se tři mnou nadefinované zprávy + jedna jako hlavička
    expect(alerts.getModal()[0].title).toBe('ERROR');

    promise = {
      data: [
        {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS'}},
        {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS2'}},
        {message: {type: constants.MESSAGE_SUCCESS, msg: 'SUCCESS3'}}
      ]
    };
    alerts.clear();
    result = alerts.prepareMessage(promise, infoSuccess, infoError);
    // pokud mám více zpráv v responsu, žádné nejsou typu MESSAGE_ERROR_MODAL isSuccess vrátí TRUE
    expect(result).toBe(true);
    expect(alerts.get().items[0].type).toBe(constants.MESSAGE_SUCCESS);
    expect(alerts.get().items[0].message).toBe(infoSuccess);
  });

  it('clear - promazání zásobníků zpráv', function () {
    alerts.clear();
    expect(alerts.get().items.length).toBe(0);
    expect(alerts.getModal().length).toBe(0);
    alerts.add({type: constants.MESSAGE_ERROR, message: 'ERROR'});
    alerts.add({type: constants.MESSAGE_ERROR_MODAL, message: 'ERROR'});
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.getModal().length).toBe(1);
    alerts.clear();
    expect(alerts.get().items.length).toBe(0);
    expect(alerts.getModal().length).toBe(0);
  });
});
