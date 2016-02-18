/*jslint node: true, unparam: true */
'use strict';

describe('Service: DateService', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var date, constants;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (DateService, Constants) {
    date = DateService;
    constants = Constants;
  }));

  it('lastDay - poslední den v měsíci', function () {
    var tmpDate = new Date(2014, 10, 2),
      lastDateStr,
      lastDate;

    lastDate = date.lastDay(tmpDate);
    lastDateStr = lastDate.getDate() + '.' + (lastDate.getMonth() + 1) + '.' + lastDate.getFullYear(); // getMonth vraci 0 - 11
    expect(lastDateStr).toBe('31.10.2014');
  });

  it('addMonths - přidá měsíc', function () {
    var tmpDate = new Date(2014, 9, 2), // mesic se indexuje 0 - 11
      addMonthsStr,
      addMonths;

    addMonths = date.addMonths(tmpDate, 1);
    addMonthsStr = addMonths.getDate() + '.' + (addMonths.getMonth() + 1) + '.' + addMonths.getFullYear(); // getMonth vraci 0 - 11
    expect(addMonthsStr).toBe('2.11.2014');
  });

  it('addYears - přidá rok', function () {
    var tmpDate = new Date(2014, 9, 2), // mesic se indexuje 0 - 11
      addYearsStr,
      addYears;

    addYears = date.addYears(tmpDate, 1);
    addYearsStr = addYears.getDate() + '.' + (addYears.getMonth() + 1) + '.' + addYears.getFullYear(); // getMonth vraci 0 - 11
    expect(addYearsStr).toBe('2.10.2015');
  });

  it('strToDate - řetězec na datum', function () {
    var tmpDate,
      tmpDateStr,
      dateStr = '2.10.2014';

    tmpDate = date.strToDate(dateStr);
    tmpDateStr = tmpDate.getDate() + '.' + (tmpDate.getMonth() + 1) + '.' + tmpDate.getFullYear(); // getMonth vraci 0 - 11
    expect(tmpDateStr).toBe(dateStr);
  });

  it('wordFromDateRange - ze dvou datumů udělá textovou reprezentaci rozsahu', function () {
    var dateInput = new Date(2014, 9, 2), // mesic se indexuje 0 - 11
      currentDate = new Date(2014, 9, 2), // mesic se indexuje 0 - 11
      word;

    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('TODAY');

    dateInput = new Date(2014, 9, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('YESTERDAY');

    dateInput = new Date(2014, 8, 30); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('2 DAYS');

    dateInput = new Date(2014, 8, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('3 DAYS2');

    dateInput = new Date(2014, 8, 6); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('26 DAYS2');

    // 1 MESIC
    dateInput = new Date(2014, 8, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 1 MONTH');

    dateInput = new Date(2014, 8, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 1 MONTH');

    dateInput = new Date(2014, 8, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('1 MONTH');

    dateInput = new Date(2014, 8, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 1 MONTH');

    dateInput = new Date(2014, 7, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 1 MONTH');

    dateInput = new Date(2014, 7, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 1 MONTH');

    dateInput = new Date(2014, 7, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 1 MONTH');

    // 2 MESICE
    dateInput = new Date(2014, 7, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 2 MONTH2');

    dateInput = new Date(2014, 7, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 2 MONTH2');

    dateInput = new Date(2014, 7, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('2 MONTH2');

    dateInput = new Date(2014, 7, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 2 MONTH2');

    dateInput = new Date(2014, 6, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 2 MONTH2');

    dateInput = new Date(2014, 6, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 2 MONTH2');

    dateInput = new Date(2014, 6, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 2 MONTH2');

    // 3 MESICE
    dateInput = new Date(2014, 6, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 3 MONTH2');

    dateInput = new Date(2014, 6, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 3 MONTH2');

    dateInput = new Date(2014, 6, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('3 MONTH2');

    dateInput = new Date(2014, 6, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 3 MONTH2');

    dateInput = new Date(2014, 5, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 3 MONTH2');

    dateInput = new Date(2014, 5, 27); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 3 MONTH2');

    dateInput = new Date(2014, 5, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 3 MONTH2');

    // 4 MESICE
    dateInput = new Date(2014, 5, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 4 MONTH2');

    dateInput = new Date(2014, 5, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 4 MONTH2');

    dateInput = new Date(2014, 5, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('4 MONTH2');

    dateInput = new Date(2014, 5, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 4 MONTH2');

    dateInput = new Date(2014, 4, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 4 MONTH2');

    dateInput = new Date(2014, 4, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 4 MONTH2');

    dateInput = new Date(2014, 4, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 4 MONTH2');

    // 5 MESICU
    dateInput = new Date(2014, 4, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 5 MONTH3');

    dateInput = new Date(2014, 4, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 5 MONTH3');

    dateInput = new Date(2014, 4, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('5 MONTH3');

    dateInput = new Date(2014, 4, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 5 MONTH3');

    dateInput = new Date(2014, 3, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 5 MONTH3');

    dateInput = new Date(2014, 3, 27); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 5 MONTH3');

    dateInput = new Date(2014, 3, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 5 MONTH3');

    // 6 MESICU
    dateInput = new Date(2014, 3, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 6 MONTH3');

    dateInput = new Date(2014, 3, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 6 MONTH3');

    dateInput = new Date(2014, 3, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('6 MONTH3');

    dateInput = new Date(2014, 3, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 6 MONTH3');

    dateInput = new Date(2014, 2, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 6 MONTH3');

    dateInput = new Date(2014, 2, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 6 MONTH3');

    dateInput = new Date(2014, 2, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 6 MONTH3');

    // 7 MESICU
    dateInput = new Date(2014, 2, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 7 MONTH3');

    dateInput = new Date(2014, 2, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 7 MONTH3');

    dateInput = new Date(2014, 2, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('7 MONTH3');

    dateInput = new Date(2014, 2, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 7 MONTH3');

    dateInput = new Date(2014, 1, 26); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 7 MONTH3');

    dateInput = new Date(2014, 1, 25); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 7 MONTH3');

    dateInput = new Date(2014, 1, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 7 MONTH3');

    // 8 MESICU
    dateInput = new Date(2014, 1, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 8 MONTH3');

    dateInput = new Date(2014, 1, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 8 MONTH3');

    dateInput = new Date(2014, 1, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('8 MONTH3');

    dateInput = new Date(2014, 1, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 8 MONTH3');

    dateInput = new Date(2013, 12, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 8 MONTH3');

    dateInput = new Date(2013, 12, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 8 MONTH3');

    dateInput = new Date(2013, 12, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 8 MONTH3');

    // 9 MESICU
    dateInput = new Date(2013, 12, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 9 MONTH3');

    dateInput = new Date(2013, 12, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 9 MONTH3');

    dateInput = new Date(2013, 12, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('9 MONTH3');

    dateInput = new Date(2013, 12, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 9 MONTH3');

    dateInput = new Date(2013, 11, 29); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 9 MONTH3');

    dateInput = new Date(2013, 11, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 9 MONTH3');

    dateInput = new Date(2013, 11, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 9 MONTH3');

    // 10 MESICU
    dateInput = new Date(2013, 11, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 10 MONTH3');

    dateInput = new Date(2013, 11, 3); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 10 MONTH3');

    dateInput = new Date(2013, 11, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('10 MONTH3');

    dateInput = new Date(2013, 11, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 10 MONTH3');

    dateInput = new Date(2013, 10, 28); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('≈ 10 MONTH3');

    dateInput = new Date(2013, 10, 27); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 10 MONTH3');

    dateInput = new Date(2013, 10, 7); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 10 MONTH3');

    // 1 ROK
    dateInput = new Date(2013, 9, 26); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('1 YEAR');

    dateInput = new Date(2013, 8, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('1 YEAR');

    // > 1 ROK
    dateInput = new Date(2013, 8, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 1 YEAR');

    dateInput = new Date(2013, 4, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('> 1 YEAR');

    // 1,5 ROKU
    dateInput = new Date(2013, 4, 4); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('1,5 YEAR2');

    dateInput = new Date(2013, 2, 6); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('1,5 YEAR2');

    // 1,5 ROKU
    dateInput = new Date(2013, 2, 5); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('< 2 YEAR3');

    dateInput = new Date(2012, 10, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('< 2 YEAR3');

    // 2 ROKY
    dateInput = new Date(2012, 10, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('2 YEAR3');

    dateInput = new Date(2012, 8, 2); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('2 YEAR3');

    // > 2 ROKY
    dateInput = new Date(2011, 8, 1); // mesic se indexuje 0 - 11
    word = date.wordFromDateRange(dateInput, currentDate);
    expect(word).toBe('OUT_OF_DATE');
  });

  it('setDate - přidání datumových hodnot do proměnné Date', function () {
    var oldDate = new Date('2014-04-15T12:10:50.300Z'), currentDate = new Date('2014-04-15T00:00:00.000Z'), newDate;
    newDate = date.setDate(oldDate, currentDate);
    expect(newDate.toISOString()).toBe('2014-04-15T12:10:50.300Z');
    newDate = date.setDate(oldDate, null);
    expect(newDate).toBe(null);
    newDate = date.setDate(null, currentDate);
    expect(newDate.toISOString()).toBe('2014-04-15T00:00:00.000Z');
  });

  it('setTime - přidání časových hodnot do proměnné Date', function () {
    var oldDate = new Date('2014-04-15T12:10:50.300Z'), currentDate = new Date('2014-07-22T02:13:56.100Z'), newDate;

    // getHours vraci lokalizovane hodiny, to je spatne !!!! opravit vše
    newDate = date.setTime(oldDate, currentDate);
    expect(newDate.toISOString()).toBe('2014-04-15T02:13:50.300Z');
    newDate = date.setTime(null, currentDate);
    expect(newDate.toISOString()).toBe('2014-07-22T02:13:56.100Z');
  });

  it('addMilliseconds - přidání milisekund do datumu', function () {
    var ms,
      currentDate = new Date('2014-11-03T00:00:00.000Z'),
      testDate;

    ms = 60 * 60 * 1000; // 1 hodina
    testDate = date.addMilliseconds(currentDate, ms);
    expect(testDate.toISOString()).toBe('2014-11-03T01:00:00.000Z');
    ms = 'M';  // k vysledku pridat jeste mesic
    testDate = date.addMilliseconds(currentDate, ms);
    expect(testDate.toISOString()).toBe('2014-12-03T00:00:00.000Z');
  });

  it('round - zaokrouhleni datumu na vybraném levelu (min, hodiny, den, rok apod.)', function () {
    var currentDate = new Date('2014-11-03T00:33:00.000Z'),
      testDate;

    testDate = date.round(currentDate, null, 'mi');
    expect(testDate.toISOString()).toBe('2014-11-03T00:45:00.000Z');
    currentDate = new Date('2014-11-03T00:06:00.000Z');
    testDate = date.round(currentDate, null, 'mi');
    expect(testDate.toISOString()).toBe('2014-11-03T00:15:00.000Z');
    currentDate = new Date('2014-11-03T00:46:00.000Z');
    testDate = date.round(currentDate, null, 'mi');
    expect(testDate.toISOString()).toBe('2014-11-03T01:00:00.000Z');
    currentDate = new Date('2014-11-03T00:18:00.000Z');
    testDate = date.round(currentDate, [0, 30, 60], 'mi');
    expect(testDate.toISOString()).toBe('2014-11-03T00:30:00.000Z');
    currentDate = new Date('2014-11-03T00:33:00.000Z');
    testDate = date.round(currentDate, [0, 30, 60], 'mi');
    expect(testDate.toISOString()).toBe('2014-11-03T01:00:00.000Z');
  });

  it('getTimeFromTwoDate - funkce na textovou reprezentaci času (dnů, hodin, minut atd.) rozsahu dvou datumů', function () {
    var oldDate = new Date('2014-12-04T10:34:05.100Z'), newDate = new Date('2014-12-04T10:34:05.100Z');
    expect(date.getTimeFromTwoDate(oldDate, newDate)).toBe('0 min.');
    oldDate = new Date('2014-12-04T10:34:05.100Z');
    newDate = new Date('2014-12-04T10:34:10.100Z');
    expect(date.getTimeFromTwoDate(oldDate, newDate)).toBe(' 5 SECONDS_SMART');
    oldDate = new Date('2014-12-04T10:34:05.100Z');
    newDate = new Date('2014-12-04T10:52:10.100Z');
    expect(date.getTimeFromTwoDate(oldDate, newDate)).toBe(' 18 MINUTE_SMART 5 SECONDS_SMART');
    oldDate = new Date('2014-12-04T10:34:05.100Z');
    newDate = new Date('2014-12-04T11:52:10.100Z');
    expect(date.getTimeFromTwoDate(oldDate, newDate)).toBe(' 1 HOUR_SMART 18 MINUTE_SMART 5 SECONDS_SMART');
    oldDate = new Date('2014-12-03T10:34:05.100Z');
    newDate = new Date('2014-12-04T11:52:10.100Z');
    expect(date.getTimeFromTwoDate(oldDate, newDate)).toBe(' 1 DAY_SMART 1 HOUR_SMART 18 MINUTE_SMART 5 SECONDS_SMART');
  });

  it('getDateWithMomemtJs - převod řetezce Date na datum pomoci moment.js', function () {
    var model = new Date('2014-12-04T00:00:00.000Z'), inputStr = '25.12.2014'; //'12/25/14';
    expect(date.getDateWithMomemtJs(model, inputStr)).not.toBe(new Date('2014-12-04T00:00:00.000Z'));
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('12/25/14')).toISOString());
    //inputStr = '2/25/14';
    inputStr = '25.2.2014';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/25/14')).toISOString());
    //inputStr = '2/7/14';
    inputStr = '7.2.2014';
    // sedlo to na format tak do vrati model
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe('2014-12-04T00:00:00.000Z');
    //inputStr = '2/07/14';
    inputStr = '07.2.2014';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/7/14')).toISOString());
    //inputStr = '02/7/14';
    inputStr = '7.02.2014';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/7/14')).toISOString());
    //inputStr = '2/7/2014';
    inputStr = '7.2.14';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/7/14')).toISOString());
    //inputStr = '02/07/14';
    inputStr = '07.02.2014';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/7/14')).toISOString());
    //inputStr = '02/07/2014';
    inputStr = '07.02.14';
    expect((date.getDateWithMomemtJs(model, inputStr)).toISOString()).toBe((new Date('2/7/14')).toISOString());
  });

  it('getDateTimeWithMomemtJs - převod řetezce DateTime na datum pomoci moment.js', function () {
    var modelMaster = new Date('2014-12-04T10:15:30.000Z'), model = new Date('2014-12-04T10:15:30.000Z'), inputStr = '10:33';
    expect(date.getDateTimeWithMomemtJs(modelMaster, model, inputStr).toISOString()).toBe((new Date(2014, 11, 4, 10, 33)).toISOString());
    inputStr = '8:33 AM';
    // sedne to na format vezme se model
    expect(date.getDateTimeWithMomemtJs(modelMaster, model, inputStr).toISOString()).toBe('2014-12-04T10:15:30.000Z');
    inputStr = '8:3';
    expect(date.getDateTimeWithMomemtJs(modelMaster, model, inputStr).toISOString()).toBe((new Date(2014, 11, 4, 8, 3)).toISOString());
    inputStr = ':3AX';
    expect(date.getDateTimeWithMomemtJs(modelMaster, model, inputStr)).toBe(null);
  });

  it('nextWorkDay - vrací další pracovní den', function () {
    var oldDate = new Date('2014-12-11T01:01:50.000Z'), newDate;
    newDate = date.nextWorkDay(oldDate);
    expect(newDate.toISOString()).toBe('2014-12-12T01:01:50.000Z');
    oldDate = new Date('2014-12-12T01:01:50.000Z');
    newDate = date.nextWorkDay(oldDate);
    expect(newDate.toISOString()).toBe('2014-12-15T01:01:50.000Z');
    oldDate = new Date('2014-12-13T01:01:50.000Z');
    newDate = date.nextWorkDay(oldDate);
    expect(newDate.toISOString()).toBe('2014-12-15T01:01:50.000Z');
    oldDate = new Date('2014-12-14T01:01:50.000Z');
    newDate = date.nextWorkDay(oldDate);
    expect(newDate.toISOString()).toBe('2014-12-15T01:01:50.000Z');
    oldDate = new Date('2014-12-15T01:01:50.000Z');
    newDate = date.nextWorkDay(oldDate);
    expect(newDate.toISOString()).toBe('2014-12-16T01:01:50.000Z');
  });

  it('setDateAsUTC0 - date as utc 0', function () {
    expect(date.setDateAsUTC0(null)).toBe(null);
  });

  it('getTimeLineString - vrací včera, dnes a zítra dle datumu', function () {
    var compareDate;
    compareDate = new Date();
    expect(date.getTimeLineString(compareDate)).toBe(constants.TIMELINE_DATE_CURRENT);
    compareDate = new Date((new Date()).setMilliseconds(24 * 60 * 60 * 1000 * -1));
    expect(date.getTimeLineString(compareDate)).toBe(constants.TIMELINE_DATE_PRIOR);
    compareDate = new Date((new Date()).setMilliseconds(24 * 60 * 60 * 1000));
    expect(date.getTimeLineString(compareDate)).toBe(constants.TIMELINE_DATE_NEXT);
  });

  it('moveToDayOfWeek - vrací datum posunutý o n dní', function () {
    var compareDate, currentDate;
    currentDate = new Date('2015-01-22T00:00:00.000Z');
    compareDate = new Date((new Date(currentDate)).setMilliseconds(3 * 24 * 60 * 60 * 1000));
    expect(date.moveToDayOfWeek(currentDate, 0).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(3 * 24 * 60 * 60 * 1000 * -1));
    expect(date.moveToDayOfWeek(currentDate, 1).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(2 * 24 * 60 * 60 * 1000 * -1));
    expect(date.moveToDayOfWeek(currentDate, 2).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(24 * 60 * 60 * 1000 * -1));
    expect(date.moveToDayOfWeek(currentDate, 3).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(0));
    expect(date.moveToDayOfWeek(currentDate, 4).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(24 * 60 * 60 * 1000));
    expect(date.moveToDayOfWeek(currentDate, 5).toISOString()).toBe(compareDate.toISOString());

    compareDate = new Date((new Date(currentDate)).setMilliseconds(2 * 24 * 60 * 60 * 1000));
    expect(date.moveToDayOfWeek(currentDate, 6).toISOString()).toBe(compareDate.toISOString());

    currentDate = new Date('2015-01-18T00:00:00.000Z');
    compareDate = new Date((new Date(currentDate)).setMilliseconds(-6 * 24 * 60 * 60 * 1000));
    expect(date.moveToDayOfWeek(currentDate, 1).toISOString()).toBe(compareDate.toISOString());

    expect(date.moveToDayOfWeek(currentDate, 6) instanceof Date).toBe(true);
  });
});
