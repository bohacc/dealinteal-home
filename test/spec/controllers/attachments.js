/*jslint node: true, unparam: true */
'use strict';

describe('Controller: AttachmentsCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var AttachmentsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AttachmentsCtrl = $controller('AttachmentsCtrl', {
      $scope: scope,
      initialData: {attachments: []}
    });
  }));

});
