/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 23.10.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file import_csv
 * @fileOverview ImportCSVService
 */

/**
 * @namespace ImportCSVService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('ImportCSVService', ['$http', '$q', 'Tools', 'AlertsService', 'Constants', function Companies($http, $q, Tools, AlertsService, Constants) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      /**
       * @memberof ImportCSVService
       * @method
       * @name listImportCsvV1
       * @description list of companies_people csv import
       * @param params {object}
       * @returns Promise
       */
      listImportCsvV1: function (params) {
        return $http.get('/api/import/csv/v1/companies-import-csv-v1?' + Tools.objectToQueryString(params))
          .error(function (data) {
            console.log(data);
          });
      }
    };
  }]);