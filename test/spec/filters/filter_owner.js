'use strict';

describe('Filter: filterOwner', function () {

  // load the filter's module
  beforeEach(module('crmPostgresWebApp'));

  // initialize a new instance of the filter before each test
  var filterOwner;
  beforeEach(inject(function ($filter) {
    filterOwner = $filter('filterOwner');
  }));

  it('filter - return nur owner from list:"', function () {
    expect(JSON.stringify(filterOwner([{ownerId: 9}], {list: [{id: 9}, {id: 8}]}))).toBe(JSON.stringify([{"ownerId": 9}]));
  });

});
