/*jslint node: true, unparam: true */
'use strict';

describe('Controller: AppointmentCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var AppointmentCtrl,
    scope,
    alerts,
    httpBackend,
    llocation,
    constants,
    //defaultTypeId,
    //defaultTypeName,
    //defaultTypeAddMs,
    defaultPlaceId,
    defaultPlaceName,
    timezonePromise,
    dateService,
    messengerService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $location, $rootScope, $httpBackend, AlertsService, DateService, MessengerService, Constants) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.whenGET('views/login.html').respond(201, '');
    httpBackend.whenGET('/api/tasks?appointmentId=undefined').respond(201, []);
    timezonePromise = httpBackend.whenGET('/api/timezones').respond(201, [
      {"id": "1", "name": "Europe/Andorra", "default": 1},
      {"id": "2", "name": "Asia/Dubai", "default": 0}
    ]);
    httpBackend.whenGET('/api/appointment/tags').respond(201, [
      {"id": "60", "name": "boj"},
      {"id": "54", "name": "Hospoda"},
      {"id": "63", "name": "licence"}
    ]);
    httpBackend.whenGET('/api/appointment/types').respond(201, [
      {"id": "2", "name": "ALL_DAY_EVENT"},
      {"id": "3", "name": "BUSINESS_MEETING"},
      {"id": "4", "name": "OTHER_APPOINTMENT"},
      {"id": "1", "name": "PHONE_CALL"}
    ]);
    httpBackend.whenGET('/api/users').respond(201, [
      {"id": "6", "name": "Martin Boháč"},
      {"id": "8", "name": "Lubor Kemza"},
      {"id": "7", "name": "Pavel Kolomazník"},
      {"id": "22", "name": "Jan Sádlo"},
      {"id": "9", "name": "Jitka Veselá"}
    ]);
    httpBackend.whenGET('/api/people/login-user/latest-address').respond(201, [
      {"id": "145", "name": "Blanická 553/16, Praha 2, 12000, Česká republika"},
      {"id": "142", "name": "Blanická 553/16, Praha 2, 1200"},
      {"id": "140", "name": "V PRÁCI 6"}
    ]);
    httpBackend.whenGET('/api/sales-pipeline/my/stages/').respond(201, [
      {"id": "1", "name": "Lead / New Opportunity"},
      {"id": "2", "name": "Prospecting"},
      {"id": "3", "name": "Preapproach"},
      {"id": "4", "name": "Approach"},
      {"id": "5", "name": "Need assessment"},
      {"id": "6", "name": "Presentation"},
      {"id": "7", "name": "Meeting objections"},
      {"id": "8", "name": "Gaining commitment"},
      {"id": "9", "name": "Follow-up"}
    ]);
    AppointmentCtrl = $controller('AppointmentCtrl', {
      $scope: scope,
      initialData: {
        appointment: {},
        places: [
          {"id": "1", "name": "AT_OFFICE"},
          {"id": "3", "name": "ELSEWHERE"},
          {"id": "2", "name": "HOME"}
        ],
        types: [
          {"id": "1", "name": "PHONE_CALL"},
          {"id": "2", "name": "ALL_DAY_EVENT"},
          {"id": "3", "name": "BUSINESS_MEETING"},
          {"id": "4", "name": "OTHER_APPOINTMENT"}
        ]
      }
    });
    alerts = AlertsService;
    dateService = DateService;
    llocation = $location;
    messengerService = MessengerService;
    constants = Constants;
    //defaultTypeId = 3;
    //defaultTypeName = 'BUSINESS_MEETING';
    //defaultTypeAddMs = 2 * 60 * 60 * 1000;
    defaultPlaceId = 3;
    defaultPlaceName = 'ELSEWHERE';
    scope.salesPipelineStages = [
      {id: 1, name: "Lead / New Opportunity"},
      {id: 2, name: "Prospecting"},
      {id: 3, name: "Preapproach"},
      {id: 4, name: "Approach"},
      {id: 5, name: "Need assessment"},
      {id: 6, name: "Presentation"},
      {id: 7, name: "Meeting objections"},
      {id: 8, name: "Gaining commitment"},
      {id: 9, name: "Follow-up"}
    ];
    scope.pills = [
      {name: 'MAIN'},
      {name: 'EDITOR'},
      {name: 'TASKS'},
      {name: 'ATTACHMENTS'}
    ];
  }));

  it('initButtons - inicializace action buttons', function () {
    scope.initButtons();
    expect(scope.actionButtons[0].name).toBe('DELETE');
    expect(scope.actionButtons[0].dropDown[0].name).toBe('DELETE_APPOINTMENT');
    expect(scope.actionButtons[0].dropDown[0].onClick).toBe(scope.del);
    expect(scope.actionButtons[0].dropDown[0].disabled()).toBe(true);
    expect(scope.actionButtons[0].disabled).toBe(true);
    expect(scope.actionButtons[1].name).toBe('CANCEL');
    expect(scope.actionButtons[1].onClick).toBe(scope.pageAncestor.cancel);
    //expect(scope.actionButtons[1].disabled()).toBe(false);
    expect(scope.actionButtons[2].name).toBe('SAVE');
    expect(scope.actionButtons[2].dropDown.length).toBe(3);
    //expect(scope.actionButtons[2].dropDown[0].onClick).toBe(scope.post);
    expect(scope.actionButtons[2].dropDown[0].disabled()).toBe(false);
    expect(scope.actionButtons[2].dropDown[1].disabled()).toBe(false);
    expect(scope.actionButtons[2].dropDown[2].disabled()).toBe(false);
    scope.actionButtons[2].dropDown[1].onClick();
    expect(scope.actionButtons[2].dropDown[1].disabled()).toBe(false);
  });

  it('verifyForm - validace vstupních dat formuláře', function () {
    expect(scope.verifyForm()).toBe(false);
    scope.appointment.type_id = 1;
    expect(scope.verifyForm()).toBe(false);
    scope.appointment.place = 1;
    expect(scope.verifyForm()).toBe(false);
    scope.appointment.start_time = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.appointment.end_time = new Date();
    expect(scope.verifyForm()).toBe(false);
    scope.appointment.start_time = new Date(2014, 11, 4);
    scope.appointment.end_time = new Date(2014, 11, 3);
    expect(scope.verifyForm()).toBe(false);
    // pro každou chybu bude jedna zpráva, takže 6
    expect(alerts.get().items.length).toBe(6);
    alerts.clear();
    scope.appointment.start_time = new Date();
    scope.appointment.end_time = new Date();
    scope.appointment.timezone_name = 'Europe/Prague';
    expect(scope.verifyForm()).toBe(true);
  });

  // move to AppointmentService
  /*it('setDefaultType - defaultní nastavení type_id', function () {
    scope.setDefaultType();
    expect(scope.appointment.type_id).toBe(defaultTypeId);
    expect(scope.appointmentTmp.tmpTypeName).toBe(defaultTypeName);
    expect(scope.appointmentTmp.tmpTypeItem.id).toBe('3');
    expect(scope.appointmentTmp.tmpTypeItem.name).toBe(defaultTypeName);
    expect(scope.appointmentTmp.tmpTypeItem.addMs).toBe(defaultTypeAddMs);
    // pokud bude zazanm existovat, musi se nastavit podle konkretniho type_id
    scope.appointment.type_id = 1;
    scope.setDefaultType();
    expect(scope.appointmentTmp.tmpTypeName).toBe('PHONE_CALL');
    expect(scope.appointmentTmp.tmpTypeItem.id).toBe('1');
    expect(scope.appointmentTmp.tmpTypeItem.name).toBe('PHONE_CALL');
    expect(scope.appointmentTmp.tmpTypeItem.addMs).toBe(15 * 60 * 1000);
  });*/

  it('setDefaultPlaces - defaultní nastavení place', function () {
    scope.setDefaultPlaces();
    expect(scope.appointment.place).toBe(defaultPlaceName);
    expect(scope.appointmentTmp.tmpPlaceId).toBe(defaultPlaceId);
    // pro existujici zaznam
    scope.appointment.place = 'TEST';
    scope.appointmentTmp.tmpPlaceId = null;
    scope.setDefaultPlaces();
    expect(scope.appointment.place).toBe('TEST');
    expect(scope.appointmentTmp.tmpPlaceId).toBe(null);
  });

  it('loadTimeZones - nahrani timezone a nastaveni vychozi', function () {
    scope.appointment.id = 1;
    scope.appointment.timezone_name = 'America/Antigua';
    scope.loadTimeZones();
    expect(scope.appointment.timezone_name).toBe('America/Antigua');
    scope.appointment.id = null;
    scope.appointment.timezone_name = null;
    scope.timeZones = [];
    // s defaultni hodnotou podle uzivatele
    timezonePromise.respond([{"id": "1", "name": "Europe/Andorra", "default": 0}, {"id": "2", "name": "Asia/Dubai", "default": 1}]);
    httpBackend.flush();
    scope.loadTimeZones();
    expect(scope.appointment.timezone_name).toBe('Asia/Dubai');
    scope.timeZones = [];
    // bez defaultni hodnoty podle uzivatele
    timezonePromise.respond([{"id": "1", "name": "Europe/Andorra", "default": 0}, {"id": "2", "name": "Asia/Dubai", "default": 0}]);
    httpBackend.flush();
    scope.loadTimeZones();
    expect(scope.appointment.timezone_name).toBe('Europe/Andorra');
  });

  it('setType - nastaveni type_id', function () {
    scope.setType(3); // index, ID = 4
    expect(scope.appointment.type_id).toBe('4');
    expect(scope.appointmentTmp.tmpTypeName).toBe('OTHER_APPOINTMENT');
    expect(scope.appointmentTmp.tmpTypeItem.id).toBe('4');
    expect(scope.appointmentTmp.tmpTypeItem.name).toBe('OTHER_APPOINTMENT');
  });

  it('getCompanyId - ziskani comapny id z pomocneho pole', function () {
    expect(scope.getCompanyId()).toBe(0);
    scope.appointment.company = [{name: null}];
    expect(scope.getCompanyId()).toBe(0);
    scope.appointment.company = [{id: 1}];
    expect(scope.getCompanyId()).toBe(1);
  });

  it('setSalesPipelineStage - nastavení sales pipeline', function () {
    scope.loadSalesPipelineStages();
    httpBackend.flush();
    scope.setSalesPipelineStage(0);
    expect(scope.appointment.sales_pipeline_stage_id).toBe('1');
    expect(scope.appointmentTmp.tmpSalesPipelineStage).toBe('Lead / New Opportunity');
  });

  it('setTimeZone - nastavení timezone', function () {
    scope.loadTimeZones();
    httpBackend.flush();
    scope.setTimeZone(0);
    expect(scope.appointment.timezone_name).toBe('Europe/Andorra');
    scope.setTimeZone(1);
    expect(scope.appointment.timezone_name).toBe('Asia/Dubai');
  });

  it('setDateTimeTo - nastavení času - timeTo', function () {
    var ms = 60 * 60 * 1000, dateISO = '2014-12-05T02:25:19.000Z', dateISOStart = '2014-12-05T01:25:19.000Z';
    scope.appointment.start_time = new Date(dateISOStart);
    scope.appointmentTmp.tmpEndDate = null;
    scope.appointmentTmp.tmpEndTime = null;
    scope.appointment.end_time = null;
    scope.setDateTimeTo(ms);
    expect(scope.appointmentTmp.tmpEndDate).toBe(dateISO);
    expect(scope.appointmentTmp.tmpEndTime).toBe(dateISO);
    expect(scope.appointment.end_time).toBe(dateISO);
  });

  it('getMillisecondsForType - milisekundy podle typu', function () {
    var ms = [15 * 60 * 1000, 0, 2 * 60 * 60 * 1000, 60 * 60 * 1000];
    scope.appointment.type_id = 1;
    expect(scope.getMillisecondsForType()).toBe(ms[0]);
    scope.appointment.type_id = 2;
    expect(scope.getMillisecondsForType()).toBe(ms[1]);
    scope.appointment.type_id = 3;
    expect(scope.getMillisecondsForType()).toBe(ms[2]);
    scope.appointment.type_id = 4;
    expect(scope.getMillisecondsForType()).toBe(ms[3]);
  });

  it('setDateFrom - nastavení datumu dateFrom', function () {
    var date = (new Date()).toISOString(), index = 1, dateTest, newDate;
    // 1
    scope.appointment.start_time = null;
    scope.setDateFrom(index);
    dateTest = dateService.round(dateService.addMilliseconds(date, scope.listDateFrom[index].value), scope.listDateFrom[index].rounding, scope.listDateFrom[index].roundingLevel).toISOString();
    expect(scope.appointment.start_time.toISOString().substring(0, 16)).toBe(dateTest.substring(0, 16));
    // 2
    httpBackend.expectGET('/api/appointment/login-user/next-free-time').respond(201, {next_free_time: '2014-12-01T01:00:00.000Z'});
    index = 0;
    scope.appointment.start_time = null;
    scope.setDateFrom(index);
    httpBackend.flush();
    dateTest = new Date();
    dateTest.setSeconds(0);
    dateTest.setMilliseconds(0);
    dateTest = (new Date(dateTest)).toISOString();
    expect(scope.appointment.start_time.toISOString()).toBe(dateTest);
    // 3
    newDate = new Date((new Date()).setMilliseconds(60 * 60 * 1000));
    httpBackend.expectGET('/api/appointment/login-user/next-free-time').respond(201, {next_free_time: newDate});
    index = 0;
    scope.appointment.start_time = null;
    scope.setDateFrom(index);
    httpBackend.flush();
    dateTest = newDate;
    dateTest = (new Date(dateTest)).toISOString();
    expect(scope.appointment.start_time.toISOString()).toBe(dateTest);
  });

  it('setReminder - nastavení reminderu', function () {
    var index = 0;
    scope.setReminder(index);
    expect(scope.appointment.reminder).toBe(0);
    expect(scope.appointment.reminder_seconds).toBe(0);
    expect(scope.appointmentTmp.tmpReminder).toBe(scope.listReminder[index].name);
    expect(scope.appointmentTmp.tmpReminderPrefix).toBe(scope.listReminder[index].prefix);
    expect(scope.appointmentTmp.tmpReminderIndex).toBe(scope.listReminder[index].id);
    index = 2;
    scope.setReminder(index);
    expect(scope.appointment.reminder).toBe(1);
    expect(scope.appointment.reminder_seconds).toBe(600);
  });

  it('setReminderTeamMembers - nastavení team reminderu', function () {
    var index = 0;
    scope.setReminderTeamMembers(index);
    expect(scope.appointment.team_reminder).toBe(0);
    expect(scope.appointment.team_reminder_seconds).toBe(0);
    expect(scope.appointmentTmp.tmpTeamReminderPrefix).toBe(scope.listReminder[index].prefix);
    expect(scope.appointmentTmp.tmpTeamReminder).toBe(scope.listReminder[index].name);
    index = 2;
    scope.setReminderTeamMembers(index);
    expect(scope.appointment.team_reminder).toBe(1);
    expect(scope.appointment.team_reminder_seconds).toBe(600);
  });

  it('setReminderAttendees - nastavení attende reminderu', function () {
    var index = 0;
    scope.setReminderAttendees(index);
    expect(scope.appointment.attendee_reminder).toBe(0);
    expect(scope.appointment.attendee_reminder_seconds).toBe(0);
    expect(scope.appointmentTmp.tmpAttendeeReminderPrefix).toBe(scope.listReminder[index].prefix);
    expect(scope.appointmentTmp.tmpAttendeeReminder).toBe(scope.listReminder[index].name);
    index = 2;
    scope.setReminderAttendees(index);
    expect(scope.appointment.attendee_reminder).toBe(1);
    expect(scope.appointment.attendee_reminder_seconds).toBe(600);
  });

  it('setPlace - nastavení místa', function () {
    var index = 0;
    scope.setPlace(index);
    expect(scope.appointment.place).toBe(scope.appointmentPlaces[index].name);
    expect(scope.appointmentTmp.tmpPlaceId).toBe(scope.appointmentPlaces[index].id);
  });

  it('openRecord - open record after insert/update', function () {
    var obj = {};
    llocation.path('/appointment/1');
    scope.appointment = {id: 1};
    scope.openRecord(obj);
    expect(llocation.path()).toBe('/appointment/1');

    scope.appointment = {id: null};
    obj = {id: 9};
    llocation.path('/appointment');
    scope.openRecord(obj);
    expect(llocation.path()).toBe('/appointment/' + obj.id);
  });

  it('onSelectOpportunity - set after select opportunity in box', function () {
    var obj = {id: 1, name: '', stageId: 9}, index = 8;
    scope.salesPipelineStages = [
      {id: 1, name: "Lead / New Opportunity"},
      {id: 2, name: "Prospecting"},
      {id: 3, name: "Preapproach"},
      {id: 4, name: "Approach"},
      {id: 5, name: "Need assessment"},
      {id: 6, name: "Presentation"},
      {id: 7, name: "Meeting objections"},
      {id: 8, name: "Gaining commitment"},
      {id: 9, name: "Follow-up"}
    ];
    scope.onSelectOpportunity(obj);
    expect(scope.appointment.sales_pipeline_stage_id).toBe(scope.salesPipelineStages[index].id);
    expect(scope.appointmentTmp.tmpSalesPipelineStage).toBe(scope.salesPipelineStages[index].name);
  });

  it('onDeleteOpportunity - set after delete opportunity in box', function () {
    var index = 5;
    scope.onDeleteOpportunity(index);
    expect(scope.appointment.sales_pipeline_stage_id).toBe(scope.salesPipelineStages[0].id);
    expect(scope.appointmentTmp.tmpSalesPipelineStage).toBe(scope.salesPipelineStages[0].name);
  });

  it('newAppointment - new appointment', function () {
    scope.appointment = {id: 1};
    scope.newAppointment();
    expect(JSON.stringify(scope.appointment)).toBe('{"id":1}');
    scope.appointment = {id: null};
    scope.newAppointment();
    expect(JSON.stringify(scope.appointment)).toBe('{}');
    expect(llocation.path()).toBe('/appointment');
  });

  it('copyAppointmentAsNew - copy appointment as new', function () {
    scope.appointment = {id: 1};
    scope.copyAppointmentAsNew();
    expect(scope.appointment.id).toBe(null);
    expect(llocation.path()).toBe('/appointment');
  });

  it('openInCalendar - open in calendar', function () {
    var mess;
    scope.appointment = {id: 1, start_time: '2015-10-02T00:00:00.000Z'};
    messengerService.setDeleteObjectAfterTransfer(false);
    scope.openInCalendar();
    mess = messengerService.getData();
    expect(llocation.path()).toBe('/calendar');
    expect(mess.appointmentId).toBe(scope.appointment.id);
    expect(mess.defaultView).toBe(constants.FULLCALENDAR_WEEK_AGENDA);
    expect(mess.scrollTime).toBe('00:00:00');
    expect(mess.defaultCalendarDate).toBe(scope.appointment.start_time);
  });

  it('openInAgenda - open in agenda', function () {
    var mess;
    scope.appointment.id = 1;
    scope.appointment.start_time = '2015-10-02T00:00:00.000Z';
    messengerService.setDeleteObjectAfterTransfer(false);
    scope.openInAgenda();
    mess = messengerService.getData();
    expect(llocation.path()).toBe('/agenda');
    expect(mess.selectedDate).toBe(scope.appointment.start_time);
  });

  it('showPill - show and open pill and show main pill', function () {
    scope.activePillsIndex = 0;
    scope.pills[0].active = true;
    scope.showPill(1);
    expect(scope.pills[0].active).toBe(false);
    expect(scope.pills[1].active).toBe(true);
    expect(scope.activePillsIndex).toBe(1);
    scope.showPill(3);
    expect(scope.pills[1].active).toBe(false);
    expect(scope.pills[3].active).toBe(true);
    expect(scope.activePillsIndex).toBe(3);
  });

  it('deleteDetailedDescription - delete text and hide text pill', function () {
    scope.appointment.text = {id: 1, text: 'něco'};
    scope.activePillsIndex = 1;
    scope.pills[0].active = false;
    scope.pills[1].active = true;
    httpBackend.expectDELETE('/api/texts/1').respond(201, {});
    scope.deleteDetailedDescription();
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    expect(scope.pills[0].active).toBe(true);
    expect(scope.activePillsIndex).toBe(0);
  });

  it('setPillsDefault - default setings of pills', function () {
    scope.appointment.attachmentId = 10;
    scope.activePillsIndex = 3;
    scope.pills[3].active = true;
    scope.setPillsDefault();
    expect(scope.pills[0].active).toBe(true);
    expect(scope.activePillsIndex).toBe(0);
  });

  it('afterUpdate - after update operations', function () {
    var obj = {textId: 20};
    scope.appointment.text.id = 3;
    scope.afterUpdate(obj);
    expect(scope.appointment.text.id).toBe(obj.textId);
  });

  it('getAttachmentsCount - get attachments count', function () {

  });

  it('addAttachment - add attachment', function () {
    var index = 3;
    scope.appointment.id = 1;
    scope.addAttachment();
    expect(scope.activePillsIndex).toBe(index);
    expect(scope.pills[index].active).toBe(true);
  });

  it('addTask - add task', function () {
    scope.appointment = {id: 999};
    scope.addTask();
    expect(messengerService.getData().task.appointmentId).toBe(999);
    expect(llocation.path()).toBe(constants.ROUTES.TASK);
  });

  it('defaultObjectForTask - create object for task', function () {
    scope.appointment = {company: [{id: 1}], id: 9999, salesPipeline: [{id: 2}]};
    var obj = scope.defaultObjectForTask();
    expect(obj.task.company[0].id).toBe(1);
    expect(obj.task.salesPipeline[0].id).toBe(2);
    expect(obj.task.appointmentId).toBe(9999);
  });
});
