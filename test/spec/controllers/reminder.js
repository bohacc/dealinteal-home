'use strict';

describe('Controller: ReminderCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var ReminderCtrl,
    scope,
    dateService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, DateService) {
    scope = $rootScope.$new();
    scope.meta = {ownerId: 1};
    dateService = DateService;
    ReminderCtrl = $controller('ReminderCtrl', {
      $scope: scope,
      initialData: {reminder: {}, people: {email: 'bohacc@seznam.cz', email2: 'bohac@notia.cz'}}
    });
  }));

  it('default values', function () {
    var newDate = dateService.round(new Date(), [0, 60], 'mi');
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    newDate = newDate.toISOString();
    expect(scope.reminder.original_time).toBe(newDate);
    expect(scope.reminderTmp.originalDate).toBe(newDate);
    expect(scope.reminderTmp.originalTime).toBe(newDate);
    expect(scope.reminderTmp.remind).toBe(1);
  });

  it('setRecipient - nastaveni pole recipient id', function () {
    scope.reminderTmp.remind = 1;
    scope.setRecipient();
    expect(scope.reminder.recipient_id).toBe(1);
    scope.reminderTmp.remind = 2;
    scope.setRecipient();
    expect(scope.reminder.recipient_id).toBe(null);
    scope.reminderTmp.remindBox[0] = {id: 9};
    scope.setRecipient();
    expect(scope.reminder.recipient_id).toBe(9);
  });

  it('initType - inicializace typu reminderu', function () {
    scope.initType();
    expect(scope.reminderTmp.type.subject).toBe(undefined);
    expect(scope.reminderTmp.type.exist).toBe(false);
    expect(scope.reminderTmp.type.name).toBe(undefined);

    scope.reminder.type_subject = 'Test';
    scope.reminder.appointment_id = 99;
    scope.initType();
    expect(scope.reminderTmp.type.subject).toBe('Test');
    expect(scope.reminderTmp.type.exist).toBe(true);
    expect(scope.reminderTmp.type.name).toBe('APPOINTMENT');

    scope.reminder.appointment_id = null;
    scope.reminder.task_id = 88;
    scope.initType();
    expect(scope.reminderTmp.type.subject).toBe('Test');
    expect(scope.reminderTmp.type.exist).toBe(true);
    expect(scope.reminderTmp.type.name).toBe('TASK');

    scope.reminder.appointment_id = null;
    scope.reminder.task_id = null;
    scope.reminder.goal_id = 77;
    scope.initType();
    expect(scope.reminderTmp.type.subject).toBe('Test');
    expect(scope.reminderTmp.type.exist).toBe(true);
    expect(scope.reminderTmp.type.name).toBe('GOAL');
  });

  it('initEmails - inicializace emailů', function () {
    scope.reminderTmp.remindBox[0] = {email: 'test@email.cz', email2: 'test2@email.cz'};
    scope.reminderTmp.remind = 1;
    scope.initEmails();
    expect(scope.loginUserEmails.length).toBe(2);
    expect(scope.loginUserEmails[0]).toBe('bohacc@seznam.cz');
    expect(scope.loginUserEmails[1]).toBe('bohac@notia.cz');
    scope.reminderTmp.remind = 2;
    scope.initEmails();
    expect(scope.loginUserEmails.length).toBe(2);
    expect(scope.loginUserEmails[0]).toBe('test@email.cz');
    expect(scope.loginUserEmails[1]).toBe('test2@email.cz');
  });

  it('onRecipientPersonChange - změna textu osoby pro typ', function () {
    scope.reminderTmp.remindBox[0] = {id: 1, name: 'Test', name2: 'Test'};
    scope.reminderTmp.remindPersonName = 'Test';
    scope.onRecipientPersonChange();
    expect(scope.reminderTmp.remindBox.length).toBe(1);
    scope.reminderTmp.remindPersonName = 'Test XXX';
    scope.onRecipientPersonChange();
    expect(scope.reminderTmp.remindBox.length).toBe(0);
  });

  it('initButtons - inicializace action buttonu ', function () {
    scope.initButtons();
    expect(scope.actionButtons[0].name).toBe('DELETE');
    expect(scope.actionButtons[0].dropDown[0].name).toBe('DELETE_REMINDER');
    expect(scope.actionButtons[1].name).toBe('CANCEL');
    expect(scope.actionButtons[2].name).toBe('SAVE');
  });

  it('setDate - nastavení datumu podle zvoleného rozsahu', function () {
    var tmp = (new Date()).toISOString().substring(0, 10);
    scope.setDate(0);
    expect(scope.reminder.original_time.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalDate.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalTime.substring(0, 10)).toBe(tmp);
    tmp = dateService.nextWorkDay(new Date()).toISOString().substring(0, 10);
    scope.setDate(1);
    expect(scope.reminder.original_time.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalDate.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalTime.substring(0, 10)).toBe(tmp);
    tmp = (new Date((new Date()).setMilliseconds(24 * 60 * 60 * 1000))).toISOString().substring(0, 10);
    scope.setDate(2);
    expect(scope.reminder.original_time.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalDate.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalTime.substring(0, 10)).toBe(tmp);
    tmp = (new Date((new Date()).setMilliseconds(7 * 24 * 60 * 60 * 1000))).toISOString().substring(0, 10);
    scope.setDate(3);
    expect(scope.reminder.original_time.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalDate.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalTime.substring(0, 10)).toBe(tmp);
    tmp = dateService.addMonths(new Date(), 1).toISOString().substring(0, 10);
    scope.setDate(4);
    expect(scope.reminder.original_time.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalDate.substring(0, 10)).toBe(tmp);
    expect(scope.reminderTmp.originalTime.substring(0, 10)).toBe(tmp);
  });

  it('verifyForm - ověření vstupních dat před odesláním na server', function () {
    scope.reminder = {};
    expect(scope.verifyForm()).toBe(false);
    scope.reminder.recipient_id = 1;
    expect(scope.verifyForm()).toBe(false);
    scope.reminder.subject = 'Test';
    expect(scope.verifyForm()).toBe(false);
    scope.reminder.original_time = new Date();
    expect(scope.verifyForm()).toBe(true);
    scope.reminder.email_rem = 1;
    expect(scope.verifyForm()).toBe(false);
    scope.reminder.email = 'bohac@seznam.cz';
    expect(scope.verifyForm()).toBe(true);
  });
});
