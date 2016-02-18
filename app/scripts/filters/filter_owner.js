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
  .filter('filterOwner', function () {
    return function (input, obj) {
      var i, l, e, j, result = [];
      if (!obj || !obj.list || !input) {
        return [];
      }
      for (e = 0, j = input.length; e < j; e += 1) {
        for (i = 0, l = obj.list.length; i < l; i += 1) {
          if (parseInt(obj.list[i].id, 10) === parseInt(input[e].ownerId, 10)) {
            result.push(input[e]);
            break;
          }
        }
      }
      return result;
    };
  });
