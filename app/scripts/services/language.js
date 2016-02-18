/*jslint node: true */
'use strict';

/**
 * @file language
 * @fileOverview language
 */

/**
 * @namespace language
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('Language', function language() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var lang = null, langCalendar, monthNamesAll = {}, monthNames = [];
    monthNamesAll.cs = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
    monthNamesAll.sk = ["január", "február", "marec", "apríl", "máj", "jún", "júl", "august", "september", "október ", "november", "december"];
    monthNamesAll.en = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    monthNames = monthNamesAll[langCalendar || 'en'];
    return {
      /**
       * @memberof language
       * @method
       * @name getLanguage
       * @description getter for language
       * @returns String
       */
      getLanguage: function () {
        return lang;
      },
      /**
       * @memberof language
       * @method
       * @name setLanguage
       * @description setter for language
       * @param arg {String} language
       * @returns void
       */
      setLanguage: function (arg) {
        lang = arg;
        this.setLanguageCalendar(arg);
      },
      /**
       * @memberof language
       * @method
       * @name getLanguageCalendar
       * @description getter for language calendar
       * @returns String
       */
      getLanguageCalendar: function () {
        return langCalendar;
      },
      /**
       * @memberof language
       * @method
       * @name setLanguageCalendar
       * @description setter for language calendar
       * @param arg {String} language
       * @returns void
       */
      setLanguageCalendar: function (arg) {
        if (arg === 'cs-cz') {
          langCalendar = 'cs';
        } else if (arg === 'sk-sk') {
          langCalendar = 'sk';
        } else if (arg === 'en-us') {
          langCalendar = 'en';
        }
        monthNames = monthNamesAll[langCalendar];
      },
      /**
       * @memberof language
       * @method
       * @name getMonthNames
       * @description getter for names of month calendar
       * @returns String
       */
      getMonthNames: function () {
        return monthNames;
      }
    };
  });
