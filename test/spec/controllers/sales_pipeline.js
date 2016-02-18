/*jslint node: true, unparam: true*/
'use strict';

describe('Controller: SalesPipelineCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var SalesPipelineCtrl,
    httpBackend,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    SalesPipelineCtrl = $controller('SalesPipelineCtrl', {
      $scope: scope,
      initialData: {opportunity: {}, stages: [], stagesRows: {}}
    });
    httpBackend.whenGET('views/login.html').respond(201, '');
    httpBackend.whenGET('/api/sales-pipeline/stages/all/owners/').respond(201, []);
    httpBackend.expectGET('/api/sales-pipeline/stages/all/owners/').respond(201, [{peoplename: 'Test', owner_id: '1'}]);
  }));

  it('default - exists properties', function () {
    expect(scope.dataLoaderParams.sortField).toBe('company_name');
    expect(scope.dataLoaderParams.sortDirection).toBe('asc');
    expect(scope.dataLoaderParams.filter).toEqual({});
    expect(scope.infoPaging).toEqual([]);
    expect(scope.rowsInStage > 0).toBe(true);
    expect(scope.defaultCollapse).toBe(false);
  });

  it('init - initialization', function () {
    scope.init();
  });

  it('findStage - find stage in stages', function () {
    scope.stages = [{id: '1'}, {id: '2'}];
    expect(scope.findStage(1)).toEqual({id: '1'});
    expect(scope.findStage(2)).toEqual({id: '2'});
  });

  it('loadCurrentStage - load data for current stage', function () {
    var obj = {id: 1};
    httpBackend.expectPOST('/api/sales-pipeline/stages/').respond(201, [
      {"id": "1", "name": "Test 1"},
      {"id": "2", "name": "Test 2"}
    ]);
    scope.loadCurrentStage(obj);
    httpBackend.flush();
    expect(scope.stagesRows[obj.id].rows.length).toBe(2);
    expect(scope.stagesRows[obj.id].collapse).toBe(scope.defaultCollapse);
  });

  it('loadOwnersForStages - load owner for stages', function () {
    var vals = [
        {peoplename: 'Test', owner_id: '1'}
      ];
    httpBackend.expectGET('/api/sales-pipeline/stages/all/owners/').respond(201, vals);
    scope.loadOwnersForStages();
    httpBackend.flush();
    expect(scope.owners.length).toBe(2);
    expect(scope.dataLoaderParams.filter.owner).toEqual({peoplename: 'Všechny', owner_id: '-1'});
    expect(scope.owners[1]).toEqual(vals[0]);
  });

  it('loadAllStages - load data for all stages', function () {
    var obj = {id: 1};
    scope.stages = [obj];
    httpBackend.expectPOST('/api/sales-pipeline/stages/').respond(201, [
      {"id": "1", "name": "Test 1"},
      {"id": "2", "name": "Test 2"}
    ]);
    scope.loadAllStages();
    httpBackend.flush();
    expect(scope.stagesRows[obj.id].rows.length).toBe(2);
    expect(scope.stagesRows[obj.id].rows[0].id).toBe('1');
    expect(scope.stagesRows[obj.id].rows[1].id).toBe('2');
    expect(scope.stagesRows[obj.id].collapse).toBe(scope.defaultCollapse);
  });

  it('toggleStages - toggle stage', function () {
    var obj = {id: 1};
    scope.stagesRows = {};
    scope.stagesRows[obj.id] = {};
    scope.stagesRows[obj.id].collapse = false;
    expect(scope.stagesRows[obj.id].collapse).toBe(false);
    scope.toggleStages(obj.id);
    expect(scope.stagesRows[obj.id].collapse).toBe(true);
  });

  it('setOwner - set owner from select to model for input', function () {
    var obj = {id: 1};
    scope.setOwner(obj);
    expect(scope.dataLoaderParams.filter.owner).toEqual(obj);
  });

  it('initInfoPaging - set infoPaging property for paging informations', function () {
    scope.stages = [{id: '1'}];
    scope.infoPaging[scope.stages[0].id] = {id: 9};
    expect(scope.infoPaging[scope.stages[0].id]).toEqual({id: 9});
    scope.initInfoPaging();
    expect(scope.infoPaging[scope.stages[0].id]).toEqual({});
  });
});
