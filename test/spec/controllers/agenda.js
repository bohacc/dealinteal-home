/*jslint node: true, unparam: true */
'use strict';

describe('Controller: AgendaCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var AgendaCtrl,
    rootScope,
    httpBackend,
    constants,
    dateService,
    scope,
    td,
    loc,
    alerts,
    messengerService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $location, $rootScope, $httpBackend, Constants, DateService, AlertsService, MessengerService) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    httpBackend = $httpBackend;
    constants = Constants;
    dateService = DateService;
    alerts = AlertsService;
    messengerService = MessengerService;
    loc = $location;
    scope.meta = {ownerId: 9, ownerName: ''};
    httpBackend.whenGET('views/login.html').respond(201, '');
    //httpBackend.whenGET('/api/agenda/week/2015-02-23T02:00:00.000Z').respond(201, []);
    httpBackend.whenGET('/api/agenda/week/2015-02-24T00:00:00.000Z').respond(201, []);
    httpBackend.whenGET('/api/user').respond(201, {});
    httpBackend.whenGET('/api/people/login-user/emails').respond(201, {});
    httpBackend.whenGET('views/reminder.html').respond(201, '');
    httpBackend.whenGET('views/agenda.html').respond(201, '');
    httpBackend.whenGET('views/task.html').respond(201, '');
    httpBackend.whenGET('views/appointment.html').respond(201, '');
    httpBackend.whenGET('/api/users/without-owner').respond(201, [{id: 1, name: 'Test'}]);
    httpBackend.whenGET('/api/appointment/types').respond(201, '');
    httpBackend.whenGET('/api/appointment/places').respond(201, '');
    AgendaCtrl = $controller('AgendaCtrl', {
      $scope: scope,
      initialData: {
        weekData: [],
        usersWithoutOwner: []
      }
    });
    //td = dateService.setDateAsUTC0(new Date((new Date()).setHours(0, 0, 0, 0)));
    //scope.startDate = DateService.setDateAsUTC0(new Date(td.setDate(td.getDate() - (td.getDay() - 1))));
    scope.routeCurrentDate = new Date('2015-08-24T00:00:00.000Z');
    httpBackend.whenGET('/api/agenda/week/' + scope.startISODate).respond(201, []);
  }));

  it('loadDataWeek - load week data', function () {
    expect(scope.loadDataWeek(new Date(), []).then instanceof Function).toBe(true);
  });

  it('createWeek - create week', function () {
    var startDate = '2015-02-23T00:00:00.000Z', startDateISO = (new Date(startDate)).toISOString(),
      data = {data: [{datePrimary: new Date('2015-02-23T00:00:00.000Z'), id: 1, name: 'Test'}]};
    scope.weeks = {};
    scope.weeks[startDateISO] = [];
    scope.createWeek(startDate, []);
    expect(scope.weeks[startDateISO]).toEqual([]);

    scope.weeks = {};
    scope.createWeek(startDate, data);
    expect(scope.weeks[startDateISO].days.length).toEqual(7);
    // vyzkoumat jak se pracuje s Promise uvnitr nortmalni fce a unit testu

    //expect(scope.weeks[startDateISO].days[0].id).toEqual(data.data[0].id);
    //expect(scope.weeks[startDateISO].days[0].name).toEqual(data.data[0].name);
  });

  it('createDays - create days for week', function () {
    var startDate = '2015-02-23T01:00:00.000Z', week = {days: []};
    scope.createDays(startDate, week);
    expect(week.days.length).toBe(7);
    //expect(week.days[0].prefix.length > 0).toBe(true);
    expect(week.days[0].date.length > 0).toBe(true);
  });

  it('loadDataForDays - load data for days', function () {
    var week = {days: [{date: '2015-02-23T01:00:00.000Z'}]}, weekData = [{datePrimary: '2015-02-23T01:00:00.000Z', type: constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL}];
    scope.loadDataForDays(week, weekData);
    expect(week.days[0].types[constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL]).toEqual(weekData);
    expect(week.days[0].dayEvents.length).toBe(1);
  });

  it('setCollapse - set collapse', function () {
    scope.collapseDays[0] = true;
    scope.setCollapse(0);
    expect(scope.collapseDays[0]).toEqual(false);

    scope.collapseDays[0] = false;
    scope.setCollapse(0);
    expect(scope.collapseDays[0]).toEqual(true);
  });

  it('collapseAll - set collapse all', function () {
    scope.collapseDays = [false, false, false];
    scope.collapseAll(true);
    expect(scope.collapseDays.every(function (element) {return element === true; })).toEqual(true);
    scope.collapseAll(false);
    expect(scope.collapseDays.every(function (element) {return element === false; })).toEqual(true);
  });

  it('prevWeek - set previous week', function () {
    scope.startISODate = new Date('2015-02-24T00:00:00.000Z');
    scope.prevWeek();
    expect(scope.startISODate).toBe('2015-02-17T00:00:00.000Z');
    expect(scope.weeks['2015-02-17T00:00:00.000Z'].days.length).toEqual(7);
  });

  it('nextWeek - set next week', function () {
    scope.startISODate = new Date('2015-02-24T00:00:00.000Z');
    scope.nextWeek();
    expect(scope.startISODate).toBe('2015-03-03T00:00:00.000Z');
    expect(scope.weeks['2015-03-03T00:00:00.000Z'].days.length).toEqual(7);
  });

  it('customWeek - set custom week', function () {
    scope.agenda.weekSelectDate = new Date('2015-02-10T00:00:00.000Z');
    scope.customWeek();
    expect(scope.startISODate).toBe('2015-02-10T00:00:00.000Z'); //.toISOString()
    expect(scope.weeks['2015-02-10T00:00:00.000Z'].days.length).toEqual(7);
  });

  it('thisWeek - set this week', function () {
    var today = new Date(), pom = dateService.setDateAsUTC0(new Date((new Date(today.setDate(today.getDate() - (today.getDay() - 1)))).setHours(0, 0, 0, 0)));
    scope.thisWeek();
    expect(scope.startISODate).toBe(pom.toISOString());
    expect(scope.weeks[pom.toISOString()].days.length).toEqual(7);
  });

  it('twoWeek - set two week', function () {
    var today = new Date(), pom = dateService.clearISOTime((dateService.setDateAsUTC0(new Date((new Date((new Date(today.setDate(today.getDate() - (today.getDay() - 1)))).setMilliseconds(scope.daysOfWeek.length * 24 * 60 * 60 * 1000))).setHours(0, 0, 0, 0)))).toISOString());
    scope.twoWeek();
    expect(scope.startISODate).toBe(pom);
    expect(scope.weeks[pom].days.length).toEqual(7);
  });

  it('recalculateWeekDateRange - recalculate range', function () {
    var selectedDate = new Date(scope.agenda.weekSelectDate),
      weekStartDate = new Date(selectedDate.setDate(selectedDate.getDate() - (selectedDate.getDay() - 1))),
      weekEndDate = new Date((new Date(scope.weekStartDate)).setMilliseconds((scope.daysOfWeek.length - 1) * 24 * 60 * 60 * 1000));
    scope.recalculateWeekDateRange();
    expect(scope.weekStartDate).toEqual(weekStartDate);
    expect(scope.weekEndDate).toEqual(weekEndDate);
  });

  it('selectTeamUser - select team user', function () {
    scope.usersWithoutOwner = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.usersForFilter = [];
    scope.show.myAgenda = true;
    scope.show.teamAgenda = false;
    scope.selectTeamUser(1);
    expect(scope.selectedTeamUser).toEqual(scope.usersWithoutOwner[1]);
    expect(scope.usersForFilter[0].id).toBe(9);

    scope.show.myAgenda = false;
    scope.show.teamAgenda = true;
    scope.selectTeamUser(1);
    expect(scope.usersForFilter[0].id).toBe(2);

    scope.selectTeamUser(-1);
    expect(scope.selectedTeamUser.id).toBe(-1);
    expect(scope.usersForFilter[0].id).toBe(1);
    expect(scope.usersForFilter[1].id).toBe(2);
    expect(scope.usersForFilter.length).toBe(2);
  });

  it('changeUserFilter - change user filter object', function () {
    scope.usersWithoutOwner = [{id: 1, name: 'Test'}, {id: 2, name: 'Test 2'}];
    scope.usersForFilter = [];
    scope.show.myAgenda = true;
    scope.show.teamAgenda = false;
    scope.changeUserFilter();
    expect(scope.usersForFilter[0].id).toBe(9);

    scope.show.myAgenda = false;
    scope.show.teamAgenda = true;
    scope.selectedTeamUser = scope.allUsersMenuItem;
    scope.changeUserFilter();
    expect(scope.selectedTeamUser.id).toBe(-1);
    expect(scope.usersForFilter[0].id).toBe(1);
    expect(scope.usersForFilter[1].id).toBe(2);
    expect(scope.usersForFilter.length).toBe(2);

    scope.selectedTeamUser = scope.usersWithoutOwner[1];
    scope.changeUserFilter();
    expect(scope.usersForFilter[0].id).toBe(2);
  });

  it('getEventsForDay - get events for day', function () {
    var day = {types: {}};
    day.types[scope.sortDayTypes[0]] = [{id: 1, name: 'Test', ownerId: 9}, {id: 2, name: 'Test 2', ownerId: 9}];
    day.types[scope.sortDayTypes[1]] = [{id: 3, name: 'Test 3', ownerId: 9}];
    expect(scope.getEventsForDay(day)).toBe(3);

    day.types[scope.sortDayTypes[0]] = [{id: 1, name: 'Test', ownerId: 1}, {id: 2, name: 'Test 2', ownerId: 1}];
    day.types[scope.sortDayTypes[1]] = [{id: 3, name: 'Test 3', ownerId: 9}];
    scope.usersForFilter = [{id: 1, name: 'Test'}];
    expect(scope.getEventsForDay(day)).toBe(2);
  });

  it('deleteDayEvent - delete day event', function () {
    var obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING}, day = {types: {}, dayEvents: []};
    day.types[constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING] = [{id: 1}, {id: 2}];
    expect(day.types[constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING].length).toBe(2);
    day.dayEvents = [{id: 1}, {id: 2}];
    expect(day.dayEvents.length).toBe(2);
    scope.deleteDayEvent(obj, day);
    expect(day.types[constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING].length).toBe(1);
    expect(day.types[constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING][0].id).toBe(2);
    expect(day.dayEvents.length).toBe(1);
    expect(day.dayEvents[0].id).toBe(2);
  });

  it('markAsDone - set event as done', function () {
    // AGENDA_TYPE_REMINDER
    var obj = {id: 1, type: constants.AGENDA_TYPE_REMINDER}, day = {types: {}, dayEvents: []}, today;
    day.types[constants.AGENDA_TYPE_REMINDER] = [{id: 1}, {id: 2}];
    day.dayEvents = [{id: 1}, {id: 2}];
    today = dateService.setDateAsUTC0(new Date((new Date()).setHours(0, 0, 0, 0)));
    scope.startISODate = new Date(today.setDate(today.getDate() - (today.getDay() - 1)));
    httpBackend.expectPOST('/api/reminder/' + obj.id + '/mark-as-done').respond(201, {message: {type: constants.MESSAGE_SUCCESS, msg: 'Test'}});

    expect(day.types[constants.AGENDA_TYPE_REMINDER].length).toBe(2);
    expect(day.dayEvents.length).toBe(2);
    scope.markAsDone(obj, day);
    httpBackend.flush();
    expect(day.types[constants.AGENDA_TYPE_REMINDER].length).toBe(1);
    expect(day.types[constants.AGENDA_TYPE_REMINDER][0].id).toBe(2);
    expect(day.dayEvents.length).toBe(1);
    expect(day.dayEvents[0].id).toBe(2);
    expect(alerts.get().items.length).toBe(1);

    // AGENDA_TYPE_TASK
    alerts.clear();
    obj = {id: 1, type: constants.AGENDA_TYPE_TASK};
    day = {types: {}};
    day.types[constants.AGENDA_TYPE_TASK] = [{id: 1}, {id: 2}];
    httpBackend.expectPOST('/api/tasks/' + obj.id + '/mark-as-done').respond(201, {message: {type: constants.MESSAGE_SUCCESS, msg: 'Test'}});

    expect(day.types[constants.AGENDA_TYPE_TASK].length).toBe(2);
    scope.markAsDone(obj, day);
    httpBackend.flush();
    expect(day.types[constants.AGENDA_TYPE_TASK].length).toBe(1);
    expect(day.types[constants.AGENDA_TYPE_TASK][0].id).toBe(2);
    expect(alerts.get().items.length).toBe(1);
  });

  it('copyToNew - new event from current', function () {
    var obj = {id: 1, type: constants.AGENDA_TYPE_REMINDER}, mess;
    httpBackend.expectGET('/api/reminder/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //mess = messengerService.getData();
    //expect(mess.id).toBe(null);
    //expect(mess.name).toBe('Test');
    expect(loc.path()).toBe('/reminder');

    obj = {id: 1, type: constants.AGENDA_TYPE_TASK};
    httpBackend.expectGET('/api/tasks/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //expect(messengerService.getData().id).toBe(null);
    //expect(messengerService.getData().name).toBe('Test');
    expect(loc.path()).toBe('/task');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT};
    httpBackend.expectGET('/api/appointments/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //expect(messengerService.getData().id).toBe(null);
    //expect(messengerService.getData().name).toBe('Test');
    expect(loc.path()).toBe('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING};
    httpBackend.expectGET('/api/appointments/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //expect(messengerService.getData().id).toBe(null);
    //expect(messengerService.getData().name).toBe('Test');
    expect(loc.path()).toBe('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_OTHER};
    httpBackend.expectGET('/api/appointments/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //expect(messengerService.getData().id).toBe(null);
    //expect(messengerService.getData().name).toBe('Test');
    expect(loc.path()).toBe('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL};
    httpBackend.expectGET('/api/appointments/' + obj.id).respond(201, {id: 1, name: 'Test'});
    loc.path('/agenda');
    rootScope.$apply();
    scope.copyToNew(obj);
    httpBackend.flush();
    //expect(messengerService.getData().id).toBe(null);
    //expect(messengerService.getData().name).toBe('Test');
    expect(loc.path()).toBe('/appointment');
  });

  it('dayAction - new event from current', function () {
    var currentDate = dateService.round(new Date(), [0, 30, 60], 'mi'), newDate, obj, day;
    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL};
    day = {date: currentDate.toISOString()};
    newDate = dateService.setDateAsUTC0((new Date(day.date)).setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), 0)).toISOString();
    scope.dayAction(obj, day);
    //expect(messengerService.getData().start_time).toEqual(newDate);
    //expect(messengerService.getData().end_time).toEqual(newDate);
    expect(loc.path()).toEqual('/appointment');

    currentDate = dateService.round(new Date(), [0, 30, 60], 'mi');
    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT};
    day = {date: currentDate.toISOString()};
    scope.dayAction(obj, day);
    //expect(messengerService.getData().start_time).toEqual(newDate);
    //expect(messengerService.getData().end_time).toEqual(newDate);
    expect(loc.path()).toEqual('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING};
    day = {date: currentDate.toISOString()};
    scope.dayAction(obj, day);
    //expect(messengerService.getData().start_time).toEqual(newDate);
    //expect(messengerService.getData().end_time).toEqual(newDate);
    expect(loc.path()).toEqual('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_APPOINTMENT_OTHER};
    day = {date: currentDate.toISOString()};
    scope.dayAction(obj, day);
    //expect(messengerService.getData().start_time).toEqual(newDate);
    //expect(messengerService.getData().end_time).toEqual(newDate);
    expect(loc.path()).toEqual('/appointment');

    obj = {id: 1, type: constants.AGENDA_TYPE_REMINDER};
    day = {date: currentDate.toISOString()};
    scope.dayAction(obj, day);
    //expect(messengerService.getData().original_time).toEqual(newDate);
    expect(loc.path()).toEqual('/reminder');
  });

  it('loadUsers - load users', function () {
    scope.usersWithoutOwner = [];
    scope.loadUsers();
    httpBackend.flush();
    expect(scope.usersWithoutOwner.length).toBe(1);
    expect(scope.usersWithoutOwner[0].id).toBe(1);
  });

  it('loadUsers - load users', function () {
    console.log('TODO');
  });

  it('setFilterRecent - set filter recent', function () {
    scope.dataLoaderParams.datePrimary = '';
    scope.dataLoaderParams.sortDirection = '';
    scope.dataLoaderParams.direction = '';
    scope.dataLoaderParams.searchStr = null;
    scope.setFilterRecent();
    expect(scope.dataLoaderParams.datePrimary).toBe(dateService.clearISOTime((new Date()).toISOString()));
    expect(scope.dataLoaderParams.sortDirection).toBe('desc');
    expect(scope.dataLoaderParams.direction).toBe('<=');
    expect(scope.dataLoaderParams.searchStr).not.toBe(null);
  });

  it('setFilterOncomming - set filter oncomming', function () {
    scope.dataLoaderParams.datePrimary = '';
    scope.dataLoaderParams.sortDirection = '';
    scope.dataLoaderParams.direction = '';
    scope.dataLoaderParams.searchStr = null;
    scope.setFilterOncomming();
    expect(scope.dataLoaderParams.datePrimary).toBe(dateService.clearISOTime((new Date()).toISOString()));
    expect(scope.dataLoaderParams.sortDirection).toBe('asc');
    expect(scope.dataLoaderParams.direction).toBe('>=');
    expect(scope.dataLoaderParams.searchStr).not.toBe(null);
  });

  it('setFilterAll - set filter all', function () {
    scope.dataLoaderParams.datePrimary = '';
    scope.dataLoaderParams.sortDirection = '';
    scope.dataLoaderParams.direction = '';
    scope.dataLoaderParams.searchStr = null;
    scope.setFilterAll();
    expect(scope.dataLoaderParams.datePrimary).toBe(dateService.clearISOTime((new Date(null)).toISOString()));
    expect(scope.dataLoaderParams.sortDirection).toBe('asc');
    expect(scope.dataLoaderParams.direction).toBe('>=');
    expect(scope.dataLoaderParams.searchStr).not.toBe(null);
  });

  it('collapseAllFromToday - set collapse for all days from today', function () {
    var arr = [
      {
        date: '2015-09-01T00:00:00.000Z'
      },
      {
        date: new Date((new Date()).setHours(0, 0, 0, 0))
      },
      {
        date: new Date((new Date('2015-10-01T00:00:00.000Z')).setHours(0, 0, 0, 0))
      }
    ];
    scope.collapseDays = {};
    scope.routeCurrentDate = new Date('2015-09-01T00:00:00.000Z');
    scope.initCollapse(arr);
    scope.collapseAllFromToday(arr);
    expect(Object.keys(scope.collapseDays).length).toBe(3);
    expect(scope.collapseDays[arr[0].date]).toBe(true);
    expect(scope.collapseDays[arr[1].date]).toBe(true);
    expect(scope.collapseDays[arr[2].date]).toBe(false);
  });

  it('initCollapse - initial collapse', function () {
    var arr = [
      {
        date: new Date((new Date()).setHours(0, 0, 0, 0))
      },
      {
        date: new Date((new Date('2015-10-01T00:00:00.000Z')).setHours(0, 0, 0, 0))
      }
    ];
    scope.routeCurrentDate = null;
    scope.collapseDays = {};
    scope.initCollapse(arr);
    expect(Object.keys(scope.collapseDays).length).toBe(2);
    expect(scope.collapseDays[arr[0].date]).toBe(true);
    expect(scope.collapseDays[arr[1].date]).toBe(false);

    scope.routeCurrentDate = new Date('2015-09-01T00:00:00.000Z');
    scope.collapseDays = {};
    scope.initCollapse(arr);
    expect(Object.keys(scope.collapseDays).length).toBe(3);
    expect(scope.collapseDays[arr[0].date]).toBe(true);
    expect(scope.collapseDays[scope.routeCurrentDate.toISOString()]).toBe(true);
  });

  it('newAppointment - create new appointment', function () {
    loc.path('/agenda');
    rootScope.$apply();
    scope.newAppointment();
    expect(loc.path()).toBe('/appointment');
  });

  it('newTask - create new task', function () {
    loc.path('/agenda');
    rootScope.$apply();
    scope.newTask();
    expect(loc.path()).toBe('/task');
  });

});
