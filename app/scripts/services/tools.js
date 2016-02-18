/*jslint node: true, unparam: true, regexp: true, sub: true*/
'use strict';

/**
 * @file Tools
 * @fileOverview ToolsService
 */

/**
 * @namespace ToolsService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('Tools', ['$timeout', '$translate', '$rootScope', '$location', '$filter', '$cookies', '$locale', 'tmhDynamicLocale', 'Constants', 'DateService', 'Language',
    function Tools($timeout, $translate, $rootScope, $location, $filter, $cookies, $locale, tmhDynamicLocale, Constants, DateService, Language) {
// AngularJS will instantiate a singleton by calling "new" on this function
      return {
        /**
         * @memberof ToolsService
         * @method
         * @name getDateTimeStr
         * @description convert DateTime to String
         * param data {date}
         * @returns {String}
         */
        getDateTimeStr: function (date) {
          var str = '', d, m, y, h, mi;
          if (date) {
            d = date.getDate();
            m = date.getMonth() + 1;
            y = date.getFullYear();
            h = date.getHours();
            mi = date.getMinutes();
            return d + '.' + m + '.' + y + ' ' + h + ':' + mi;
          }
          return str;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name setLanguage
         * @description set translate and locale
         * param key {String}
         * @returns Promise
         */
        setLanguage: function (key) {
          $translate.use(key);
          $cookies.language = key;
          Language.setLanguage(key);
          return tmhDynamicLocale.set(key);
        },
        /**
         * @memberof ToolsService
         * @method
         * @name createObject
         * @description create new Object from params, new instance
         * param obj {Object} new object
         * param oldObj {Object} old object(current)
         * @returns Object
         */
        createObject: function (obj, oldObj) {
          var key, keyNode,
            tmpObj = oldObj || {}, newObj;
          if (obj) {
            newObj = JSON.parse(JSON.stringify(obj));
            for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                // Object or Array
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  // Object
                  if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    tmpObj[key] = newObj[key];
                  }
                  // Function
                  if (Object.prototype.toString.call(obj[key]) === '[object Function]') {
                    tmpObj[key] = newObj[key];
                  }
                  // Date
                  if (Object.prototype.toString.call(obj[key]) === '[object Date]') {
                    tmpObj[key] = new Date(newObj[key]);
                  }
                  // Array
                  if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
                    tmpObj[key] = [];
                    for (keyNode in obj[key]) {
                      if (obj[key].hasOwnProperty(keyNode)) {
                        if (Object.prototype.toString.call(obj[key][keyNode]) === '[object Object]') {
                          tmpObj[key][keyNode] = newObj[key][keyNode];
                        }
                      }
                    }
                  }
                } else {
                  tmpObj[key] = obj[key];
                }
              }
            }
          }
          return tmpObj;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name setObject
         * @description set oldObject object properties with properties of new object, same instance
         * param oldObject {Object} old object
         * param obj {Object} new object
         * @returns void
         */
        setObject: function (oldObject, obj) {
          var key;
          if (obj) {
            for (key in oldObject) {
              if (oldObject.hasOwnProperty(key)) {
                delete oldObject[key];
              }
            }
            oldObject = this.createObject(obj, oldObject);
          }
        },
        /**
         * @memberof ToolsService
         * @method
         * @name getChangedProperties
         * @description create new Object from oldObj with newObj properties
         * param oldObj {Object}
         * param newObj {Object}
         * @returns Object
         */
        getChangedProperties: function (oldObj, newObj) {
          var key, tmpObj = {};
          for (key in newObj) {
            if (newObj.hasOwnProperty(key)) {
              if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key]) && (newObj[key] || oldObj[key])) {
                tmpObj[key] = newObj[key];
              }
            }
          }
          return tmpObj;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name inc
         * @description increment value for all item of array
         * param array {Array}
         * param val {Integer}
         * @returns Object
         */
        inc: function (array, val) {
          var i, l;
          for (i = 0, l = array.length; i < l; i += 1) {
            array[i] += val;
          }
          return array;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name openUrl
         * @description open url
         * @param url {String}
         * @param target {String}
         * @param prefix {String}
         * @returns void
         */
        openUrl: function (url, target, prefix) {
          var tmp;
          if (url) {
            tmp = url;
            if (prefix) {
              tmp = prefix + url;
            }
            if (!prefix && tmp.toUpperCase().indexOf('http://') === -1) {
              tmp = 'http://' + tmp;
            }
            if (target) {
              window.open(tmp, target);
            } else {
              window.open(tmp);
            }
          }
        },
        /**
         * @memberof ToolsService
         * @method
         * @name existsItemInArray
         * @description exists obj in array
         * @param val {Object} model for scope
         * @param arrayObj {Array} list of data
         * @param searchFields {String} fields for search
         * @returns Boolean
         */
        existsItemInArray: function (val, arrayObj, searchFields) {
          var i, l, e, j, exists = false, fields = searchFields.split(",");
          if (!arrayObj) {
            return exists;
          }
          for (i = 0, l = arrayObj.length; i < l; i += 1) {
            for (e = 0, j = fields.length; e < j; e += 1) {
              if (val && searchFields && arrayObj[i][fields[e]].toLowerCase() === val.toLowerCase()) {
                exists = true;
                break;
              }
            }
            if (exists) {
              break;
            }
          }
          return exists;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name getItemFromArray
         * @description exists obj in array
         * @param primaryValue {String} identification field value
         * @param primaryFieldName {Object} identification field
         * @param arrayObj {Array}
         * @param field {String} name for return field value
         * @returns String
         */
        getItemFromArray: function (primaryValue, primaryFieldName, arrayObj, field) {
          var i, l, result = null;
          for (i = 0, l = arrayObj.length; i < l; i += 1) {
            if (primaryFieldName && field && arrayObj[i][primaryFieldName] === primaryValue) {
              result = arrayObj[i][field];
              break;
            }
          }
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name validateEmail
         * @description validate email
         * @param value {String} email address
         * @returns Boolean
         */
        validateEmail: function (value) {
          var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            result = value ? re.test(value) : true;
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name validatePhone
         * @description validate phone
         * @param value {String} phone
         * @returns Boolean
         */
        validatePhone: function (value) {
          var re = /^(\+420)? ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}$/,
            result = value ? re.test(value) : true;
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name validateZip
         * @description validate zip
         * @param value {String} zip
         * @returns Boolean
         */
        validateZip: function (value) {
          var re = /^[0-9]{3} ?[0-9]{2}$/,
            result = value ? re.test(value) : true;
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name deleteItemOfArrayObjects
         * @description delete item from array via id
         * @param obj {Object} object
         * @param arrayName {String} name of field with array
         * @param searchValue {String} value for search
         * @param searchValueField {String} field for search value
         * @returns void
         */
        deleteItemOfArrayObjects: function (obj, arrayName, searchValue, searchValueField) {
          obj[arrayName] = obj[arrayName].filter(function (item) {
            var result = false;
            if (searchValue !== item[searchValueField]) {
              result = true;
            }
            return result;
          });
        },
        /**
         * @memberof ToolsService
         * @method
         * @name objectToQueryString
         * @description replaces object to url string
         * @param obj {Object} object
         * @returns String
         */
        objectToQueryString: function (obj) {
          var key, str = {}, result = '';
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              str[key] = obj[key];
              if (result) {
                result += '&';
              }
              result += key.toString() === 'filter' ? this.objectToQueryString(str[key]) : (key.toString() + '=' + String(str[key]));
            }
          }
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name isNumber
         * @description check if value is a number
         * @param value {String} String
         * @returns boolean
         */
        isNumber: function (value) {
          var valueStr = String(value), i, l, pos, tmp, p = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], result;
          result = valueStr.length > 0;
          if (!valueStr) {
            return false;
          }
          for (i = 0, l = valueStr.length; i < l; i += 1) {
            tmp = valueStr.substring(i, i + 1);
            pos = p.indexOf(tmp);
            if (pos === -1) {
              result = false;
              break;
            }
          }
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name dateSeparator
         * @description returns date separator
         * @param format {String} date format
         * @returns String
         */
        dateSeparator: function (format) {
          var sep, tmp = format;
          if (tmp) {
            tmp = tmp.replace(/m/gi, '');
            tmp = tmp.replace(/d/gi, '');
            tmp = tmp.replace(/y/gi, '');
            sep = tmp[0];
          }
          return sep;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name validateDate
         * @description validate date
         * @param value {String} date
         * @param format {String} date format
         * @returns Boolean
         */
        validateDate: function (value, format) {
          var sep, i, l, f, z, zn, pos, val, frmt = format || DateService.getFormat(), result = true;
          if (!value) {
            return false;
          }
          sep = this.dateSeparator(frmt);
          val = value.split(sep);
          f = frmt.split(sep);
          result = val.length === 3;
          if (result) {
            for (i = 0, l = f.length; i < l; i += 1) {
              z = f[i].toUpperCase();
              // mark years
              if (z.indexOf('Y') > -1) {
                pos = i;
                zn = f[i];
              }
            }
            for (i = 0, l = val.length; i < l; i += 1) {
              result = result && (this.isNumber(val[i]) || (f[i].indexOf(' ') > -1 && this.isNumber(val[i].replace(/ /g, ''))));
              // check years
              if (pos === i) {
                result = result && ((zn.length === val[i].length) || (zn.replace(/ /g, '').length === 1 && val[i].replace(/ /g, '').length === 4));
              }
            }
          }
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name setDateFormat
         * @description set date format for specified fields type DATE
         * @param obj {Object}
         * @param fields {array} array of fields
         * @returns Object
         */
        // NEZ TO ODKOMENTUJES, ZEPTEJ SE PROC JE TO TREBA !!!
        /*setDateFormat: function (obj, fields) {
         var d, m, y, f, i, l, z, key, str = {}, pos, tmp, sep, tmpH, frmt = Constants.DATE_FORMAT, formatedDate;
         if (frmt) {
         sep = this.dateSeparator(frmt);
         f = frmt.split(sep);
         for (key in obj) {
         if (obj.hasOwnProperty(key)) {
         formatedDate = '';
         tmp = key.toString();
         pos = fields.indexOf(tmp);
         str[key] = obj[key];
         if (pos > -1 && str[key]) {
         tmpH = new Date(str[key]);
         d = tmpH.getDate();
         m = tmpH.getMonth() + 1;
         y = tmpH.getFullYear();
         for (i = 0, l = f.length; i < l; i += 1) {
         z = f[i].toUpperCase();
         if (formatedDate) {
         formatedDate += sep;
         }
         if (z[0] === 'M') {
         formatedDate += m;
         }
         if (z[0] === 'D') {
         formatedDate += d;
         }
         if (z[0] === 'Y') {
         formatedDate += y;
         }
         }
         }
         if (formatedDate) {
         obj[key] = formatedDate;
         }
         }
         }
         }
         return obj;
         },*/
        /**
         * @memberof ToolsService
         * @method
         * @name join
         * @description join array with str
         * @param arr {Array}
         * @param str {String} string for join array
         * @returns String
         */
        join: function (arr, str) {
          var i, l, tmpArr = [];
          for (i = 0, l = arr.length; i < l; i += 1) {
            if (arr[i] && arr[i].length > 0) {
              tmpArr.push(arr[i]);
            }
          }
          return tmpArr.join(str);
        },
        /**
         * @memberof ToolsService
         * @method
         * @name getColorEventForCalendar
         * @description color for type of event calendar
         * @param event {Object}
         * @returns String
         */
        getColorEventForCalendar: function (event) {
          var result;
          // for appointment
          if (event.type === Constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
            // set color for type
            switch (parseInt(event.typeId, 10)) {
              case 1:
                result = 'SkyBlue';
                break;
              case 2:
                result = 'YellowGreen';
                break;
              case 3:
                result = 'Blue';
                break;
              case 4:
                result = 'DarkGreen';
                break;
            }
          }
          // for reminder
          if (event.type === Constants.TYPE_CALENDAR_EVENT_REMINDER) {
            // set color for type
            result = 'Orange';
          }
          return result;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name objectWithBooleanToArray
         * @description convert object with boolean properties to array
         * @param obj {Object}
         * @returns Array
         */
        objectWithBooleanToArray: function (obj) {
          var key, items = [];
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (obj[key]) {
                items.push(key);
              }
            }
          }
          return items;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name objectFromArrayByGroup
         * @description create object from array
         * @param array {Array}
         * @returns Object
         */
        objectFromArrayByGroup: function (array, primarySearchFieldName) {
          var i, l, newObject = {};
          for (i = 0, l = array.length; i < l; i += 1) {
            if (newObject[array[i][primarySearchFieldName]]) {
              newObject[array[i][primarySearchFieldName]].rows.push(array[i]);
            } else {
              newObject[array[i][primarySearchFieldName]] = {rows: []};
              //newObject[array[i][primarySearchFieldName]].rows = [];
              newObject[array[i][primarySearchFieldName]].rows.push(array[i]);
            }
          }
          return newObject;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name sortArrayWithObjectsIntoGroups
         * @description sort array data with arg
         * @param arrayData {Array} data(array objects) for sort
         * @param fieldName {String} name of field for sort
         * @param arraySort {Array} sort values(String, Number) pattern for sort
         * @returns Object
         */
        sortArrayWithObjectsIntoGroups: function (arrayData, fieldName, arraySort) {
          var i, l, arrayResult = {}, pos;
          // initialization object with arrays
          for (i = 0, l = arraySort.length; i < l; i += 1) {
            arrayResult[arraySort[i]] = [];
          }
          // sort
          for (i = 0, l = arrayData.length; i < l; i += 1) {
            pos = arraySort.indexOf(arrayData[i][fieldName]);
            if (!arrayResult[arraySort[pos]]) {
              arrayResult[arraySort[pos]] = [];
            }
            arrayResult[arraySort[pos]].push(arrayData[i]);
          }
          arrayResult.count = arrayData.length || 0;
          return arrayResult;
        },
        /**
         * @memberof ToolsService
         * @method
         * @name timer
         * @description timer
         * @param obj {Object} object
         * @param name {String} name of property
         * @param miliseconds {Number} time delay
         * @returns void
         */
        timer: function (obj, name, miliseconds) {
          var leaves, fce;
          leaves = miliseconds;
          fce = function () {
            leaves -= 1000;
            obj[name] = leaves / 1000;
            if (leaves > 0) {
              $timeout(fce, 1000);
            }
          };
          $timeout(fce, 1000);
        }
      };
    }]);
