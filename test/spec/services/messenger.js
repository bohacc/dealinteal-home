/*jslint node: true, unparam: true */
'use strict';

describe('Service: MessengerService', function () {

  // load the service's module
  beforeEach(module('crmPostgresWebApp'));

  var messenger;

  beforeEach(inject(function (MessengerService) {
    messenger = MessengerService;
  }));

  it('getData - vrátí zadaný objekt', function () {
    var obj = {a: 'test', b: 1}, obj2 = {}, obj3 = {a: 'test', b: 1};
    messenger.clear();
    messenger.setData(obj);
    obj2 = messenger.getData();

    expect(obj).not.toBe(obj3);
    expect(obj).toEqual(obj2);
  });

});
