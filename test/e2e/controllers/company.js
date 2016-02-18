/*jslint node: true*/
'use strict';

describe('Page company', function () {
  it('Page company', function () {
    /*browser.get('http://127.0.0.1:9000/#/login');
     element(by.model('credentials.login')).sendKeys('martin@DEALINTEAL');
     element(by.model('credentials.password')).sendKeys('developer');
     element(by.model('credentials.pin')).sendKeys('notia');*/

    //browser.get('http://vps.notia.cz/#/company/25589');
    browser.get('http://127.0.0.1:9000/#/company');
  });
  //beforeEach(function () {
  //});

  it('Výpis záložek', function () {
    expect(element.all(by.repeater('item in items')).count()).toEqual(7);
  });

  it('Adresy tlačítko plus - viditelné', function () {
    if (element.all(by.repeater('item in address')).count() > 1) {
      expect(element(by.css('.js-address-plus')).isDisplayed()).toBe(true);
    } else {
      expect(element(by.css('.js-address-plus')).isDisplayed()).toBe(false);
    }
  });

  it('Adresy tlačítko plus - viditelné po existenci první adresy', function () {
    expect(element(by.css('.js-address-plus')).isDisplayed()).toBe(false);
    element(by.name('XXX1')).sendKeys('Test');
    expect(element(by.css('.js-address-plus')).isDisplayed()).toBe(true);
  });

  it('Adresy záložky - přidání tří adres', function () {
    element(by.name('XXX1')).clear();
    element(by.name('XXX1')).sendKeys('Test');
    element(by.css('.js-address-plus')).click();
    element(by.name('XXX1')).sendKeys('Test2');
    element(by.css('.js-address-plus')).click();
    element(by.name('XXX1')).sendKeys('Test3');
    expect(element.all(by.repeater('item in address')).count()).toEqual(3);
    expect(element(by.css('.js-address-plus')).isDisplayed()).toBe(false);
  });

  it('Tlačítka CRUD - kontrola zobrazení - nový záznam', function () {
    //element(by.name('XXX1')).clear();
    browser.get('http://127.0.0.1:9000/#/company');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');

    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
    element(by.name('XXX1')).sendKeys('Test');
    expect(element(by.name('CANCEL')).getAttribute('class')).not.toMatch('disabled');

    element(by.name('XXX1')).clear();
    expect(element(by.css('li[data-name="DELETE_COMPANY_ADDRESS"]')).getAttribute('class')).toMatch('disabled');
    element(by.name('XXX1')).sendKeys('Test');
    expect(element(by.css('li[data-name="DELETE_COMPANY_ADDRESS"]')).getAttribute('class')).not.toMatch('disabled');
  });

  it('Tlačítka CRUD - kontrola zobrazení - existující záznam', function () {
    var exists = false, vals = '';
    //element(by.name('XXX1')).clear();
    browser.get('http://127.0.0.1:9000/#/company/1');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.name('DELETE')).getAttribute('class')).not.toMatch('disabled');

    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
    element(by.name('XXX1')).sendKeys('Test');
    expect(element(by.name('CANCEL')).getAttribute('class')).not.toMatch('disabled');

    element(by.name('XXX1')).clear();
    // zjistit ze mam prazdnou adresu a pak dale
    element(by.name('XXX1')).getAttribute().then(function (data) {
      vals += data;
      element(by.name('XXX2')).getAttribute().then(function (data) {
        vals += data;
        element(by.name('XXX3')).getAttribute().then(function (data) {
          vals += data;
          element(by.name('XXX4')).getAttribute().then(function (data) {
            vals += data;
            element(by.name('XXX7')).getAttribute().then(function (data) {
              vals += data;
              element(by.id('XXX8')).getAttribute().then(function (data) {
                vals += data;
                element(by.name('XXX19')).getAttribute().then(function (data) {
                  vals += data;
                  element(by.name('XXX99')).getAttribute().then(function (data) {
                    vals += data;
                    element(by.name('XXX20')).getAttribute().then(function (data) {
                      vals += data;
                      element(by.name('XXX9')).getAttribute().then(function (data) {
                        vals += data;
                        element(by.name('XXX10')).getAttribute().then(function (data) {
                          vals += data;
                          element(by.name('XXX100')).getAttribute().then(function (data) {
                            vals += data;
                            element(by.name('XXX21')).getAttribute().then(function (data) {
                              vals += data;
                              element(by.name('XXX22')).getAttribute().then(function (data) {
                                vals += data;
                                element(by.name('XXX12')).getAttribute().then(function (data) {
                                  vals += data;
                                  element(by.name('XXX13')).getAttribute().then(function (data) {
                                    vals += data;
                                    element(by.name('XXX14')).getAttribute().then(function (data) {
                                      vals += data;
                                      exists = vals !== '';
                                      if (exists) {
                                        expect(element(by.css('li[data-name="DELETE_COMPANY_ADDRESS"]')).getAttribute('class')).not.toMatch('disabled');
                                      } else {
                                        expect(element(by.css('li[data-name="DELETE_COMPANY_ADDRESS"]')).getAttribute('class')).toMatch('disabled');
                                        element(by.name('XXX1')).sendKeys('Test');
                                        expect(element(by.css('li[data-name="DELETE_COMPANY_ADDRESS"]')).getAttribute('class')).not.toMatch('disabled');
                                      }
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

/*    exists = vals !== '';
    if (exists) {
      expect(element(by.name('DELETE_COMPANY_ADDRESS')).getAttribute('class')).not.toMatch('disabled');
    } else {
      expect(element(by.name('DELETE_COMPANY_ADDRESS')).getAttribute('class')).toMatch('disabled');
      element(by.name('XXX1')).sendKeys('Test');
      expect(element(by.name('DELETE_COMPANY_ADDRESS')).getAttribute('class')).not.toMatch('disabled');
    }*/
  });
});
