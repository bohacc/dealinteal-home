/*jslint node: true, unparam: true */
'use strict';

describe('Controller: OpportunityCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var OpportunityCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OpportunityCtrl = $controller('OpportunityCtrl', {
      $scope: scope,
      initialData: {opportunity: []}
    });
  }));

});
