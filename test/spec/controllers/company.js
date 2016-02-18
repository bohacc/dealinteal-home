/*jslint node: true, unparam: true */
'use strict';

describe('Controller: CompanyCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var CompanyCtrl,
    scope,
    location,
    httpBackend,
    alerts,
    constants,
    messengerService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location, MessengerService, $httpBackend, AlertsService, Constants) {
    scope = $rootScope.$new();
    location = $location;
    httpBackend = $httpBackend;
    alerts = AlertsService;
    constants = Constants;
    messengerService = MessengerService;
    httpBackend.whenGET('views/login.html').respond(201, '');
    CompanyCtrl = $controller('CompanyCtrl', {
      $scope: scope,
      initialData: {company: {}, countries: {}}
    });
  }));

  it('setAbstractField - nastavení abstraktního pole pro email, telefon a fax všech adres', function () {
    // EMAIL
    // ADRESAA 1
    // Žádný email,phone,fax k adrese
    scope.company = {
      email_1_1: '',
      email_2_1: '',
      email_3_1: '',
      phone_1_1: '',
      phone_2_1: '',
      phone_3_1: '',
      fax_1_1: '',
      fax_2_1: ''
    };
    scope.addressActive = 1;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Jeden email,phone,fax k adrese
    scope.company = {
      email_1_1: 'bohac@notia.cz',
      email_2_1: '',
      email_3_1: '',
      phone_1_1: '+42077784691',
      phone_2_1: '',
      phone_3_1: '',
      fax_1_1: '+42077784691',
      fax_2_1: ''
    };
    scope.addressActive = 1;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Dva emaily,phone,fax k adrese
    scope.company = {
      email_1_1: 'bohac@notia.cz',
      email_2_1: 'bohac@notia.cz',
      email_3_1: '',
      phone_1_1: '+42077784691',
      phone_2_1: '+42077784691',
      phone_3_1: '',
      fax_1_1: '+42077784691',
      fax_2_1: '+42077784691'
    };
    scope.addressActive = 1;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(2);
    expect(scope.phone.items.length).toBe(2);
    expect(scope.fax.items.length).toBe(2);

    // Tři emaily,phone k adrese
    scope.company = {
      email_1_1: 'bohac@notia.cz',
      email_2_1: 'bohac@notia.cz',
      email_3_1: 'bohac@notia.cz',
      phone_1_1: '+42077784691',
      phone_2_1: '+42077784691',
      phone_3_1: '+42077784691'
    };
    scope.addressActive = 1;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    expect(scope.email.items.length).toBe(3);
    expect(scope.phone.items.length).toBe(3);

    // ADRESAA 2
    // Žádný email,phone,fax k adrese
    scope.company = {
      email_1_2: '',
      email_2_2: '',
      email_3_2: '',
      phone_1_2: '',
      phone_2_2: '',
      phone_3_2: '',
      fax_1_2: '',
      fax_2_2: ''
    };
    scope.addressActive = 2;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Jeden email,phone,fax k adrese
    scope.company = {
      email_1_2: 'bohac@notia.cz',
      email_2_2: '',
      email_3_2: '',
      phone_1_2: '+42077784691',
      phone_2_2: '',
      phone_3_2: '',
      fax_1_2: '+42077784691',
      fax_2_2: ''
    };
    scope.addressActive = 2;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Dva emaily,phone,fax k adrese
    scope.company = {
      email_1_2: 'bohac@notia.cz',
      email_2_2: 'bohac@notia.cz',
      email_3_2: '',
      phone_1_2: '+42077784691',
      phone_2_2: '+42077784691',
      phone_3_2: '',
      fax_1_2: '+42077784691',
      fax_2_2: '+42077784691'
    };
    scope.addressActive = 2;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(2);
    expect(scope.phone.items.length).toBe(2);
    expect(scope.fax.items.length).toBe(2);

    // Tři emaily,phone k adrese
    scope.company = {
      email_1_2: 'bohac@notia.cz',
      email_2_2: 'bohac@notia.cz',
      email_3_2: 'bohac@notia.cz',
      phone_1_2: '+42077784691',
      phone_2_2: '+42077784691',
      phone_3_2: '+42077784691'
    };
    scope.addressActive = 2;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    expect(scope.email.items.length).toBe(3);
    expect(scope.phone.items.length).toBe(3);

    // ADRESAA 3
    // Žádný email,phone,fax k adrese
    scope.company = {
      email_1_3: '',
      email_2_3: '',
      email_3_3: '',
      phone_1_3: '',
      phone_2_3: '',
      phone_3_3: '',
      fax_1_3: '',
      fax_2_3: ''
    };
    scope.addressActive = 3;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Jeden email,phone,fax k adrese
    scope.company = {
      email_1_3: 'bohac@notia.cz',
      email_2_3: '',
      email_3_3: '',
      phone_1_3: '+42077784691',
      phone_2_3: '',
      phone_3_3: '',
      fax_1_3: '+42077784691',
      fax_2_3: ''
    };
    scope.addressActive = 3;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(1);
    expect(scope.phone.items.length).toBe(1);
    expect(scope.fax.items.length).toBe(1);

    // Dva emaily,phone,fax k adrese
    scope.company = {
      email_1_3: 'bohac@notia.cz',
      email_2_3: 'bohac@notia.cz',
      email_3_3: '',
      phone_1_3: '+42077784691',
      phone_2_3: '+42077784691',
      phone_3_3: '',
      fax_1_3: '+42077784691',
      fax_2_3: '+42077784691'
    };
    scope.addressActive = 3;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    scope.setAbstractField(scope.fax, 'fax', 2);
    expect(scope.email.items.length).toBe(2);
    expect(scope.phone.items.length).toBe(2);
    expect(scope.fax.items.length).toBe(2);

    // Tři emaily,phone,fax k adrese
    scope.company = {
      email_1_3: 'bohac@notia.cz',
      email_2_3: 'bohac@notia.cz',
      email_3_3: 'bohac@notia.cz',
      phone_1_3: '+42077784691',
      phone_2_3: '+42077784691',
      phone_3_3: '+42077784691'
    };
    scope.addressActive = 3;
    scope.setAbstractField(scope.phone, 'phone', 3);
    scope.setAbstractField(scope.email, 'email', 3);
    expect(scope.email.items.length).toBe(3);
    expect(scope.phone.items.length).toBe(3);
  });

  it('pills - existence definicí záložek', function () {
    expect(scope.pills.length).toBeGreaterThan(0);
  });

  it('pills - kontrola definice záložek', function () {
    expect(scope.pills[0].name).not.toBeUndefined();
  });

  it('addressFields - existence definicí polí pro adresu', function () {
    expect(scope.addressFields.length).toBeGreaterThan(0);
  });

  it('address - existence pole pro abstrakci adres', function () {
    expect(scope.address).toEqual([]);
  });

  it('addressActive - nastavení výchozí adresy', function () {
    expect(scope.addressActive).toBeGreaterThan(0);
  });

  it('peoplePaging - existence peoplePaging pro stránkování', function () {
    expect(scope.peoplePaging).toEqual(jasmine.any(Object));
  });

  it('peoplePaging.infoPaging - existence peoplePaging.infoPaging pro stránkování', function () {
    expect(scope.peoplePaging.infoPaging).toEqual(jasmine.any(Object));
  });

  it('peoplePaging.dataLoader - existence peoplePaging.dataLoader, funkce pro data pro stránkování', function () {
    expect(scope.peoplePaging.dataLoader).toEqual(jasmine.any(Function));
  });

  it('peoplePaging.dataLoaderParams - existence peoplePaging.dataLoaderParams pro stránkování', function () {
    expect(scope.peoplePaging.dataLoaderParams).toEqual(jasmine.any(Object));
  });

  it('pageAncestor - existence pageAncestor pro předka stránky', function () {
    expect(scope.pageAncestor).toEqual(jasmine.any(Object));
  });

  it('validatePhone - existence funkce pro validaci telefonu', function () {
    expect(scope.validatePhone).toEqual(jasmine.any(Function));
  });

  it('validateEmail - existence funkce pro validaci emailu', function () {
    expect(scope.validateEmail).toEqual(jasmine.any(Function));
  });

  it('ratingMax - nastavení ratingu', function () {
    expect(scope.ratingMax).toBeGreaterThan(0);
  });

  it('showAddressPlus - zobrazení tlačítka plus u adres', function () {
    scope.company = {
      address_tag_1: ''
    };
    expect(scope.showAddressPlus()).toBe(false);
    scope.company = {
      address_tag_1: 'Test'
    };
    expect(scope.showAddressPlus()).toBe(true);
    scope.company = {
      address_tag_1: 'Test',
      address_tag_2: 'Test'
    };
    expect(scope.showAddressPlus()).toBe(true);
    scope.company = {
      address_tag_1: 'Test',
      address_tag_2: 'Test',
      address_tag_3: 'Test'
    };
    expect(scope.showAddressPlus()).toBe(false);
  });

  it('deleteAddress - mazání polí adres formuláře', function () {
    var i, l;
    scope.addressActive = 3;
    // Naplneni poli adres pro test
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, scope.addressActive - 2)] = 'Test';
      scope.company[scope.addressFields[i].replace(/@/g, scope.addressActive - 1)] = 'Test';
      scope.company[scope.addressFields[i].replace(/@/g, scope.addressActive)] = 'Test';
    }

    scope.deleteAddress();
    expect(scope.addressActive).toBe(2);
    expect(scope.existsAddress(2)).toBe(false);

    scope.deleteAddress();
    expect(scope.addressActive).toBe(1);
    expect(scope.existsAddress(1)).toBe(false);

    scope.deleteAddress();
    expect(scope.addressActive).toBe(0);
    expect(scope.existsAddress(0)).toBe(false);
  });

  it('existsAddress - ověření existence adresy', function () {
    var i, l;
    expect(scope.existsAddress(0)).toBe(false);
    expect(scope.existsAddress(1)).toBe(false);
    expect(scope.existsAddress(2)).toBe(false);

    // Naplneni poli adres pro test
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 1)] = 'Test';
    }
    expect(scope.existsAddress(0)).toBe(true);

    // Naplneni poli adres pro test
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 2)] = 'Test';
    }
    expect(scope.existsAddress(1)).toBe(true);

    // Naplneni poli adres pro test
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 3)] = 'Test';
    }
    expect(scope.existsAddress(2)).toBe(true);
  });

  it('setActiveAddress - nastavení aktivní adresy', function () {
    var index = 0;
    scope.setActiveAddress(index);
    expect(scope.addressActive).toBe(index + 1);

    index = 1;
    scope.setActiveAddress(index);
    expect(scope.addressActive).toBe(index + 1);

    index = 2;
    scope.setActiveAddress(index);
    expect(scope.addressActive).toBe(index + 1);
  });

  it('addAddressNavbar - přidání záložky pro adresu a přepnutí polí', function () {
    var i, l, tmp = 'Test';
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 1)] = tmp;
    }
    scope.addAddressNavbar();
    expect(scope.addressActive).toBe(2);
    expect(scope.company.address_tag_1).toBe(tmp);
    expect(scope.company.address_tag_2).toBeUndefined();
  });

  it('put - modifikace záznamu', function () {
    scope.put();
  });

  it('post - uložení záznamu', function () {
    scope.post();
  });

  it('del - smazání záznamu', function () {
    scope.del();
  });

  it('addressMove - přesunutí hodnot polí adresy do jiné', function () {
    var i, l, tmp = 'Test';
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 1)] = tmp;
    }
    scope.addressMove(1, 2);
    expect(scope.existsAddress(0)).toBe(false);
    expect(scope.existsAddress(1)).toBe(true);
  });

  it('moveDataWithTag - přesunutí hodnot z jednoho pole do druhého i s jeho polem tag', function () {
    var field = 'email', tmp = 'bohac@notia.cz', tmpTag = 'Tag';
    scope.addressActive = 1;
    scope.company = {
      email_1_1: tmp,
      email_1_1_tag: tmpTag,
      email_2_1: null,
      email_2_1_tag: null
    };
    scope.moveDataWithTag(field, 1, 2);
    expect(scope.company.email_1_1).toBe(null);
    expect(scope.company.email_1_1_tag).toBe(null);
    expect(scope.company.email_2_1).toBe(tmp);
    expect(scope.company.email_2_1_tag).toBe(tmpTag);
  });

  it('setNavbarAddress - nastavení pole pro abstrakci adres, záložek', function () {
    var i, l, tmp = 'Test';
    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 1)] = tmp;
    }
    scope.setNavbarAddress();
    expect(scope.address.length).toBe(1);
    expect(scope.company.address_tag_1).not.toBe(null);

    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 2)] = tmp;
    }
    scope.setNavbarAddress();
    expect(scope.address.length).toBe(2);
    expect(scope.company.address_tag_2).not.toBe(null);

    for (i = 0, l = scope.addressFields.length; i < l; i += 1) {
      scope.company[scope.addressFields[i].replace(/@/g, 3)] = tmp;
    }
    scope.setNavbarAddress();
    expect(scope.address.length).toBe(3);
    expect(scope.company.address_tag_3).not.toBe(null);
  });

  it('addAbstractField - přidání záznamu do abstraktního pole', function () {
    scope.addAbstractField(scope.email, 3, true);
    expect(scope.email.items.length).toBe(2);
    expect(scope.email.items[1]).toBe(2);

    scope.addAbstractField(scope.email, 3, true);
    expect(scope.email.items.length).toBe(3);
    expect(scope.email.items[2]).toBe(3);
  });

  it('deleteFieldWithTag - odstranění záznamu z abstraktního pole i jeho tagem', function () {
    var index = 0, fieldName = 'fax', tmp = 'Test', fieldAbstract;
    scope.addressActive = 1;
    scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive] = tmp;
    scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive + '_tag'] = tmp;
    fieldAbstract = scope[fieldName];
    scope.setAbstractField(fieldAbstract, fieldName, 3);
    scope.deleteFieldWithTag(fieldAbstract, fieldName, index, true);

    expect(fieldAbstract.items.length).toBe(1);
    expect(fieldAbstract.items[0]).toBe(null);
    expect(scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive]).not.toBe(tmp);
    expect(scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive]).toBe(null);
    expect(scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive + '_tag']).not.toBe(tmp);
    expect(scope.company[fieldName + '_' + (index + 1) + '_' + scope.addressActive + '_tag']).toBe(null);
  });

  it('verifyForm - validace formuláře', function () {
    var tmp = 'test', tmpEmail = 'bohac@notia.cz', tmpPhone = '+420777846191', tmpZip = '256 01', obj;
    obj = {
      tmp: tmp,
      tmpEmail: tmpEmail,
      tmpPhone: tmpPhone,
      tmpZip: tmpZip
    };
    scope.localDataCountries = [{id: 1, iso: 'XX', name: 'test'}];

    expect(scope.verifyForm()).toBe(false);
    scope.company.company_name = obj.tmp;
    expect(scope.verifyForm()).toBe(true);

    scope.addressCountry1 = obj.tmp;
    scope.addressCountry2 = obj.tmp;
    scope.addressCountry3 = obj.tmp;
    scope.company = {
      company_name: obj.tmp,
      email_1_1: obj.tmpEmail,
      email_2_1: obj.tmpEmail,
      email_3_1: obj.tmpEmail,
      email_1_2: obj.tmpEmail,
      email_2_2: obj.tmpEmail,
      email_3_2: obj.tmpEmail,
      email_1_3: obj.tmpEmail,
      email_2_3: obj.tmpEmail,
      email_3_3: obj.tmpEmail,
      phone_1_1: obj.tmpPhone,
      phone_2_1: obj.tmpPhone,
      phone_3_1: obj.tmpPhone,
      phone_1_2: obj.tmpPhone,
      phone_2_2: obj.tmpPhone,
      phone_3_2: obj.tmpPhone,
      phone_1_3: obj.tmpPhone,
      phone_2_3: obj.tmpPhone,
      phone_3_3: obj.tmpPhone,
      fax_1_1: obj.tmpPhone,
      fax_2_1: obj.tmpPhone,
      fax_1_2: obj.tmpPhone,
      fax_2_2: obj.tmpPhone,
      fax_1_3: obj.tmpPhone,
      fax_2_3: obj.tmpPhone,
      address_zip_1: obj.tmpZip,
      address_zip_2: obj.tmpZip,
      address_zip_3: obj.tmpZip
    };
    expect(scope.verifyForm()).toBe(true);

    obj.tmp = 'XtestX';
    obj.tmpEmail = '@notia';
    obj.tmpPhone = 'X9';
    obj.tmpZip = '99999X';
    scope.addressCountry1 = obj.tmp;
    scope.addressCountry2 = obj.tmp;
    scope.addressCountry3 = obj.tmp;
    scope.company = {
      email_1_1: obj.tmpEmail,
      email_2_1: obj.tmpEmail,
      email_3_1: obj.tmpEmail,
      email_1_2: obj.tmpEmail,
      email_2_2: obj.tmpEmail,
      email_3_2: obj.tmpEmail,
      email_1_3: obj.tmpEmail,
      email_2_3: obj.tmpEmail,
      email_3_3: obj.tmpEmail,
      phone_1_1: obj.tmpPhone,
      phone_2_1: obj.tmpPhone,
      phone_3_1: obj.tmpPhone,
      phone_1_2: obj.tmpPhone,
      phone_2_2: obj.tmpPhone,
      phone_3_2: obj.tmpPhone,
      phone_1_3: obj.tmpPhone,
      phone_2_3: obj.tmpPhone,
      phone_3_3: obj.tmpPhone,
      fax_1_1: obj.tmpPhone,
      fax_2_1: obj.tmpPhone,
      fax_1_2: obj.tmpPhone,
      fax_2_2: obj.tmpPhone,
      fax_1_3: obj.tmpPhone,
      fax_2_3: obj.tmpPhone,
      address_zip_1: obj.tmpZip,
      address_zip_2: obj.tmpZip,
      address_zip_3: obj.tmpZip
    };
    expect(scope.verifyForm()).toBe(false);
  });

  it('setDefault - nastavení výchozích hodnot pro formulář', function () {
    var tmp = 'Test';
    scope.company = {
      address_tag_1: null,
      address_tag_2: null,
      address_tag_3: null
    };
    scope.setDefault();
    expect(scope.company.address_tag_1).toBe(null);
    expect(scope.company.address_tag_2).toBe(null);
    expect(scope.company.address_tag_3).toBe(null);

    scope.company.email_1_1 = tmp;
    scope.company.email_1_2 = tmp;
    scope.company.email_1_3 = tmp;
    scope.setDefault();
    expect(scope.company.address_tag_1).toBe('1');
    expect(scope.company.address_tag_2).toBe('2');
    expect(scope.company.address_tag_3).toBe('3');
  });

  it('createAppointment - data to messenger and open appointment', function () {
    var obj;
    scope.company = {id: 1, company_name: 'Test'};
    obj = {company: [{id: scope.company.id, name: scope.company.company_name}]};
    messengerService.clear();
    scope.createAppointment();
    expect(messengerService.getData()).toEqual(obj);
    expect(location.path()).toEqual('/appointment');
  });

  it('clearPersonForm - clear person object and close person form', function () {
    scope.company.person = {id: 1};
    scope.showPersonForm = true;
    scope.clearPersonForm();
    expect(scope.company.person).toEqual({roleBox: [], positionBox: []});
    expect(scope.showPersonForm).toBe(false);
  });

  it('verifyFormPerson - verify person form', function () {
    scope.company.person = {};
    expect(scope.verifyFormPerson()).toBe(false);
    scope.company.person.first_name = 'Test';
    expect(scope.verifyFormPerson()).toBe(false);
    scope.company.person.last_name = 'Test';
    expect(scope.verifyFormPerson()).toBe(true);
  });

  it('insertPerson - insert person', function () {
    //expect(scope.showPersonForm).toBe(false);
  });

  it('reloadPeople - set hash for reload pagination list', function () {
    scope.peoplePaging.dataLoaderParams.reloadHash = null;
    scope.reloadPeople();
    expect(scope.peoplePaging.dataLoaderParams.reloadHash).not.toBe(null);
  });

  it('revokePeople - revoke people', function () {
    scope.company = {id: 162};
    scope.people = [{id: 1}, {id: 2}, {id: 3}, {id: 9}];

    scope.selectedPeopleObj = {};
    scope.revokePeople();
    expect(scope.people.length).toBe(4);
    expect(scope.people[0].id).toBe(1);

    scope.selectedPeopleObj = {1: true, 2: true, 3: true, 9: false};
    httpBackend.expectDELETE('/api/people-companies/company/162/people/1,2,3').respond(201, {message: {type: constants.MESSAGE_SUCCESS}});
    scope.revokePeople();
    alerts.getModal()[0].buttons[0].onClick();
    httpBackend.flush();
    expect(scope.people.length).toBe(1);
    expect(scope.people[0].id).toBe(9);
  });

  it('refreshDataAfterRevokePeople - refresh data after revoke people', function () {
    var obj = {companyId: 1, people: ['1', '2', '3']}, response = {message: {type: constants.MESSAGE_SUCCESS}};
    scope.people = [{id: 1}, {id: 2}, {id: 3}, {id: 9}];
    scope.selectedPeopleObj = {1: true, 2: true, 3: true, 9: true};
    scope.refreshDataAfterRevokePeople(response, obj);
    expect(scope.people.length).toBe(1);
    expect(scope.people[0].id).toBe(9);
  });

  it('isSelectedPeople', function () {
    scope.selectedPeopleObj = {};
    expect(scope.isSelectedPeople()).toBe(false);
    scope.selectedPeopleObj = {id: 1};
    expect(scope.isSelectedPeople()).toBe(true);
  });

  it('initDataForAgenda - initial data for Agenda', function () {
    scope.company = {id: 10, company_name: 'Velká společnost'};
    scope.initDataForAgenda();
    expect(scope.dataForAgenda.appointment.company[0].id).toBe(10);
    expect(scope.dataForAgenda.appointment.company[0].name).toBe('Velká společnost');
    expect(scope.dataForAgenda.task.company[0].id).toBe(10);
    expect(scope.dataForAgenda.task.company[0].name).toBe('Velká společnost');
  });
});
