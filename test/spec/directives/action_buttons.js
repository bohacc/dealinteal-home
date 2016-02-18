/*jslint node: true, unparam: true, regexp: true*/
'use strict';

describe('Directive: actionButtons', function () {

  beforeEach(module('crmPostgresWebApp'));
  beforeEach(module('app/views/directives/d_action_buttons.html'));

  var element,
    scope,
    compile,
    template,
    buttons;

  beforeEach(inject(function ($rootScope, $templateCache, $compile, $httpBackend) {
    compile = $compile;
    template = $templateCache.get('app/views/directives/d_action_buttons.html');
    $templateCache.put('views/directives/d_action_buttons.html', template);
    scope = $rootScope;
    $httpBackend.whenGET('views/login.html').respond(200, '');
  }));

  it('events on view', function () {
    scope.isChanged = false;
    scope.address = [];
    scope.company = {id: 1};
    scope.actionButtons = [
      {
        name: 'DELETE',
        dropDown: [
          {name: 'DELETE_COMPANY', onClick: null, disabled: function () {
            return !(scope.company.id);
          }},
          {name: 'DELETE_COMPANY_ADDRESS', onClick: null, disabled: function () {
            return scope.address.length === 0;
          }}
        ],
        disabled: !(scope.company.id)
      },
      {name: 'CANCEL', onClick: null, disabled: function () {
        return !scope.isChanged;
      }},
      {name: 'SAVE', onClick: null, disabled: function () {
        return false;
      }}
    ];

    element = angular.element('<action-buttons buttons="actionButtons"></action-buttons>');
    compile(element)(scope);
    scope.$digest();

    buttons = element.find('button');
    // existuji tri tlacitka
    expect(buttons.length).toEqual(3);
    // z toho jeden je dropdown se dvema polozkama
    expect(element.find('li').length).toEqual(2);

    // DELETE COMPANY
    scope.objTmp = {val: false};
    scope.company.id = null;
    scope.actionButtons[0].dropDown[0].onClick = function () {
      scope.objTmp.val = true;
    };
    element.find('#DELETE_COMPANY').click();

    // company.is is null tak se klik neprovede
    expect(scope.objTmp.val).toBe(false);

    // company.is is not null tak se klik neprovede
    scope.company.id = 1;
    element.find('#DELETE_COMPANY').click();
    expect(scope.objTmp.val).toBe(true);

    // DELETE ADDRESS
    scope.address = [];
    scope.objTmp.val = false;
    scope.actionButtons[0].dropDown[1].onClick = function () {
      scope.objTmp.val = true;
    };
    element.find('#DELETE_COMPANY_ADDRESS').click();
    // pole address je prazdne, neni zadna adresa ke smazani, klik se neprovede
    expect(scope.objTmp.val).toBe(false);

    scope.address = ['TEST'];
    scope.objTmp.val = false;
    scope.actionButtons[0].dropDown[1].onClick = function () {
      scope.objTmp.val = true;
    };
    element.find('#DELETE_COMPANY_ADDRESS').click();
    // pole address neni prazdne, adresa existuje, klik se neprovede
    expect(scope.objTmp.val).toBe(true);

    // CANCEL
    scope.objTmp = {val: false};
    scope.isChanged = false;
    scope.actionButtons[1].onClick = function () {
      scope.objTmp.val = true;
    };
    buttons[1].click();
    // není modifikace tak se klik neprovede
    expect(scope.objTmp.val).toBe(false);

    scope.isChanged = true;
    scope.actionButtons[1].onClick = function () {
      scope.objTmp.val = true;
    };
    buttons[1].click(); // click nastavi scope.objTmp.val na TRUE
    // modifikace true, klik se provede
    expect(scope.objTmp.val).toBe(true);

    // SAVE
    scope.objTmp = {val: true};
    scope.actionButtons[2].onClick = function () {
      scope.objTmp.val = false;
    };
    buttons[2].click();
    expect(scope.objTmp.val).toBe(false);

  });

  describe('Controller: actionButtons', function () {

    beforeEach(inject(function ($rootScope) {
      element = angular.element('<action-buttons buttons="actionButtons"></action-buttons>');
      compile(element)($rootScope.$new());
      $rootScope.$digest();
      scope = element.isolateScope() || element.scope();
    }));

    it('Controller - clickBtn', function () {
      var tmp = false, obj = {onClick: function () {
        tmp = true;
      }, disabled: function () {
        return false;
      }};

      scope.clickBtn(obj);
      // disabled je false, funkce se spusti a tmp se nastvi na TRUE
      expect(tmp).toBe(true);

      tmp = false;
      obj = {onClick: function () {
        tmp = true;
      }, disabled: function () {
        return true;
      }};
      scope.clickBtn(obj);
      // disabled je true, funkce se nespusti a tmp zustane FALSE
      expect(tmp).toBe(false);
    });
  });
});

