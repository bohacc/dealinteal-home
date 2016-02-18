'use strict';

describe('Controller: PipelineSetupCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var PipelineSetupCtrl,
    alerts,
    httpBackend,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, AlertsService) {
    scope = $rootScope.$new();
    alerts = AlertsService;
    httpBackend = $httpBackend;
    PipelineSetupCtrl = $controller('PipelineSetupCtrl', {
      $scope: scope,
      initialData: {}
    });
    httpBackend.whenGET('views/login.html').respond(201, '');
    httpBackend.whenPOST('/api/log').respond(201, {});
  }));

  it('initButtons', function () {
    var i, l, testButt = 0;
    scope.initButtons();
    expect(scope.pipelines.actionButtons.length).toBe(3);
    for (i = 0, l = scope.pipelines.actionButtons.length; i < l; i += 1) {
      if (scope.pipelines.actionButtons[i].name === 'DELETE') {
        expect(scope.pipelines.actionButtons[i].disabled).toEqual(jasmine.any(Function));
        expect(scope.pipelines.actionButtons[i].onClick).toEqual(scope.del);
        testButt += 1;
      }
      if (scope.pipelines.actionButtons[i].name === 'CANCEL') {
        expect(scope.pipelines.actionButtons[i].disabled).toEqual(jasmine.any(Function));
        testButt += 1;
      }
      if (scope.pipelines.actionButtons[i].name === 'SAVE') {
        expect(scope.pipelines.actionButtons[i].disabled).toEqual(jasmine.any(Function));
        testButt += 1;
      }
    }
    expect(testButt).toBe(3);
  });

  it('verifyForm - validation form data', function () {
    var obj = {};
    scope.pipelines.activeStageIndex = 0;
    scope.config.stages = [obj];
    expect(scope.verifyForm()).toBe(false);

    obj.name = 'Test';
    expect(scope.verifyForm()).toBe(false);

    expect(alerts.get().items.length).toBe(2);

    alerts.clear();
    obj.chance = 1;
    expect(scope.verifyForm()).toBe(true);

    scope.pipelines.activeStageIndex = -1;
    expect(scope.verifyForm()).toBe(false);

    obj = {};
    scope.config.newStage = obj;
    obj.name = 'Test';
    expect(scope.verifyForm()).toBe(false);

    obj.chance = 1;
    expect(scope.verifyForm()).toBe(true);
  });

  it('verifyBeforeDeleteStage - validation form data before delete stage', function () {
    scope.pipelines.selectedStageForMove = {};
    expect(scope.verifyBeforeDeleteStage()).toBe(false);

    scope.pipelines.selectedStageForMove = {id: 1};
    expect(scope.verifyBeforeDeleteStage()).toBe(true);
  });

  it('post - post stage', function () {
    scope.pipelines.activeStageIndex = -1;
    scope.config.stages = [];
    scope.config.newStage = {name: 'Test', chance: 1};
    httpBackend.whenPOST('/api/sales-pipeline-stages').respond(201, {id: 1});
    httpBackend.whenGET('/api/sales-pipeline-stages/').respond(201, [{id: 1}, {id: 2}]);
    scope.post();
    httpBackend.flush();
    expect(scope.pipelines.activeStageIndex).toBe(null);
    expect(scope.config.stages.length).toBe(2);
  });

  it('put - put stage', function () {
    scope.pipelines.activeStageIndex = 0;
    scope.config.stages = [{id: 1, name: 'Test', chance: 1}];
    scope.put();
  });

  it('del - delete stage - dialog', function () {
    scope.pipelines.showDeleteDialog = false;
    scope.del();
    expect(scope.pipelines.showDeleteDialog).toBe(true);
  });

  it('deleteStage - delete stage', function () {
    scope.pipelines.activeStageIndex = 0;
    scope.config.stages = [{id: 1, name: 'Test', chance: 1}];
    scope.pipelines.selectedStageForMove = scope.config.stages[0];
    httpBackend.whenPUT('/api/sales-pipeline-stages/replace/1').respond(201, {id: 1});
    scope.deleteStage();
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    expect(scope.pipelines.activeStageIndex).toBe(null);
    expect(scope.config.stages.length).toBe(0);
  });

  it('newStage - new stage', function () {
    scope.pipelines.activeStageIndex = null;
    scope.config.newStage.name = 'Test';
    //scope.$apply();
    //expect(scope.pageAncestor.log.changes.isChanged).toBe(true);
    scope.newStage();
    //expect(scope.pageAncestor.log.changes.isChanged).toBe(false);
    expect(scope.pipelines.activeStageIndex).toBe(-1);
  });

  it('openDetail - open detail', function () {
    scope.pipelines.selectedStageForMove = {id: 1};
    scope.pipelines.activeStageIndex = null;
    scope.pipelines.showDeleteDialog = true;
    scope.openDetail(1);
    expect(scope.pipelines.activeStageIndex).toBe(1);
    expect(scope.pipelines.showDeleteDialog).toBe(false);
    expect(scope.pipelines.selectedStageForMove).toEqual({});
  });

  it('refreshAfterInsert - refresh after insert', function () {
    scope.pipelines.activeStageIndex = 0;
    httpBackend.whenGET('/api/sales-pipeline-stages/').respond(201, [{id: 1}, {id: 2}]);
    scope.refreshAfterInsert({id: 1});
    httpBackend.flush();
    expect(scope.pipelines.activeStageIndex).toBe(null);
    expect(scope.config.stages.length).toBe(2);
  });

  it('refreshAfterDelete - refresh after delete', function () {
    scope.pipelines.activeStageIndex = 0;
    scope.config.stages = [{id: 1, name: 'Test', chance: 1}];
    scope.refreshAfterDelete({id: 1}, 0);
    expect(scope.pipelines.activeStageIndex).toBe(null);
    expect(scope.config.stages.length).toBe(0);
  });

  it('setStageForMove - set stage for move', function () {
    scope.pipelines.selectedStageForMove = {};
    scope.config.stages = [{id: 1}, {id: 2}];
    scope.setStageForMove(scope.config.stages[0]);
    expect(scope.pipelines.selectedStageForMove).toBe(scope.config.stages[0]);

    scope.setStageForMove(scope.config.stages[1]);
    expect(scope.pipelines.selectedStageForMove).toBe(scope.config.stages[1]);
  });
});
