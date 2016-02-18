/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file DateService
 * @fileOverview DateService
 */

/**
 * @namespace DateService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('DateService', ['$filter', '$locale', 'uibDatepickerConfig', 'uibDatepickerPopupConfig', 'Constants', function DateService($filter, $locale, uibDatepickerConfig, uibDatepickerPopupConfig, Constants) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var format = 'd.M.yyyy', //$locale.DATETIME_FORMATS.mediumDate,
      formatTime = $locale.DATETIME_FORMATS.shortTime;
    return {
      /**
       * @memberof DateService
       * @method
       * @name setFormat
       * @description set date format
       * @param value {String} date format
       * @returns void
       */
      setFormat: function (value) {
        format = value;
      },
      /**
       * @memberof DateService
       * @method
       * @name getFormat
       * @description get date format
       * @returns String
       */
      getFormat: function () {
        return format;
      },
      /**
       * @memberof DateService
       * @method
       * @name setFormatTime
       * @description set time format
       * param value {String} time format
       * @returns void
       */
      setFormatTime: function (value) {
        formatTime = value;
      },
      /**
       * @memberof DateService
       * @method
       * @name getFormatTime
       * @description get time format
       * @returns String
       */
      getFormatTime: function () {
        return formatTime;
      },
      /**
       * @memberof DateService
       * @method
       * @name lastDay
       * @description return last day of month
       * @param date {Date}
       * @returns Date
       */
      lastDay: function (date) {
        var year = date.getFullYear(),
          month = date.getMonth();
        return new Date(year, month, 0);
      },
      /**
       * @memberof DateService
       * @method
       * @name addMonths
       * @description return date + months
       * @param date {Date}
       * @param c {Integer} offset
       * @returns Date
       */
      addMonths: function (date, c) {
        var newDate, year, month, i;
        year = date.getFullYear();
        month = date.getMonth() + 1;
        if (c >= 0) {
          for (i = 0; i < c; i += 1) {
            if (month === 12) {
              month = 1;
              year += 1;
            } else {
              month += 1;
            }
          }
        } else {
          for (i = 0; i < (c * -1); i += 1) {
            if (month === 1) {
              month = 12;
              year -= 1;
            } else {
              month -= 1;
            }
          }
        }
        newDate = new Date(year, month, 0, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()); // v teto konstrukci kde den je 0 se mesic bere z rozsahu 1 - 12 oproti ostatni deklaraci, pokud je den 0, vraci to posledni den v mesici a mesic se zadava kalendarni
        return date.getDate() > newDate.getDate() ? newDate : new Date(year, month - 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      },
      /**
       * @memberof DateService
       * @method
       * @name addYears
       * @description return date + years
       * @param date {Date}
       * @param i {Integer}
       * @returns Date
       */
      addYears: function (date, i) {
        return new Date(date.getFullYear() + i, date.getMonth(), date.getDate());
      },
      /**
       * @memberof DateService
       * @method
       * @name strToDate
       * @description return Date from String
       * @param str {String}
       * @returns Date
       */
      strToDate: function (str) {
        var tmp = str.split('.');
        return new Date(tmp[2], tmp[1] - 1, tmp[0]);
      },
      /**
       * @memberof DateService
       * @method
       * @name wordFromDateRange
       * @description return word from date range
       * @param date {Date} date from
       * @param currentDate {Date} date to, actual date
       * @returns String
       */
      wordFromDateRange: function (date, currentDate) {
        var range, i, l, word = '', getDate, dateEarlier, dateLater, inputDate, service, dayCount;
        service = this;
        // private function
        getDate = function (date, dateStr, daysCount) {  // Date, String, Integer
          var newDate = new Date(date.setHours(0, 0, 0, 0)),
            type,
            tmp;
          if (isNaN(dateStr)) {
            if (dateStr.indexOf('M') > -1) {
              type = 1;
            }
            if (dateStr.indexOf('Y') > -1) {
              type = 2;
            }
            if (dateStr.indexOf('E') > -1) {
              type = 3;
            }
          } else {
            type = 0;
          }

          switch (type) {
          case 0: // Days
            newDate.setDate(date.getDate() - parseInt(dateStr, 10) + (daysCount * -1));
            break;
          case 1: // Months
            tmp = service.addMonths(date, (dateStr.split('M').length - 1) * -1);
            newDate = tmp.setDate(tmp.getDate() + (daysCount * -1));
            break;
          case 2: // Years
            tmp = service.addYears(date, (dateStr.split('Y').length - 1) * -1);
            newDate = tmp.setDate(tmp.getDate() + (daysCount * -1));
            break;
          case 3: // Years
            newDate = new Date(1900, 1, 1);
            break;
          default:
            newDate = null;
          }
          return newDate;
        };

        // pouze pro prvni ctyri do 31 dní
        dayCount = currentDate.getDate() + (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate());

        range = [
          {from: '0', fromDay: 0, to: '0', toDay: 0, text: '', sufix: 'TODAY'}, //cz a en predelat na konstanty pro preklad
          {from: '1', fromDay: 0, to: '1', toDay: 0, text: '', sufix: 'YESTERDAY'},
          {from: '2', fromDay: 0, to: '2', toDay: 0, text: '2 ', sufix: 'DAYS'},
          {from: '3', fromDay: 0, to: '26', toDay: 0, text: dayCount + ' ', sufix: 'DAYS2'},
          {from: '27', fromDay: 0, to: 'M', toDay: -1, text: '≈ 1 ', sufix: 'MONTH'},
          {from: 'M', fromDay: 0, to: 'M', toDay: 0, text: '1 ', sufix: 'MONTH'},
          {from: 'M', fromDay: 1, to: 'M', toDay: 4, text: '≈ 1 ', sufix: 'MONTH'},
          {from: 'M', fromDay: 5, to: 'MM', toDay: -5, text: '> 1 ', sufix: 'MONTH'},
          {from: 'MM', fromDay: -4, to: 'MM', toDay: -1, text: '≈ 2 ', sufix: 'MONTH2'},
          {from: 'MM', fromDay: 0, to: 'MM', toDay: 0, text: '2 ', sufix: 'MONTH2'},
          {from: 'MM', fromDay: 1, to: 'MM', toDay: 4, text: '≈ 2 ', sufix: 'MONTH2'},
          {from: 'MM', fromDay: 5, to: 'MMM', toDay: -5, text: '> 2 ', sufix: 'MONTH2'},
          {from: 'MMM', fromDay: -4, to: 'MMM', toDay: -1, text: '≈ 3 ', sufix: 'MONTH2'},
          {from: 'MMM', fromDay: 0, to: 'MMM', toDay: 0, text: '3 ', sufix: 'MONTH2'},
          {from: 'MMM', fromDay: 1, to: 'MMM', toDay: 4, text: '≈ 3 ', sufix: 'MONTH2'},
          {from: 'MMM', fromDay: 5, to: 'MMMM', toDay: -5, text: '> 3 ', sufix: 'MONTH2'},
          {from: 'MMMM', fromDay: -4, to: 'MMMM', toDay: -1, text: '≈ 4 ', sufix: 'MONTH2'},
          {from: 'MMMM', fromDay: 0, to: 'MMMM', toDay: 0, text: '4 ', sufix: 'MONTH2'},
          {from: 'MMMM', fromDay: 1, to: 'MMMM', toDay: 4, text: '≈ 4 ', sufix: 'MONTH2'},
          {from: 'MMMM', fromDay: 5, to: 'MMMMM', toDay: -5, text: '> 4 ', sufix: 'MONTH2'},
          {from: 'MMMMM', fromDay: -4, to: 'MMMMM', toDay: -1, text: '≈ 5 ', sufix: 'MONTH3'},
          {from: 'MMMMM', fromDay: 0, to: 'MMMMM', toDay: 0, text: '5 ', sufix: 'MONTH3'},
          {from: 'MMMMM', fromDay: 1, to: 'MMMMM', toDay: 4, text: '≈ 5 ', sufix: 'MONTH3'},
          {from: 'MMMMM', fromDay: 5, to: 'MMMMMM', toDay: -5, text: '> 5 ', sufix: 'MONTH3'},
          {from: 'MMMMMM', fromDay: -4, to: 'MMMMMM', toDay: -1, text: '≈ 6 ', sufix: 'MONTH3'},
          {from: 'MMMMMM', fromDay: 0, to: 'MMMMMM', toDay: 0, text: '6 ', sufix: 'MONTH3'},
          {from: 'MMMMMM', fromDay: 1, to: 'MMMMMM', toDay: 4, text: '≈ 6 ', sufix: 'MONTH3'},
          {from: 'MMMMMM', fromDay: 5, to: 'MMMMMMM', toDay: -5, text: '> 6 ', sufix: 'MONTH3'},
          {from: 'MMMMMMM', fromDay: -4, to: 'MMMMMMM', toDay: -1, text: '≈ 7 ', sufix: 'MONTH3'},
          {from: 'MMMMMMM', fromDay: 0, to: 'MMMMMMM', toDay: 0, text: '7 ', sufix: 'MONTH3'},
          {from: 'MMMMMMM', fromDay: 1, to: 'MMMMMMM', toDay: 4, text: '≈ 7 ', sufix: 'MONTH3'},
          {from: 'MMMMMMM', fromDay: 5, to: 'MMMMMMMM', toDay: -5, text: '> 7 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMM', fromDay: -4, to: 'MMMMMMMM', toDay: -1, text: '≈ 8 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMM', fromDay: 0, to: 'MMMMMMMM', toDay: 0, text: '8 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMM', fromDay: 1, to: 'MMMMMMMM', toDay: 4, text: '≈ 8 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMM', fromDay: 5, to: 'MMMMMMMMM', toDay: -5, text: '> 8 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMM', fromDay: -4, to: 'MMMMMMMMM', toDay: -1, text: '≈ 9 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMM', fromDay: 0, to: 'MMMMMMMMM', toDay: 0, text: '9 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMM', fromDay: 1, to: 'MMMMMMMMM', toDay: 4, text: '≈ 9 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMM', fromDay: 5, to: 'MMMMMMMMMM', toDay: -5, text: '> 9 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMMM', fromDay: -4, to: 'MMMMMMMMMM', toDay: -1, text: '≈ 10 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMMM', fromDay: 0, to: 'MMMMMMMMMM', toDay: 0, text: '10 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMMM', fromDay: 1, to: 'MMMMMMMMMM', toDay: 4, text: '≈ 10 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMMM', fromDay: 5, to: 'MMMMMMMMMMM', toDay: -5, text: '> 10 ', sufix: 'MONTH3'},
          {from: 'MMMMMMMMMMM', fromDay: 5, to: 'Y', toDay: 30, text: '1 ', sufix: 'YEAR'},
          {from: 'Y', fromDay: 31, to: 'Y', toDay: 150, text: '> 1 ', sufix: 'YEAR'},
          {from: 'Y', fromDay: 151, to: 'Y', toDay: 210, text: '1,5 ', sufix: 'YEAR2'},
          {from: 'Y', fromDay: 211, to: 'YY', toDay: -31, text: '< 2 ', sufix: 'YEAR3'},
          {from: 'YY', fromDay: -30, to: 'YY', toDay: 30, text: '2 ', sufix: 'YEAR3'},
          {from: 'YYY', fromDay: 31, to: 'E', toDay: 0, text: '', sufix: 'OUT_OF_DATE'}
        ];

        for (i = 0, l = range.length; i < l; i += 1) {
          dateEarlier = getDate(currentDate, range[i].from, range[i].fromDay);
          dateLater = getDate(currentDate, range[i].to, range[i].toDay);
          inputDate = new Date(date.setHours(0, 0, 0, 0));
          if (inputDate >= dateLater && inputDate <= dateEarlier) {
            word = range[i].text + $filter('translate')(range[i].sufix);
            break;
          }
        }
        return word;
      },
      /**
       * @memberof DateService
       * @method
       * @name setDatepicker
       * @description set global properties for Datepicker
       * @returns void
       */
      setDatepicker: function () {
        // Datepicker, properties without properties from locale i18n
        uibDatepickerConfig.showWeeks = false;
        uibDatepickerPopupConfig.currentText = $filter('translate')('TODAY');
        uibDatepickerPopupConfig.clearText = $filter('translate')('CLEAR');
        uibDatepickerPopupConfig.closeText = $filter('translate')('CLOSE');
      },
      /**
       * @memberof DateService
       * @method
       * @name setDate
       * @description set selected date to property date
       * @param oldDate {Date} property for save to database
       * @param newDate {Date} new value for date
       * @returns Date
       */
      setDate: function (oldDate, newDate) {
        if (!oldDate || !newDate) {
          return newDate;
        }
        var tmpNewDate = new Date(newDate), tmpOldDate = new Date(oldDate);
        tmpOldDate.setDate(tmpNewDate.getDate());
        tmpOldDate.setMonth(tmpNewDate.getMonth());
        tmpOldDate.setFullYear(tmpNewDate.getFullYear());
        return tmpOldDate;
      },
      /**
       * @memberof DateService
       * @method
       * @name setTime
       * @description set selected time to property date
       * @param oldDate {Date} property for save to database
       * @param newTime {Date} new value for date
       * @returns Date
       */
      setTime: function (oldDate, newTime) {
        var tmp = new Date();
        tmp.setTime(newTime);
        if (!oldDate) {
          return tmp;
        }
        oldDate.setHours(tmp.getHours());
        oldDate.setMinutes(tmp.getMinutes());
        //oldDate.setMilliseconds(tmp.getMilliseconds());
        return new Date(oldDate);
      },
      /**
       * @memberof DateService
       * @method
       * @name addMilliseconds
       * @description return date + years
       * @param date {Date}
       * @param ms {Integer}
       * @returns Date
       */
      addMilliseconds: function (date, ms) {
        // for add month
        var dateResult = new Date(date);
        if (ms === 'NWD') { //Next work day
          dateResult = this.nextWorkDay(dateResult);
        } else if (ms === 'M') {  // Month
          dateResult = this.addMonths(dateResult, 1);
        } else {
          dateResult.setMilliseconds(ms);
        }
        return new Date(dateResult); // date must be new instance of Date
      },
      /**
       * @memberof DateService
       * @method
       * @name round
       * @description return rounding date
       * @param date {Date} date
       * @param range {Array} range for level
       * @param level {String} level of date - year, month, day, hour, min, mils
       * @returns Date
       */
      round: function (date, range, level) {
        var dateResult = new Date(date), minutes = 0, minutesPattern = [0, 15, 30, 45, 60], i, l, ref;
        minutesPattern = range || minutesPattern;
        if (level.toUpperCase() === 'MI') {
          ref = date.getMinutes();
          if (minutesPattern.indexOf(ref) === -1) {
            for (i = 0, l = minutesPattern.length; i < l; i += 1) {
              if (ref <= minutesPattern[i]) {
                minutes = minutesPattern[i];
                break;
              }
            }
            dateResult.setMinutes(minutes);
          }
        }
        return new Date(dateResult);
      },
      /**
       * @memberof DateService
       * @method
       * @name getTimeFromTwoDate
       * @description return string
       * @param date {Date}
       * @param date2 {Date}
       * @returns String
       */
      getTimeFromTwoDate: function (date, date2, allDay) {
        var arrTime = ['DAY_SMART', 'HOUR_SMART', 'MINUTE_SMART', 'SECONDS_SMART'], newTime,
          days, day, hours, hour, minutes, minute, seconds, second, str = '', tmp, emptyStr = '0 min.';
        if (!date || !date2) {
          return emptyStr;
        }
        newTime = allDay ? 24 * 60 * 60 * 1000 : new Date(date2) - new Date(date);
        day = 24 * 60 * 60 * 1000;
        hour = 60 * 60 * 1000;
        minute = 60 * 1000;
        second = 1000;
        tmp = newTime;
        if (newTime === 0) {
          return emptyStr;
        }
        // DAYS
        days = Math.floor(tmp / day);
        if (days) {
          tmp = tmp - (days * day);
          str += ' ' + days + ' ' + $filter('translate')(arrTime[0]);
        }
        // HOURS
        hours = Math.floor(tmp / hour);
        if (hours) {
          tmp = tmp - (hours * hour);
          str += ' ' + hours + ' ' + $filter('translate')(arrTime[1]);
        }
        // MINUTES
        minutes = Math.floor(tmp / minute);
        if (minutes) {
          tmp = tmp - (minutes * minute);
          str += ' ' + minutes + ' ' + $filter('translate')(arrTime[2]);
        }
        // SECONDS
        seconds = Math.floor(tmp / second);
        tmp = tmp - (seconds * second);
        if (seconds) {
          str += ' ' + seconds + ' ' + $filter('translate')(arrTime[3]);
        }
        return str;
      },
      /**
       * @memberof DateService
       * @method
       * @name getDateWithMomemtJs
       * @description parse string to date
       * @param dateModel {Date}
       * @param dateInputStr {Date}
       * @returns Date
       */
      getDateWithMomemtJs: function (dateModel, dateInputStr) {
        var arrFmt, arrInput, sep, fmt, result, fmt2;
        fmt = this.getFormat();
        sep = fmt.replace(/d/gi, '').replace(/m/gi, '').replace(/y/gi, '').replace(/ /g, '')[0];
        arrFmt = fmt.split(sep);
        arrInput = dateInputStr.split(sep);
        if (arrFmt.length !== arrInput.length || arrInput.length === 0 || arrInput.indexOf('') > -1 || arrInput.indexOf('0') > -1) {
          return null;
        }
        if (arrFmt[0].length === arrInput[0].length && arrFmt[1].length === arrInput[1].length && arrFmt[2].length === arrInput[2].length) {
          result = new Date(dateModel);
        } else {
          // add full format for year
          fmt = fmt.indexOf('yyyy') > -1 || fmt.indexOf('YYYY') > -1 ? fmt : fmt.replace(/yy/gi, 'yyyy');
          arrFmt = fmt.split(sep);
          fmt2 = arrFmt[0].substring(0, arrInput[0].length).toUpperCase() + sep +
            arrFmt[1].substring(0, arrInput[1].length).toUpperCase() + sep +
            arrFmt[2].substring(0, arrInput[2].length).toUpperCase();
          result = new Date(moment(dateInputStr, fmt2));
        }
        return result;
      },
      /**
       * @memberof DateService
       * @method
       * @name getDateTimeWithMomemtJs
       * @description parse string to datetime
       * @param dateModelMaster {Date}
       * @param dateModel {Date}
       * @param dateInputStr {Date}
       * @returns Date
       */
      getDateTimeWithMomemtJs: function (dateModelMaster, dateModel, dateInputStr) {
        var arrFmt, arrInput, sep, fmtTime, result, fmt2, hours, date, dateStr;
        fmtTime = this.getFormatTime();
        sep = fmtTime.replace(/h/gi, '').replace(/m/gi, '').replace(/a/gi, '').replace(/ /gi, '')[0];
        arrFmt = fmtTime.split(sep);
        arrInput = dateInputStr.split(sep);
        if (arrFmt.length !== arrInput.length ||
            (arrFmt[1].length === 2 && arrInput[1].length !== arrFmt[1].length) ||
            (arrFmt[1].length > 2 && (arrInput[1].substring(arrFmt[1].indexOf('a'), 3).toLowerCase() === ' pm' || arrInput[1].substring(arrFmt[1].indexOf('a'), 3).toLowerCase() === ' am')) ||
            arrInput.length === 0 ||
            arrInput.indexOf('') > -1) {
          return null;
        }
        if (arrInput[0].length >= arrFmt[0].length && ((arrFmt[1].length === 2 && arrFmt[1].length === arrInput[1].length) || arrInput[1].length === 5)) {
          result = new Date(dateModel);
        } else {
          hours = arrFmt[0].substring(0, arrInput[0].length);
          hours = fmtTime.indexOf('a') > -1 || fmtTime.indexOf('A') > -1 ? hours.toLowerCase() : hours.toUpperCase();
          date = dateModelMaster ? new Date(dateModelMaster) : new Date();
          dateStr = date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate() + ' ';
          fmt2 = 'YYYY.M.D ' + hours + sep + arrFmt[1].substring(0, arrInput[1].length).toLowerCase();
          result = new Date(moment(dateStr + dateInputStr, fmt2));
        }
        // for invalid date return dataModelMaster or new Date
        return result > new Date(1899, 0, 1) ? result : date;
      },
      /**
       * @memberof DateService
       * @method
       * @name nextWorkDay
       * @description get next work day
       * @param date {Date}
       * @returns Date
       */
      nextWorkDay: function (date) {
        var ms = 24 * 60 * 60 * 1000;
        switch (date.getDay()) {
        case 0:  // Sunday
        case 1:
        case 2:
        case 3:
        case 4:
          break;
        case 5:
          ms = ms * 3;
          break;
        case 6: // Saturday
          ms = ms * 2;
          break;
        }
        date.setMilliseconds(ms);
        return new Date(date);
      },
      /**
       * @memberof DateService
       * @method
       * @name setDateAsUTC0
       * @description set date as UTC 0
       * @param date {Date}
       * @returns Date
       */
      setDateAsUTC0: function (date) {
        return date ? new Date((new Date(date)).setMilliseconds((new Date(date)).getTimezoneOffset() * 60 * 1000 * -1)) : null;
      },
      /**
       * @memberof DateService
       * @method
       * @name getTimeLineString
       * @description get Date as timeline String
       * @param date {Date}
       * @returns String
       */
      getTimeLineString: function (date) {
        var currentDate, compareDate, str, priorDate, nextDate;
        currentDate = new Date((new Date()).setHours(0, 0, 0, 0));
        compareDate = new Date((new Date(date)).setHours(0, 0, 0, 0));
        priorDate = this.addMilliseconds(currentDate, 24 * 60 * 60 * 1000 * -1);
        nextDate = this.addMilliseconds(currentDate, 24 * 60 * 60 * 1000);
        if (currentDate.toISOString() === compareDate.toISOString()) {
          str = Constants.TIMELINE_DATE_CURRENT;
        }
        if (priorDate.toISOString() === compareDate.toISOString()) {
          str = Constants.TIMELINE_DATE_PRIOR;
        }
        if (nextDate.toISOString() === compareDate.toISOString()) {
          str = Constants.TIMELINE_DATE_NEXT;
        }
        return str || '';
      },
      /**
       * @memberof DateService
       * @method
       * @name moveToDayOfWeek
       * @description get Date for dayOfWeek
       * @param date {Date} date
       * @param dayOfWeek {Number} 0..6
       * @returns Date
       */
      moveToDayOfWeek: function (date, dayOfWeek) {
        var firstDay = 1, day, ms, currentDay;
        day = firstDay === 1 && dayOfWeek === 0 ? 7 : dayOfWeek;
        currentDay = (new Date(date)).getDay();
        currentDay = firstDay === 1 && currentDay === 0 ? 7 : currentDay;
        ms = currentDay === day ? 0 : (day - currentDay) * 24 * 60 * 60 * 1000;
        return this.addMilliseconds(date, ms);
      },
      /**
       * @memberof DateService
       * @method
       * @name getTimeFromDateObject
       * @description string time from date object
       * @param obj {Object} obj
       * @returns String
       */
      getTimeFromDateObject: function (obj) {
        var dateStr = '';
        if (obj.hours) {
          dateStr += (obj.hours * -1) + ':';
        } else {
          dateStr += '00:';
        }
        if (obj.minutes) {
          dateStr += (obj.minutes * -1);
        } else {
          dateStr += '00';
        }
        return dateStr;
      },
      /**
       * @memberof DateService
       * @method
       * @name clearISOTime
       * @description clear time
       * @param ISOString {String} ISOString
       * @returns String
       */
      clearISOTime: function (ISOString) {
        return ISOString.substr(0, 10) + 'T' + '00:00:00.000Z';
      },
      /**
       * @memberof DateService
       * @method
       * @name getAge
       * @description calculate age
       * @param date {Date}
       * @returns Number
       */
      getAge: function (date) {
        var today = new Date(), birthDate = new Date(date),
          age = today.getFullYear() - birthDate.getFullYear(),
          m = today.getMonth() - birthDate.getMonth();
        return m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      },
      /**
       * @memberof DateService
       * @method
       * @name getDaysToDate
       * @description calculate days to date from today
       * @param date {Date}
       * @returns Number
       */
      getDaysToDate: function (date) {
        var today = new Date(), dateTo = new Date(date), day = 24 * 60 * 60 * 1000, timeDiff;
        today.setHours(0, 0, 0, 0);
        dateTo.setHours(0, 0, 0, 0);
        timeDiff = dateTo - today;
        return Math.floor(timeDiff / day);
      },
      /**
       * @memberof DateService
       * @method
       * @name setDateAfterToday
       * @description set date to date after today with given day and month
       * @param date {Date}
       * @returns Date
       */
      setDateAfterToday: function (date) {
        var service = this, today = new Date(), newDate = new Date(date), year;
        today.setHours(0, 0, 0, 0);
        year = today.getFullYear();
        newDate = new Date(year, newDate.getMonth(), newDate.getDate());
        return newDate < today ? service.addYears(newDate, 1) : newDate;
      }
    };
  }]);
