/*jslint node: true, unparam: true */
'use strict';

describe('Service: Tools', function () {


  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  beforeEach(module('pascalprecht.translate'));

  var tools, translate, filter, constants;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($filter, Tools, $translate, Constants) {
    filter = $filter;
    tools = Tools;
    translate = $translate;
    constants = Constants;
  }));

  it('getDateTimeStr - funkce na převod datumu na řetězec ve tvaru DD.MM.YYYY HH24:MI', function () {
    var date = new Date(2014, 0, 1, 12, 0);
    expect(tools.getDateTimeStr(date)).toBe('1.1.2014 12:0');
  });

  it('setLanguage - nastavení lokalizace', function () {
    var key = 'cs-cz', numberStr;
    translate.use(key);
    translate('SEARCH').then(function (val) {
      expect(val).toBe('Hledat');
    });
    numberStr = filter('currency')(1000);
    expect(numberStr).toBe('$1,000.00');
  });

  it('createObject - vytvoření objektu podle vzoroveho objektu - nová instance', function () {
    expect(tools.createObject({id: 1, name: 'Test'})).toEqual({id: 1, name: 'Test'});
    // Date as Date
    expect(tools.createObject({id: 1, name: 'Test', d: new Date('2015-01-01T00:00:00Z')})).toEqual({id: 1, name: 'Test', d: new Date('2015-01-01T00:00:00Z')});
  });

  it('setObject - vytvoření objektu podle vzoroveho objektu, puvodni objekt zůstává', function () {
    var obj = {id: 2, name: 'Test 2'},
      newObj = {id: 1, name: 'Test'},
      tmpObj1,
      tmpObj2;
    tmpObj1 = obj;
    tmpObj2 = obj;
    tools.setObject(tmpObj1, newObj);
    expect(tmpObj1).toBe(tmpObj2);
  });

  it('getChangedProperties - nový objekt se změnami', function () {
    expect(tools.getChangedProperties({id: null, name: null}, {id: 1, name: 'Test'})).toEqual({id: 1, name: 'Test'});
  });

  it('inc - inkrement', function () {
    expect(tools.inc([1, 2, 3], 1)).toEqual([2, 3, 4]);
  });

  it('existsItemInArray - zda existuje záznam v poli', function () {
    expect(tools.existsItemInArray('Test 2', [
      {id: 1, name: 'Test'},
      {id: 2, name: 'Test 2'}
    ], 'name')).toBe(true);
  });

  it('getItemFromArray - získat záznam v poli', function () {
    expect(tools.getItemFromArray(1, 'id', [
      {id: 1, name: 'Test'},
      {id: 2, name: 'Test 2'}
    ], 'name')).toBe('Test');
  });

  it('validateEmail - validace emailu', function () {
    expect(tools.validateEmail('bohac@notia.cz')).toBe(true);
    expect(tools.validateEmail('bohac@')).toBe(false);
    expect(tools.validateEmail('bohac@.cz')).toBe(false);
    expect(tools.validateEmail('bohac@cz')).toBe(false);
    expect(tools.validateEmail('bohac')).toBe(false);
  });

  it('validatePhone - validace telefonu', function () {
    expect(tools.validatePhone('+420777846191')).toBe(true);
    expect(tools.validatePhone('+420 777 846 191')).toBe(true);
    expect(tools.validatePhone('777846191')).toBe(true);
    expect(tools.validatePhone('777 846 191')).toBe(true);
    expect(tools.validatePhone('bohac')).toBe(false);
    expect(tools.validatePhone('123')).toBe(false);
    expect(tools.validatePhone('123456')).toBe(false);
    expect(tools.validatePhone('/*-')).toBe(false);
  });

  it('validateZip - validace psč', function () {
    expect(tools.validateZip('25601')).toBe(true);
    expect(tools.validateZip('256 01')).toBe(true);
    expect(tools.validateZip('256012')).toBe(false);
    expect(tools.validateZip('2560123')).toBe(false);
    expect(tools.validateZip('256 012')).toBe(false);
    expect(tools.validateZip('256')).toBe(false);
  });

  it('deleteItemOfArrayObjects - smaže položku pole objektů', function () {
    var obj = {id: 1, name: 'Test', items: [
      {key: 'TEST'},
      {key: 'XXX'}
    ]};
    tools.deleteItemOfArrayObjects(obj, 'items', 'TEST', 'key');
    expect(obj).toEqual({id: 1, name: 'Test', items: [
      {key: 'XXX'}
    ]});
  });

  it('objectToQueryString - js objekt do qyuery stringu', function () {
    expect(tools.objectToQueryString({id: 1, name: 'Test'})).toBe('id=1&name=Test');
  });

  it('isNumber - hodnota je číslo', function () {
    expect(tools.isNumber('1')).toBe(true);
    expect(tools.isNumber('056')).toBe(true);
    expect(tools.isNumber('10')).toBe(true);
    expect(tools.isNumber('2014')).toBe(true);
    expect(tools.isNumber('10.')).toBe(false);
    expect(tools.isNumber('.5')).toBe(false);
    expect(tools.isNumber('10.5')).toBe(false);
    expect(tools.isNumber('/5')).toBe(false);
    expect(tools.isNumber('5/')).toBe(false);
    expect(tools.isNumber('54x5')).toBe(false);
    expect(tools.isNumber('k1')).toBe(false);
    expect(tools.isNumber('3365a')).toBe(false);
    expect(tools.isNumber(' ')).toBe(false);
    expect(tools.isNumber('')).toBe(false);
    expect(tools.isNumber(1)).toBe(true);
    expect(tools.isNumber(10269)).toBe(true);
  });

  it('dateSeparator - znak oddělovače datumu', function () {
    expect(tools.dateSeparator('M/d/yy')).toBe('/');
    expect(tools.dateSeparator('dd.MM.yy')).toBe('.');
  });

  it('validateDate - validace formátu datumu', function () {
    expect(tools.validateDate('1/5/10', 'M/d/yy')).toBe(true);
    expect(tools.validateDate('12.3.2010', 'DD.MM.YYYY')).toBe(true);
    expect(tools.validateDate('1/5/2010', 'M/d/yy')).toBe(false);
    expect(tools.validateDate('12/3/2010', 'M/d/yy')).toBe(false);
    expect(tools.validateDate('1/5/2010', 'dd.MM.yy')).toBe(false);
    expect(tools.validateDate('12/3/2010', 'dd.MM.yy')).toBe(false);
    expect(tools.validateDate('12/3', 'M/d/yy')).toBe(false);
    expect(tools.validateDate(' ', 'M/d/yy')).toBe(false);
    expect(tools.validateDate('', 'M/d/yy')).toBe(false);
    expect(tools.validateDate('1', 'M/d/yy')).toBe(false);
    expect(tools.validateDate('1.f.2010', 'dd.MM.yy')).toBe(false);
    expect(tools.validateDate('1..2010', 'dd.MM.yy')).toBe(false);
    expect(tools.validateDate('1.1.2', 'dd.MM.yy')).toBe(false);
    expect(tools.validateDate('1.1.201', 'dd.MM.yyyy')).toBe(false);
    expect(tools.validateDate('1.1.201', 'DD.MM.YYYY')).toBe(false);
    expect(tools.validateDate('199.12.11', 'YYYY.MM.DD')).toBe(false);
    expect(tools.validateDate('1999.12.11', 'YYYY.MM.DD')).toBe(true);
  });

  it('kontrola ISO formátu datumu', function () {
    expect(new Date('2014-10-02T20:00:00.000Z')).toEqual(new Date(2014, 9, 2, 22));
    expect(new Date('2014-10-02T20:00:00.000Z')).not.toEqual(new Date(2014, 9, 2, 21));
  });

  /*  it('setDateFormat - nastavení správného formátu datumu', function () {
      expect(tools.setDateFormat({test: '2014-10-02T22:00:00.000Z'}, ['test'])).toEqual({test: '3.10.2014'});
      expect(tools.setDateFormat({test: '1'}, ['test'])).toEqual({test: ''});
    });*/

  it('join - kontrola spojení neprázdných polí pomocí řetězce str', function () {
    var arr = ['A', 'b', '', null, 'C'];
    expect(tools.join(arr, '*')).toBe('A*b*C');
  });

  it('getColorEventForCalendar - kontrola barva podle typu pro kalendar', function () {
    var event = {type: constants.TYPE_CALENDAR_EVENT_REMINDER, typeId: null};
    expect(tools.getColorEventForCalendar(event)).toBe('Orange');
    event = {type: constants.TYPE_CALENDAR_EVENT_APPOINTMENT, typeId: 1};
    expect(tools.getColorEventForCalendar(event)).toBe('SkyBlue');
    event = {type: constants.TYPE_CALENDAR_EVENT_APPOINTMENT, typeId: 2};
    expect(tools.getColorEventForCalendar(event)).toBe('YellowGreen');
    event = {type: constants.TYPE_CALENDAR_EVENT_APPOINTMENT, typeId: 3};
    expect(tools.getColorEventForCalendar(event)).toBe('Blue');
    event = {type: constants.TYPE_CALENDAR_EVENT_APPOINTMENT, typeId: 4};
    expect(tools.getColorEventForCalendar(event)).toBe('DarkGreen');
  });

  it('objectWithBooleanToArray - kontrola převodu vlastností objektu do hodnot array pole', function () {
    var obj = {arg1: true, arg2: false, arg3: true};
    expect(tools.objectWithBooleanToArray(obj)).toEqual(['arg1', 'arg3']);
    obj = {1: true, 2: false, 3: true};
    expect(tools.objectWithBooleanToArray(obj)).toEqual(['1', '3']);
  });

  it('objectFromArrayByGroup - objekt z pole s řádky podle skupiny', function () {
    var array = [
      {date: '2014-05-10T00:00:00.000Z', arg1: true, arg2: false, arg3: true},
      {date: '2014-05-10T00:00:00.000Z', arg1: true, arg2: false, arg3: true},
      {date: '2014-05-10T00:00:00.000Z', arg1: true, arg2: false, arg3: true},
      {date: '2014-11-25T00:00:00.000Z', arg1: true, arg2: false, arg3: true}
    ];
    expect(tools.objectFromArrayByGroup(array, 'date')[array[0].date].rows.length).toEqual(3);
    expect(tools.objectFromArrayByGroup(array, 'date')[array[3].date].rows.length).toEqual(1);
  });

  it('sortArrayWithObjectsIntoGroups - sort array with array sort pattern on field', function () {
    var field = 'id', arrayData, arraySort, compare;
    arrayData = [{id: 1}, {id: 2}, {id: 3}];
    arraySort = [1, 2, 3];
    compare = {1: [{id: 1}], 2: [{id: 2}], 3: [{id: 3}], count: 3};
    expect(tools.sortArrayWithObjectsIntoGroups(arrayData, field, arraySort)).toEqual(compare);

    arrayData = [{id: 1}, {id: 2}, {id: 3}, {id: 1}, {id: 2}, {id: 3}, {id: 1}, {id: 2}, {id: 3}];
    compare = {1: [{id: 1}, {id: 1}, {id: 1}], 2: [{id: 2}, {id: 2}, {id: 2}], 3: [{id: 3}, {id: 3}, {id: 3}], count: 9};
    expect(tools.sortArrayWithObjectsIntoGroups(arrayData, field, arraySort)).toEqual(compare);
    expect(tools.sortArrayWithObjectsIntoGroups(arrayData, field, arraySort).count).toEqual(9);
  });

  it('timer - timer', function () {
    //asdfasdf;
  });
});
