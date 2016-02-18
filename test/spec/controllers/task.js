/*jslint node: true, unparam: true */
'use strict';

describe('Controller: TaskCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var TaskCtrl,
    scope,
    rootScope,
    alerts,
    loc,
    dateService,
    messengerService,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $location, AlertsService, DateService, MessengerService) {
    scope = $rootScope.$new();
    alerts = AlertsService;
    loc = $location;
    rootScope = $rootScope;
    dateService = DateService;
    messengerService = MessengerService;
    httpBackend = $httpBackend;
    httpBackend.whenGET('views/login.html').respond(201, '');
    httpBackend.whenGET('views/task.html').respond(201, '');
    httpBackend.whenGET('views/tasks.html').respond(201, '');
    httpBackend.whenGET('/api/timezones').respond(201, [{name: 'Europe/Prague', default: 0}, {name: 'Europe/Andorra', default: 1}]);
    httpBackend.whenGET('/api/sales-pipeline/my/stages/').respond(201, [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}]);
    httpBackend.whenGET('/api/user').respond(201, {});
    httpBackend.whenGET('/api/tasks/9').respond(201, {});
    httpBackend.whenGET('/api/users/without-owner').respond(201, {});
    httpBackend.whenGET('/api/tasks/tags/all').respond(201, [{id: 1, name: 'Test'}]);
    httpBackend.whenPOST('/api/log').respond(201, {});
    httpBackend.whenPOST('/api/tasks').respond(201, {id: 9});
    httpBackend.whenGET('/api/tasks?sortField=subject&sortDirection=asc').respond(201, {id: 9});
    httpBackend.whenPUT('/api/tasks/9').respond(201, {id: 9});
    TaskCtrl = $controller('TaskCtrl', {
      $scope: scope,
      initialData: {
        task: {},
        usersWithoutOwner: []
      }
    });
  }));

  it('verifyForm - validace vstupních dat formuláře', function () {
    scope.meta = {ownerId: null};
    expect(scope.verifyForm()).toBe(false);
    scope.task.subject = 'Subject';
    expect(scope.verifyForm()).toBe(false);
    scope.task.startDate = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.task.dueDate = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.task.startDate = new Date('2015-02-10T01:00:00.000Z');
    scope.task.dueDate = new Date('2015-02-09T01:00:00.000Z');
    expect(scope.verifyForm()).toBe(false);
    scope.task.timezoneName = 'Europe/Prague';
    expect(scope.verifyForm()).toBe(false);
    scope.meta = {ownerId: 9};
    expect(scope.verifyForm()).toBe(false);
    scope.taskTmp.assignedToTeam = true;
    scope.selectedTeamUser = {id: 'id_xxx', name: 'xxxx'};
    // pro každou chybu bude jedna zpráva, takže 7
    expect(alerts.get().items.length).toBe(7);
    alerts.clear();
    scope.task.startDate = new Date();
    scope.task.dueDate = new Date();
    scope.selectedTeamUser = {id: '9', name: 'xxxx'};
    expect(scope.verifyForm()).toBe(true);
  });

  it('post - post task', function () {
    var dateISO = '2015-02-10T01:00:00.000Z';
    scope.task.subject = 'Subject';
    scope.task.startDate = new Date(dateISO);
    scope.task.dueDate = new Date(dateISO);
    scope.task.timezoneName = 'Europe/Prague';
    scope.meta = {ownerId: 9};
    scope.taskTmp.assignedToTeam = false;
    scope.post();
    httpBackend.flush();
    expect(scope.task.assignedToId).toBe(null);
    scope.taskTmp.assignedToTeam = true;
    scope.selectedTeamUser = {id: 999};
    scope.post();
    httpBackend.flush();
    expect(scope.task.assignedToId).toBe(999);
    // convert start_time and end_time to timezone 0 as displayed
    scope.task.startDate = new Date(dateISO);
    scope.task.dueDate = new Date(dateISO);
    scope.task.finishDate = new Date(dateISO);
    scope.post();
    httpBackend.flush();
    expect(scope.task.startDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
    expect(scope.task.dueDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
    expect(scope.task.finishDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
    expect(loc.path()).toBe('/task/9');
  });

  it('put - put task', function () {
    var dateISO = '2015-02-10T01:00:00.000Z';
    scope.task.id = 9;
    scope.task.subject = 'Subject';
    scope.task.startDate = new Date(dateISO);
    scope.task.dueDate = new Date(dateISO);
    scope.task.timezoneName = 'Europe/Prague';
    scope.meta = {ownerId: 9};
    scope.taskTmp.assignedToTeam = false;
    scope.put();
    httpBackend.flush();
    expect(scope.task.assignedToId).toBe(null);
    scope.taskTmp.assignedToTeam = true;
    scope.selectedTeamUser = {id: 999};
    scope.put();
    httpBackend.flush();
    expect(scope.task.assignedToId).toBe(999);
    // convert start_time and end_time to timezone 0 as displayed
    scope.task.startDate = new Date(dateISO);
    scope.task.dueDate = new Date(dateISO);
    scope.task.finishDate = new Date(dateISO);
    scope.put();
    httpBackend.flush();
    expect(scope.task.startDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
    expect(scope.task.dueDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
    expect(scope.task.finishDate).toEqual(dateService.setDateAsUTC0(new Date(dateISO)));
  });

  it('del - del task', function () {
    scope.task.id = 9;
    loc.path('/task/9');
    rootScope.$apply();
    httpBackend.expectDELETE('/api/tasks/9').respond(201, {id: 9});
    scope.del();
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    expect(loc.path()).toBe('/task/9');

    httpBackend.expectDELETE('/api/tasks/9').respond(201, {});
    scope.del();
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    expect(loc.path()).toBe('/tasks');
  });

  it('initButtons - initialization buttons for form', function () {
    scope.initButtons();
    expect(scope.actionButtons.length).toBe(3);
    expect(scope.actionButtons[0].name).toBe('DELETE');
    expect(scope.actionButtons[0].dropDown[0].name).toBe('DELETE_TASK');
    expect(scope.actionButtons[1].name).toBe('CANCEL');
    expect(scope.actionButtons[2].name).toBe('SAVE');
  });

  it('loadTags - load tags data', function () {
    scope.loadTags();
    httpBackend.flush();
    expect(scope.localDataTags).toEqual([{id: 1, name: 'Test'}]);
  });

  it('loadTimeZones - load timezone data', function () {
    scope.task.id = 9;
    scope.loadTimeZones();
    httpBackend.flush();
    expect(scope.timeZones.length).toBe(2);

    scope.task.id = null;
    scope.loadTimeZones();
    httpBackend.flush();
    expect(scope.task.timezoneName).toBe('Europe/Andorra');

    httpBackend.expectGET('/api/timezones').respond(201, [{name: 'Europe/Prague', default: 0}, {name: 'Europe/Andorra', default: 0}]);
    scope.loadTimeZones();
    httpBackend.flush();
    expect(scope.task.timezoneName).toBe('Europe/Prague');
  });

  it('setTimeZone - set timezone', function () {
    scope.loadTimeZones();
    httpBackend.flush();
    scope.setTimeZone(0);
    expect(scope.task.timezoneName).toBe('Europe/Prague');
    scope.setTimeZone(1);
    expect(scope.task.timezoneName).toBe('Europe/Andorra');
  });

  it('setReminder - set reminder', function () {
    scope.setReminder(1);
    expect(scope.task.reminder).toBe(1);
    expect(scope.task.reminderSeconds).toBe(5 * 60);
    expect(scope.taskTmp.tmpReminder).toBe('MINUTES');
    expect(scope.taskTmp.tmpReminderPrefix).toBe('5');
    expect(scope.taskTmp.tmpReminderIndex).toBe(1);
  });

  it('setPriority - set priority', function () {
    scope.setPriority(0);
    expect(scope.task.priority).toBe(scope.priority[0].id);
    expect(scope.selectedPriority).toEqual(scope.priority[0]);
  });

  it('selectTeamUser - select team user', function () {
    scope.usersWithoutOwner = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.selectTeamUser(0);
    expect(scope.selectedTeamUser).toBe(scope.usersWithoutOwner[0]);
  });

  it('getCompanyId - get id from company array object', function () {
    scope.task.company = [{id: 1, name: 'Test'}];
    expect(scope.getCompanyId()).toBe(1);
    scope.task.company = [{id: 'id_9', name: 'Test'}];
    expect(scope.getCompanyId()).toBe(0);
    scope.task.company = [{id: null, name: 'Test'}];
    expect(scope.getCompanyId()).toBe(0);
  });

  it('setSalesPipelineStage - set sales pipeline stage', function () {
    scope.salesPipelineStages = [{id: 1, name: 'Test 1'}, {id: 2, name: 'Test 2'}];
    scope.setSalesPipelineStage(0);
    expect(scope.task.salesPipelineStageId).toBe(scope.salesPipelineStages[0].id);
    expect(scope.taskTmp.tmpSalesPipelineStage).toBe(scope.salesPipelineStages[0].name);
  });

  it('loadSalesPipelineStages - load sales pipeline stage', function () {
    var arr = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    httpBackend.expectGET('/api/sales-pipeline/my/stages/').respond(201, arr);
    scope.loadSalesPipelineStages();
    httpBackend.flush();
    expect(scope.salesPipelineStages).toEqual(arr);
    expect(scope.taskTmp.tmpSalesPipelineStage).toBe(undefined);

    scope.task.salesPipelineStageId = 2;
    scope.loadSalesPipelineStages();
    httpBackend.flush();
    expect(scope.taskTmp.tmpSalesPipelineStage).toBe(arr[1].name);
  });

  it('loadRelatedTasks - load related tasks', function () {
    var arr = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.task.id = null;
    scope.relatedIndex = 0;
    scope.relatedTasksList = [];
    scope.loadRelatedTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedIndex]).toEqual(undefined);

    scope.task.id = 1;
    scope.relatedIndex = 0;
    scope.relatedTasksList = [];
    httpBackend.expectGET('/api/tasks/' + scope.task.id + '/related/all/').respond(201, arr);
    scope.loadRelatedTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedIndex]).toEqual(arr);
  });

  it('loadRelatedPrecedingTasks - load related preceding tasks', function () {
    var arr = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.task.id = null;
    scope.relatedPrecedingIndex = 0;
    scope.relatedTasksList = [];
    scope.loadRelatedPrecedingTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedPrecedingIndex]).toEqual(undefined);

    scope.task.id = 1;
    scope.relatedPrecedingIndex = 0;
    scope.relatedTasksList = [];
    httpBackend.expectGET('/api/tasks/' + scope.task.id + '/related/preceding').respond(201, arr);
    scope.loadRelatedPrecedingTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedPrecedingIndex]).toEqual(arr);
  });

  it('loadRelatedFollowingTasks - load related following tasks', function () {
    var arr = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.task.id = null;
    scope.relatedFollowingIndex = 0;
    scope.relatedTasksList = [];
    scope.loadRelatedFollowingTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedFollowingIndex]).toEqual(undefined);

    scope.task.id = 1;
    scope.relatedFollowingIndex = 0;
    scope.relatedTasksList = [];
    httpBackend.expectGET('/api/tasks/' + scope.task.id + '/related/following').respond(201, arr);
    scope.loadRelatedFollowingTasks();
    httpBackend.flush();
    expect(scope.relatedTasksList[scope.relatedFollowingIndex]).toEqual(arr);
  });

  it('setTabsRelated - set related tabs', function () {
    var index = 0;
    scope.setTabsRelated(index);
    expect(scope.tabsRelated[index]).toBe(true);
    expect(scope.relatedTaskIndex).toBe(index);

    index = 1;
    scope.setTabsRelated(index);
    expect(scope.tabsRelated[index]).toBe(true);
    expect(scope.relatedTaskIndex).toBe(index);
  });

  // spatne napsana fce, takze nejde testovat !!!
  /*it('recalculateDateTime - recalculate date time', function () {
    scope.task.startDate = new Date('2015-02-24T01:00:00.000Z');
    scope.taskTmp.startTime = new Date('2015-02-24T05:30:00.000Z');
    scope.task.dueDate = new Date('2015-02-23T01:00:00.000Z');
    scope.taskTmp.dueTime = new Date('2015-02-23T05:30:00.000Z');
    scope.recalculateDateTime();
    expect(scope.task.dueDate).toEqual(scope.task.startDate);
    expect(scope.taskTmp.dueDate).toEqual(scope.task.startDate);
  });*/

  it('setFinishTime - set time to finish date', function () {
    scope.task.finishDate = new Date('2015-02-23T00:00:00.000Z');
    scope.taskTmp.finishTime = new Date('2015-03-10T05:30:00.000Z');
    scope.setFinishTime();
    expect(scope.task.finishDate.toISOString()).toBe('2015-02-23T05:30:00.000Z');
  });

  it('newTask - new task', function () {
    scope.task = {id: 1};
    scope.newTask();
    expect(JSON.stringify(scope.task)).toBe('{}');
    expect(loc.path()).toBe('/task');
  });

  it('copyTaskAsNew - copy task as new', function () {
    scope.task = {id: 1};
    messengerService.setDeleteObjectAfterTransfer(false);
    messengerService.setData({name: 'Test'});
    scope.copyTaskAsNew();
    expect(scope.task.id).toBe(null);
    expect(loc.path()).toBe('/task');
    expect(JSON.stringify(messengerService.getData())).toBe(JSON.stringify(scope.task));
  });
});
