/*jslint node: true*/
'use strict';

describe('Page person', function () {
  it('Page person', function () {
    browser.get('http://127.0.0.1:9000/#/person');
  });

  it('Výpis záložek', function () {
    expect(element.all(by.css('.js-master-pills li')).count()).toEqual(7);
  });

  it('Viditelná pole', function () {
    expect(element(by.model('person.first_name')).isDisplayed()).toBe(true);
    expect(element(by.model('person.home_addr_street')).isDisplayed()).toBe(false);
    expect(element(by.id('XXB1')).isDisplayed()).toBe(false); //person.company_name
    element(by.repeater('items').row(2)).click();
    expect(element(by.model('person.first_name')).isDisplayed()).toBe(false);
    expect(element(by.model('person.home_addr_street')).isDisplayed()).toBe(true);
    expect(element(by.id('XXB1')).isDisplayed()).toBe(false); //person.company_name
    element(by.repeater('items').row(3)).click();
    expect(element(by.model('person.first_name')).isDisplayed()).toBe(false);
    expect(element(by.model('person.home_addr_street')).isDisplayed()).toBe(false);
    expect(element(by.id('XXB1')).isDisplayed()).toBe(true); //person.company_name
  });

  it('Enablování tlačítek - nový záznam', function () {
    element(by.repeater('items').row(1)).click();
    expect(element(by.name('DELETE')).getAttribute('class')).toMatch('disabled');
    expect(element(by.css('li[data-name="DELETE_THIS_PERSON"]')).getAttribute('class')).toMatch('disabled');
    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');
    element(by.model('person.first_name')).sendKeys('Test');
    expect(element(by.name('DELETE')).getAttribute('class')).toMatch('disabled');
    expect(element(by.css('li[data-name="DELETE_THIS_PERSON"]')).getAttribute('class')).toMatch('disabled');
    expect(element(by.name('CANCEL')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');
    element(by.model('person.first_name')).clear();
    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
  });

  it('Enablování tlačítek - existující záznam', function () {
    browser.get('http://127.0.0.1:9000/#/person/82317');
    var vals = element(by.model('person.first_name')).getAttribute('value');
    expect(element(by.name('DELETE')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.css('li[data-name="DELETE_THIS_PERSON"]')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');
    element(by.model('person.first_name')).sendKeys('Test');
    expect(element(by.name('DELETE')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.css('li[data-name="DELETE_THIS_PERSON"]')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.name('CANCEL')).getAttribute('class')).not.toMatch('disabled');
    expect(element(by.name('SAVE')).getAttribute('class')).not.toMatch('disabled');
    element(by.model('person.first_name')).clear();
    expect(element(by.name('CANCEL')).getAttribute('class')).not.toMatch('disabled');
    element(by.model('person.first_name')).sendKeys(vals);
    expect(element(by.name('CANCEL')).getAttribute('class')).toMatch('disabled');
  });

});
