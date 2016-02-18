'use strict';

describe('Service: opportunity', function () {

  // load the service's module
  beforeEach(module('crmPostgresWebApp'));

  // instantiate service
  var OpportunityCtrl, scope;
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    scope.meta = {ownerName: 'Test'};
    OpportunityCtrl = $controller('OpportunityCtrl', {
      $scope: scope,
      initialData: {
        opportunity: {},
        stages: [
          {id: 1, name: "Lead / New Opportunity"},
          {id: 2, name: "Prospecting"},
          {id: 3, name: "Preapproach"},
          {id: 4, name: "Approach"},
          {id: 5, name: "Need assessment"},
          {id: 6, name: "Presentation"},
          {id: 7, name: "Meeting objections"},
          {id: 8, name: "Gaining commitment"},
          {id: 9, name: "Follow-up"}
        ]
      }
    });
  }));

  it('should do something', function () {
    //expect(!!opportunity).toBe(true);
  });

});
