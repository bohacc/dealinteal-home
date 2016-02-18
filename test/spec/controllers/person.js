/*jslint node: true, unparam: true */
'use strict';

describe('Controller: PersonCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var PersonCtrl,
    scope,
    alerts,
    constants,
    messengerService,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, AlertsService, MessengerService, Constants) {
    scope = $rootScope.$new();
    alerts = AlertsService;
    httpBackend = $httpBackend;
    messengerService = MessengerService;
    constants = Constants;
    httpBackend.whenGET('views/login.html').respond(201, '');
    PersonCtrl = $controller('PersonCtrl', {
      $scope: scope,
      initialData: {person: {}},
      actionButtons: {}
    });
  }));

  it('initButtons', function () {
    var i, l, testButt = 0;
    scope.initButtons();
    expect(scope.actionButtons.length).toBe(3);
    for (i = 0, l = scope.actionButtons.length; i < l; i += 1) {
      if (scope.actionButtons[i].name === 'DELETE') {
        expect(scope.actionButtons[i].dropDown.length).toBe(1);
        expect(scope.actionButtons[i].dropDown).toEqual(jasmine.any(Object));
        expect(scope.actionButtons[i].dropDown[0].disabled).toEqual(jasmine.any(Function));
        testButt += 1;
      }
      if (scope.actionButtons[i].name === 'CANCEL') {
        expect(scope.actionButtons[i].disabled).toEqual(jasmine.any(Function));
        testButt += 1;
      }
      if (scope.actionButtons[i].name === 'SAVE') {
        expect(scope.actionButtons[i].disabled).toEqual(jasmine.any(Function));
        testButt += 1;
      }
    }
    expect(testButt).toBe(3);
  });

  it('verifyForm', function () {
    expect(scope.verifyForm()).toBe(true);
    scope.person = {
      home_addr_zip:  '11235'
    };
    expect(scope.verifyForm()).toBe(true);
    scope.person = {
      home_addr_zip:  '112 35'
    };
    expect(scope.verifyForm()).toBe(true);
    scope.person = {
      home_addr_zip:  '1123'
    };
    expect(scope.verifyForm()).toBe(false);
    expect(alerts.get().items.length).toBe(1);
    alerts.clear();

    scope.person = {
      email: 'test@neco.cz'
    };
    expect(scope.verifyForm()).toBe(true);

    scope.person = {
      home_addr_zip:  '11 35',// invalid
      email:  'test@neco.cz',
      email2:  'test.neco.cz',// invalid
      mobile_phone:  '00235',// invalid
      business_phone:  '123456789',
      home_phone:  '+420609123265',
      assistant_phone:  '+42023456789',// invalid
      other_phone:  '123456789+42',// invalid
      fax:  '+420609123265'
    };
    expect(scope.verifyForm()).toBe(false);
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].messages.length).toBe(6);//invalid + 1
    alerts.clear();

    scope.person = {
      home_addr_zip:  '111 35',
      email:  'test@necocz',// invalid
      email2:  'test@neco.cz',
      mobile_phone:  '+420609123265',
      business_phone:  'aa',// invalid
      home_phone:  '45s6sx2',// invalid
      assistant_phone:  '609123652',
      other_phone:  '609123652',
      fax:  '+420'// invalid
    };
    expect(scope.verifyForm()).toBe(false);
    expect(alerts.get().items.length).toBe(1);
    expect(alerts.get().items[0].messages.length).toBe(5);//invalid + 1
    alerts.clear();
  });

  it('createAppointment - create new appointment for current person', function () {
    scope.person = {
      id: 9,
      first_name: 'Martin',
      last_name: 'Boháč'
    };
    scope.createAppointment();
    expect(messengerService.getData()).toEqual({ attendeeReminderMembers : [ { id : 9, name : 'Martin Boháč' } ] });
  });

  it('uploadPicture - uploading picture', function () {
    scope.person = {id: 1, pictureId: null};
    scope.pictureFile = {id: 5};
    scope.uploadPictureConfig = {};
    scope.inProcess = false;
    scope.uploadPicture();
    expect(scope.uploadPictureConfig.inProcess).toBe(true);
  });

  it('selectFile - select file', function () {
    scope.pictureFile = null;
    scope.isPictureChange = false;
    scope.selectFile({id: 5}); // any object
    expect(scope.pictureFile.id).toBe(5);
    expect(scope.isPictureChange).toBe(true);
  });

  it('removePicture - remove picture from', function () {
    scope.isPictureChange = false;
    scope.person.pictureId = null;
    scope.pictureFile = {id: 5};
    scope.removePicture();
    expect(JSON.stringify(scope.pictureFile)).toBe('{}');
    expect(scope.isPictureChange).toBe(false);
    scope.isPictureChange = false;
    scope.person.pictureId = 5;
    scope.removePicture();
    expect(scope.isPictureChange).toBe(true);
  });

  it('showSavePictureAnchor - return boolean for eneble/disable save anchor', function () {
    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = 'Name';
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = true;
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(true);
  });

  it('showDeletePictureAnchor - return boolean for eneble/disable delete anchor', function () {
    scope.isPictureChange = false;
    scope.pictureFile.name = 'Name';
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.inProcess = false;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.inProcess = false;
    expect(scope.showDeletePictureAnchor()).toBe(true);
  });

  it('showRemovePictureAnchor - return boolean for eneble/disable remove anchor', function () {
    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.person.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.person.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.person.pictureId = 5;
    expect(scope.showRemovePictureAnchor()).toBe(true);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.person.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(true);
  });

  it('getPersonPicture - create link for picture', function () {
    scope.pictureFile = {id: 1};
    expect(scope.getPersonPicture()).toBe('pictureFile');

    scope.pictureFile = {};
    scope.isPictureChange = false;
    scope.person = {id: 1, pictureId: 5};
    expect(scope.getPersonPicture()).toBe('/api/attachments/' + scope.person.pictureId);

    scope.pictureFile = {};
    scope.person.pictureId = null;
    scope.isPictureChange = true;
    expect(scope.getPersonPicture()).toBe(constants.EMPTY_PERSON_PICTURE);
  });

  it('afterUploadPersonPicture - callback for upload file after action', function () {
    scope.isPictureChange = null;
    scope.person.pictureId = null;
    scope.inProcess = null;
    scope.afterUploadPersonPicture({data: {id: 5}});
    expect(scope.isPictureChange).toBe(false);
    expect(scope.person.pictureId).not.toBe(null);
    expect(scope.inProcess).toBe(false);
  });

  it('initPictureConfig - initialization picture config object', function () {
    scope.person = {id: 1, pictureId: 5};
    scope.uploadPictureConfig = {};
    var uploadPictureConfig = {
      url: '/api/people/' + scope.person.id + '/picture/upload',
      errorMsg: '',
      callback: scope.afterUploadPersonPicture,
      data: {
        table: constants.ATTACHMENTS_TYPES.PEOPLE,
        id: 5
      }
    };
    scope.initPictureConfig();
    expect(JSON.stringify(scope.uploadPictureConfig)).toBe(JSON.stringify(uploadPictureConfig));
  });

  it('deletePicture - delete picture', function () {
    scope.person = {id: 1, pictureId: 5};
    httpBackend.expectDELETE('/api/attachments/' + scope.person.pictureId).respond(201, {message: {type: constants.MESSAGE_SUCCESS}});
    scope.isPictureChange = null;
    scope.inProcess = false;
    scope.deletePicture();
    httpBackend.flush();
    expect(scope.person.pictureId).toBe(null);
    expect(scope.isPictureChange).toBe(false);
    expect(scope.inProcess).toBe(false);
  });

  it('initDataForAgenda - initial data for Agenda', function () {
    scope.person = {id: 10, first_name: 'Pepa', last_name: 'Jantar'};
    scope.initDataForAgenda();
    expect(scope.dataForAgenda.appointment.attendeeReminderMembers[0].id).toBe(10);
    expect(scope.dataForAgenda.appointment.attendeeReminderMembers[0].name).toBe('Pepa Jantar');
    expect(scope.dataForAgenda.task.person[0].id).toBe(10);
    expect(scope.dataForAgenda.task.person[0].name).toBe('Pepa Jantar');
  });

  it('calculateBirthday - calculate birthday years and days', function () {
    scope.person = {birthday: '10.5.1980'};
    scope.calculateBirthday();
    expect(scope.person.birthdayYears).not.toBe(null);
    expect(scope.person.daysBirth).not.toBe(null);

    scope.person = {birthday: '10.5.1980', birthdayYears: 1, daysBirth: 400};
    scope.calculateBirthday();
    expect(scope.person.birthdayYears).not.toBe(null);
    expect(scope.person.birthdayYears).not.toBe(1);
    expect(scope.person.daysBirth).not.toBe(null);
    expect(scope.person.daysBirth).not.toBe(400);
  });

  it('calculateAnniversary - calculate anniversary days', function () {
    scope.person = {anniversary: '10.5.1980'};
    scope.calculateAnniversary();
    expect(scope.person.daysAnniv).not.toBe(null);

    scope.person = {anniversary: '10.5.1980', daysAnniv: 1};
    scope.calculateAnniversary();
    expect(scope.person.daysAnniv).not.toBe(null);
    expect(scope.person.daysAnniv).not.toBe(1);
  });
});
