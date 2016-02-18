'use strict';

describe('Filter: filterWithout', function () {

  // load the filter's module
  beforeEach(module('crmPostgresWebApp'));

  // initialize a new instance of the filter before each test
  var filterWithout;
  beforeEach(inject(function ($filter) {
    filterWithout = $filter('filterWithout');
  }));

  it('should return the input prefixed with "filterWithout filter:"', function () {
    var input = [{id: 1}, {id: 2}], obj = {id: 1};
    expect(filterWithout(input, obj)[0]).toEqual(input[1]);
    expect(filterWithout(input, obj)[0].id).toEqual(input[1].id);
  });

});
