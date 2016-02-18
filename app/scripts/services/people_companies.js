/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file people_companies
 * @fileOverview PeopleCompaniesService
 */

/**
 * @namespace PeopleCompaniesService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('PeopleCompaniesService', ['$http', function PeopleCompaniesService($http) {
    /**
     * @memberof PeopleCompaniesService
     * @method
     * @name revokePeople
     * @description revoke people from company
     * @param obj {Object} obj
     * @returns HttpPromise
     */
    this.revokePeople = function (obj) {
      return $http.delete('/api/people-companies/company/' + obj.companyId + '/people/' + obj.people.join(','), {cache: false});
    };
  }]);
