/*jslint node: true, unparam: true*/

'use strict';

describe('Page reminder', function () {
  it('Page reminder', function () {
    browser.get('http://127.0.0.1:9000/#/reminder');
  });

  it('Recipient id - Radio', function () {
    expect(element(by.model('reminderTmp.remind')).getAttribute('value')).toBe('1');
  });

});
