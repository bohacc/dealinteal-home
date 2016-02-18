/*jslint node: true, unparam: true */
'use strict';

var tools = require('../controllers/tools'),
  people = require('../controllers/people');

exports.getLoginToken = function (test) {
  var signedCookies = {auth_token: 'TESTOVACITOKEN'};
  test.ok(tools.getLoginToken({signedCookies: signedCookies}) === 'TESTOVACITOKEN', "error");
  test.done();
};

/*exports.insertUser = function (test) {
  var tempFirstName = 'PAJA', tempLastName = 'TEST NAME' + Math.random();
  tools.insertUser(
    {},
    {
      json: function (result) {
        test.ok(result.message.type === 'SUCCESS', "error");
        people.searchStr(
          {
            params: {str: tempLastName}
          },
          {
            json: function (result) {
              people.delete(
                {
                  params: {id: result[0].id},
                  validationErrors: function () {
                    return null;
                  },
                  assert: function (arg, msg) {
                    return {
                      notEmpty: function () {
                        test.throws({}, 'assert', msg);
                      }
                    };
                  }
                },
                {
                  json: function (result) {
                    test.done();
                  }
                }
              );
            }
          }
        );
      }
    },
    {
      first_name: tempFirstName,
      last_name: tempLastName,
      login: 'PAJA',
      password: 'PAJA'
    }
  );
};*/

exports.rPad = function (test) {
  test.ok(tools.rPad('0000', '11') === '0011', "error");
  test.done();
};

exports.validateEmail = function (test) {
  test.ok(tools.validateEmail('neco') === false, "missing . and @");
  test.ok(tools.validateEmail('neco.cz') === false, "missing @");
  test.ok(tools.validateEmail('neco@cz') === false, "missing .");
  test.ok(tools.validateEmail('neco.cz@cz') === false, ". and @ in bad order");
  test.ok(tools.validateEmail('neco@cz@aa.cz') === false, "too much @");
  test.ok(tools.validateEmail('n eco@nic.cz') === false, "bad format");

  test.ok(tools.validateEmail('neco@nic.cz') === true, "bad value");
  test.done();
};

exports.validatePhone = function (test) {
  test.ok(tools.validatePhone('abcdefghi') === false, "no numbers");
  test.ok(tools.validatePhone('a66111222') === false, "only numbers");
  test.ok(tools.validatePhone('6661112220') === false, "too long");
  test.ok(tools.validatePhone('66611122') === false, "too short");
  test.ok(tools.validatePhone('00420666111222') === false, "only with +420");
  test.ok(tools.validatePhone('0042666111222') === false, "only with +420");

  test.ok(tools.validatePhone('666111222') === true, "bad value");
  test.ok(tools.validatePhone('+420666111222') === true, "bad value");
  test.ok(tools.validatePhone('666 111 222') === true, "bad value");

  test.ok(tools.validatePhone('66a 111 222') === false, "bad format");
  test.ok(tools.validatePhone('666a111a222') === false, "bad value");
  test.ok(tools.validatePhone('66 6111 222') === false, "bad format");
  test.ok(tools.validatePhone('66611 122 2') === false, "bad format");
  test.ok(tools.validatePhone('66601110222') === false, "too long");
  test.done();
};

exports.validateZip = function (test) {
  test.ok(tools.validateZip('abcde') === false, "no numbers");
  test.ok(tools.validateZip('1500a') === false, "only value");
  test.ok(tools.validateZip('1500') === false, "too short");

  test.ok(tools.validateZip('15000') === true, "bad value");
  test.ok(tools.validateZip('150 00') === true, "bad value");

  test.ok(tools.validateZip('1a0 00') === false, "bad format");
  test.ok(tools.validateZip('15 000') === false, "bad format");
  test.ok(tools.validateZip('150 0 ') === false, "bad format");
  test.ok(tools.validateZip('150a00') === false, "bad format");
  /*test.ok(tools.validateZip('150500') === false, "too long");*/
  test.done();
};

exports.prepareCredentials = function (test) {
  var cred, body;
  body = {
    credentials: {
      login: 'paja@jaja.cz',
      password: 'paja',
      pin: '0123'
    }
  };
  cred = tools.prepareCredentials({body: body});
  test.ok(cred.connectString === 'jaja.cz', "bad connectString");
  test.ok(cred.userApp === 'paja', "bad userApp");
  test.ok(cred.passwordApp === 'paja', "bad passwordApp");
  test.ok(cred.password === '0123', "bad password");
  test.done();
};

exports.updateCredentials = function (test) {
  var credentials, connectionsInfo, a;
  credentials = {
    login: 'paja@jaja.cz',
    password: 'paja',
    pin: '0123'
  };
  connectionsInfo = {
    id: '666',
    database_user: 'nicka',
    database_name: 'malware',
    database_host: '14.15.16.17',
    database_port: '2222'
  };
  a = tools.updateCredentials(credentials, connectionsInfo);
  test.ok(credentials.id === '666', "bad id");
  test.ok(credentials.user === 'nicka', "bad database_user");
  test.ok(credentials.database === 'malware', "bad database_name");
  test.ok(credentials.host === '14.15.16.17', "bad database_host");
  test.ok(credentials.port === '2222', "bad database_port");
  test.done();
};

exports.parseCookies = function (test) {
  var cookies = 'login=test; io=asd21fasfgsdfg2; session=123456789', cookiesArray = [];
  cookiesArray = tools.parseCookies(cookies);
  test.ok(cookiesArray.login === 'test', "empty list");
  test.ok(cookiesArray.io === 'asd21fasfgsdfg2', "property ID not found");
  test.ok(cookiesArray.session === '123456789', "property COMPANYNAME not found");
  test.done();
};

exports.isNumber = function (test) {
  test.ok(tools.isNumber(393732), "is not number");
  test.ok(tools.isNumber('39373a') === false, "is not number");
  test.done();
};

exports.validateDate = function (test) {
  test.ok(tools.validateDate('1.1.2010'), "is not date");
  test.ok(tools.validateDate('01.01.2010'), "is not date");
  test.ok(tools.validateDate('14.12.2010'), "is not date");
  test.ok(tools.validateDate('2010.1.1') === false, "is not date");
  test.ok(tools.validateDate('1.1.201') === false, "is not date");
  test.ok(tools.validateDate('1.1-2010') === false, "is not date");
  test.ok(tools.validateDate('112010') === false, "is not date");
  test.ok(tools.validateDate('2014-12-16 09:13:37.101532') === false, "is not date");
  test.done();
};

exports.validateIsoDate = function (test) {
  test.ok(tools.validateIsoDate('2014-12-16 09:13:37.101532'), "is not iso date");
  test.ok(tools.validateIsoDate('2014-12-16 09:13:37.1'), "is not iso date");
  test.ok(tools.validateIsoDate('2014-12-16 09:13:37.') === false, "is not iso date");
  test.ok(tools.validateIsoDate('1.1.2010') === false, "is not iso date");
  test.done();
};

exports.getStringFromArray = function (test) {
  test.ok(tools.getStringFromArray('Pavel Kolomazník', 1, ' ') === 'Pavel', "bad string from array");
  test.ok(tools.getStringFromArray('Pavel Kolomazník', 2, ' ') === 'Kolomazník', "bad string from array");
  test.ok(tools.getStringFromArray('Pavel Kolomazník', 1, ',') !== 'Pavel', "bad string from array");
  test.done();
};
