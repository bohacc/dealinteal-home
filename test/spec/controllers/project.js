/*jslint node: true, unparam: true */
'use strict';

describe('Controller: ProjectCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var ProjectCtrl,
    scope,
    loc;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location) {
    scope = $rootScope.$new();
    scope.meta = {ownerId: 9, ownerName: ''};
    loc = $location;
    ProjectCtrl = $controller('ProjectCtrl', {
      $scope: scope,
      initialData: {project: {}}
    });
  }));

  it('initButtons - initialization buttons for form', function () {
    scope.initButtons();
    expect(scope.actionButtons.length).toBe(3);
    expect(scope.actionButtons[0].name).toBe('DELETE');
    expect(scope.actionButtons[0].dropDown[0].name).toBe('DELETE_PROJECT');
    expect(scope.actionButtons[1].name).toBe('CANCEL');
    expect(scope.actionButtons[2].name).toBe('SAVE');
  });

  it('newProject - new project', function () {
    scope.project = {id: 1};
    scope.newProject();
    expect(loc.path()).toBe('/project');
  });

  it('verifyForm - verifications of data', function () {
    scope.project = {};
    expect(scope.verifyForm()).toBe(false);
    scope.project.startDate = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.project.endDate = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.project.startDate = new Date('2015-02-10T01:00:00.000Z');
    scope.project.endDate = new Date('2015-02-09T01:00:00.000Z');
    expect(scope.verifyForm()).toBe(false);
    scope.project.subject = 'Test';
    expect(scope.verifyForm()).toBe(true);
  });

  it('post - post project', function () {
    scope.post();
  });

  it('put - put project', function () {
    scope.put();
  });

  it('del - delete project', function () {
    scope.del();
  });

  it('setTabs - seting tabs', function () {
    scope.project = {id: 10};
    scope.setTabs(0);
    expect(scope.tabs[0]).toBe(10);
    expect(scope.tabs[1]).toBe(false);
    scope.setTabs(1);
    expect(scope.tabs[0]).toBe(false);
    expect(scope.tabs[1]).toBe(10);
  });

  it('loadHistory - load history of project', function () {
    scope.loadHistory();
  });

  it('startProject - starting project', function () {
    scope.project.startDate = null;
    scope.startProject();
    expect(scope.project.startDate).not.toBe(null);
  });

  it('startProjectCancel - cancel of project start', function () {
    scope.project.startDate = new Date();
    scope.startProjectCancel();
    expect(scope.project.startDate).toBe('');
  });

  it('endProject - ending project', function () {
    scope.project.endDate = null;
    scope.endProject();
    expect(scope.project.endDate).not.toBe(null);
  });

  it('endProjectCancel - cancel of project end', function () {
    scope.project.endDate = new Date();
    scope.endProjectCancel();
    expect(scope.project.endDate).toBe('');
  });

  it('copyProject - copiing project', function () {
    scope.project = {
      id: 9,
      ownerName: 'test',
      startDate: new Date(),
      endDate: new Date(),
      subject: 'test',
      description: 'desc'
    };
    scope.copyProject();
    expect(scope.project.id).toBe(null);
    expect(scope.project.ownerName).toBe(null);
    expect(scope.project.startDate).toBe(null);
    expect(scope.project.endDate).toBe(null);
    expect(scope.project.subject).toBe('test');
    expect(scope.project.description).toBe('desc');
    expect(loc.path()).toBe('/project');
  });

  it('initDataForAgenda - initial data for Agenda', function () {
    scope.project = {id: 10, subject: 'Projektování'};
    scope.initDataForAgenda();
    expect(scope.dataForAgenda.appointment.projects[0].id).toBe(10);
    expect(scope.dataForAgenda.appointment.projects[0].name).toBe('Projektování');
    expect(scope.dataForAgenda.task.project[0].id).toBe(10);
    expect(scope.dataForAgenda.task.project[0].name).toBe('Projektování');
  });
});