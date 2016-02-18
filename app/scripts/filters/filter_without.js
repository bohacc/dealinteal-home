/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file filter_owner
 * @fileOverview filterOwner
 */

/**
 * @namespace filterOwner
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .filter('filterWithout', function () {
    return function (input, obj) {
      return input.filter(function (el) {
        return el[Object.keys(obj)[0]] !== obj[Object.keys(obj)[0]];
      });
    };
  });
