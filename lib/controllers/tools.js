/**
 * Created by Martin on 29.11.13.
 */
/*jslint node: true, regexp: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_Tools
 */

/**
 * @namespace __Server_Tools
 * @author Martin Boháč
 */

var crypto = require('crypto'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  nodemailer = require('nodemailer'),
  conn = require('./connections'),
  socketio = require('./socketio'),
  Promise = require('promise'),
  stackForTimeout;


exports.isDevelopment = false;

/**
 * @memberof __Server_Tools
 * @method
 * @name getLoginToken
 * @description get login token from cookies
 * @param req {Object} request reference object
 * @returns String
 */
exports.getLoginToken = function (req) {
  try {
    return req.signedCookies.auth_token;
  } catch (e) {
    return '';
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name deleteCookie
 * @description delete cookie
 * @param res {Object} response reference object
 * @param name {String} name of cookie
 * @returns void
 */
exports.deleteCookie = function (res, name) {
  try {
    res.clearCookie(name);
    //res.cookie(name, '', {expires: new Date(1), path: '/' });
  } catch (e) {
    console.log(e);
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name createCookie
 * @description create cookies
 * @param res {Object} response reference object
 * @param name {String} name cookie
 * @param value {Object} value cookie
 * @returns void
 */
exports.createCookie = function (res, name, value, httpOnly, signed) {
  try {
    res.cookie(name, value, { /*maxAge: expiration,*/ httpOnly: httpOnly, signed: signed/*, secure: true*/ });
  } catch (e) {
    console.log(e);
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name insertUser
 * @description insert user to DB(users_login, people)
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} user data
 * @returns void
 */
exports.insertUser = function (req, res, obj) {
  try {
    var encrypted = crypto.createHmac('sha1', 'Notia.1*').update(obj.password).digest('hex'),
      valsPeople = ['', obj.first_name, obj.last_name],
      valsUsers = ['', obj.login, encrypted];

    postgres.select('select nextval(\'seq_people_id\') as ID', [], req).then(
      function (result) {
        valsUsers[0] = tools.getSingleResult(result).id;
        return postgres.executeSQL(req, res, 'INSERT INTO USERS_LOGIN(PEOPLE_ID, LOGIN_NAME, LOGIN_PASSWORD) VALUES($1::integer, $2::varchar, $3::varchar)', valsUsers);
      },
      function () {
        res.json(constants.E500);
      }
    ).then(
      function () {
        valsPeople[0] = valsUsers[0];
        return postgres.executeSQL(req, res, 'INSERT INTO PEOPLE(ID, FIRST_NAME, LAST_NAME) VALUES($1::integer, $2::varchar, $3::varchar)', valsPeople);
      },
      function () {
        res.json(constants.E500);
      }
    ).then(
      function () {
        res.json(constants.OK);
      },
      function () {
        res.json(constants.E500);
      }
    );
  } catch (e) {
    res.json(constants.E500);
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name authRequest
 * @description authentication user for request
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Function} next reference object
 * @returns void
 */
exports.authRequest = function (req, res, next) {
  var whiteList = ['/api/login', '/api/logout', '/', '/api/pre_login.html'], whiteListLike = ['/api/exchange/'], i, l, str;
  for (i = 0, l = whiteListLike.length; i < l; i += 1) {
    str = whiteListLike[i];
    if (str === req.url.substring(0, str.length)) {
      next();
      return;
    }
  }
  if (whiteList.indexOf(req.url) === -1 && req.url.substring(0, 5) === '/api/') {
    //console.log('authRequest');
    tools.auth(req, res).then(
      function (isAuth) {
        if (isAuth) {
          next();
        } else {
          tools.prepareCloseConnection(res);
        }
      },
      function () {
        tools.prepareCloseConnection(res);
      }
    );
  } else {
    next();
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name auth
 * @description authentication user and set token expire
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.auth = function (req, res) {
  return new Promise(function (resolve, reject) {
    try {
      var loginToken = req.signedCookies.auth_token,
        isAuth = false,
        expire;
      postgres.select("SELECT COALESCE((SELECT MAX(1) FROM USERS_LOGIN u WHERE LOGIN_TOKEN = $1 AND LOGIN_TOKEN_EXPIRATION >= CURRENT_TIMESTAMP),0) AS EXIST", [loginToken], req).then(
        function (data) {
          expire = "NULL";
          if (data.rows) {
            if (data.rows[0].exist === 1 || tools.isDevelopment) {
              expire = "CURRENT_TIMESTAMP + '0.5 hour'";
              isAuth = true;
            }
          }
          postgres.executeSQL(req, res, "UPDATE USERS_LOGIN SET LOGIN_TOKEN_EXPIRATION = " + expire + " WHERE LOGIN_TOKEN = $1", [loginToken], null, null);
          if (isAuth) {
            tools.refreshTimerForCloseConnection(req);
            resolve(isAuth);
          } else {
            reject('not authorization');
          }
        },
        function () {
          reject('error in pg select');
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * @memberof __Server_Tools
 * @method
 * @name useXSRF
 * @description check page with whitelist
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @param fce {Function} callback
 * @returns void
 */
exports.useXSRF = function (req, res, next, fce) {
  //var WHITE_LIST = tools.isDevelopment ? ['/api/login', '/menu', '/test', '/home', '/api/rooms/list'] : [],
  var WHITE_LIST = ['/api/login', '/api/pre_login.html', '/menu', '/test', '/home', '/api/rooms/list'],
    WHITE_LIST_LIKE = ['/api/exchange/'],
    i,
    l,
    str;
  if (req.url.substring(0, 4) !== '/api') {
    next();
    return;
  }
  for (i = 0, l = WHITE_LIST_LIKE.length; i < l; i += 1) {
    str = WHITE_LIST_LIKE[i];
    if (str === req.url.substring(0, str.length)) {
      next();
      return;
    }
  }
  if (WHITE_LIST.indexOf(req.url) !== -1) {
    next();
  } else {
    fce(req, res, next);
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name xsrfValue
 * @description return XSRF token
 * @param req {Object} request reference object
 * @returns String
 */
exports.xsrfValue = function (req) {
  var token = (req.body && req.body.csrf)
    || (req.query && req.query.csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token'])
    || (req.headers['X-CSRF-TOKEN'])
    || (req.headers['X-XSRF-TOKEN']);
  return token;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name decodeURINotia
 * @description return decodeURIComponent String
 * @param vals {String}
 * @returns String
 */
exports.decodeURINotia = function (vals) {
  var tmp = [], pom, i, l;
  for (i = 0, l = vals.length; i < l; i += 1) {
    pom = (vals[i] === '' || vals[i] === 'undefined') ? null : decodeURIComponent(vals[i]);
    tmp.push(pom);
  }
  return tmp;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getSingleResult
 * @description return object row of sql select
 * @param result {Object}
 * @returns Object
 */
exports.getSingleResult = function (result) {
  var obj = {};
  if (result) {
    if (result.rows) {
      if (result.rows[0]) {
        obj = result.rows[0];
      }
    } else {
      obj = result;
    }
  }
  // !!! all fields type of date convert to ISO date time zone 0 !!!
  tools.setDateToUTC0(obj);
  return obj;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name rPad
 * @description filled chars to string
 * @param pad {String} chars for filled
 * @returns String
 */
exports.rPad = function (pad, str) {
  return pad.substring(0, pad.length - str.length) + str;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name dateToISO8601
 * @description get ISO string from date
 * @param date {Date}
 * @returns String
 */
exports.dateToISO8601 = function (date) {
  var utc, y, m, d, h, mi, s, ms;
  y = date.getFullYear().toString();
  m = tools.rPad('00', (date.getMonth() + 1).toString());
  d = tools.rPad('00', date.getDate().toString());
  h = tools.rPad('00', date.getHours().toString());
  mi = tools.rPad('00', date.getMinutes().toString());
  s = tools.rPad('00', date.getSeconds().toString());
  ms = tools.rPad('000', date.getMilliseconds().toString());

  utc = y + '-' + m + '-' + d + 'T' + h + ':' + mi + ':' + s + '.' + ms + 'Z'; //   '2014-02-02T19:00:00.000Z';
  return utc;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name setDateToUTC0
 * @description set all date fields to date ISO 8601
 * @param result {Object}
 * @returns void
 */
exports.setDateToUTC0 = function (result) {
  var key;
  for (key in result) {
    if (result.hasOwnProperty(key)) {
      if (tools.isDate(result[key])) {
        result[key] = tools.dateToISO8601(result[key]);
      }
    }
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name isDate
 * @description check arg is Date
 * @param arg {Object}
 * @returns Boolean
 */
exports.isDate = function (arg) {
  try {
    return typeof arg.getFullYear === 'function';
  } catch (e) {
    return false;
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getMultiResult
 * @description return array rows of sql select
 * @param result {Object}
 * @returns Array
 */
exports.getMultiResult = function (result) {
  var obj = [], i, l;
  if (result) {
    if (result.rows) {
      //obj = result.rows;
      for (i = 0, l = result.rows.length; i < l; i += 1) {
        // !!! all fields type of date convert to ISO date time zone 0 !!!
        tools.setDateToUTC0(result.rows[i]);
        obj.push(result.rows[i]);
      }
    }
  }
  return obj;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name setNullForEmpty
 * @description set null for property with empty value ("")
 * @param obj {Object}
 * @returns void
 */
exports.setNullForEmpty = function (obj) {
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === '') {
        obj[key] = null;
      }
    }
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name setNullForEmpty
 * @description set null for property with empty value ("")
 * @param type {Object}
 * @returns Object
 */
exports.getHttpStatus = function (type) {
  return type;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getValidationMessage
 * @description get message for validation length
 * @param name {String} name of field
 * @param message {String} error message
 * @param from {Number} length from
 * @param to {Number} length to
 * @returns String
 */
exports.getValidationMessage = function (name, message, from, to) {
  var tmp;
  tmp = name + ' ' + message;
  if (to) {
    tmp += ' ' + from + ' - ' + to;
  }
  return tmp;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name validateEmail
 * @description validate email
 * @param value {String} email
 * @returns Boolean
 */
exports.validateEmail = function (value) {
  var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    result = value ? re.test(value) : true;
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name validatePhone
 * @description validate phone
 * @param value {String} phone
 * @returns Boolean
 */
exports.validatePhone = function (value) {
  var re = /^(\+420)? ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}$/,
    result = value ? re.test(value) : true;
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name validateZip
 * @description validate zip
 * @param value {String} zip
 * @returns Boolean
 */
exports.validateZip = function (value) {
  var re = /\d{3} ?\d{2}/,
    result = value ? re.test(value) : true;
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name prepareCredentials
 * @description prepare credentails data from request
 * @param req {Object} request reference object
 * @returns Object
 */
exports.prepareCredentials = function (req) {
  var loginInput = ['', ''],
    credentials = {
      connectString: '',
      userApp: '',
      password: '',
      passwordApp: ''
    };
  if (req.body.credentials && req.body.credentials.login) {
    loginInput = req.body.credentials.login.split('@');
    credentials.connectString = loginInput[1];
    credentials.userApp = loginInput[0]; // application user
    credentials.passwordApp = req.body.credentials.password; // application password
    credentials.password = req.body.credentials.pin; // DB password
  }
  return credentials;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name updateCredentials
 * @description prepare credentails data from request
 * @param credentials {Object} credentials
 * @param connectionsInfo {Object} connections info from logging DB
 * @returns void
 */
exports.updateCredentials = function (credentials, connectionsInfo) {
  if (connectionsInfo) {
    credentials.id = connectionsInfo.id;
    credentials.user = connectionsInfo.database_user;
    credentials.database = connectionsInfo.database_name;
    credentials.host = connectionsInfo.database_host;
    credentials.port = connectionsInfo.database_port;
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name sendResponseError
 * @description send response error
 * @param result {String} result from PG
 * @param res {Object} response
 * @param noCloseReq {Boolean} no request
 * @returns Object
 */
exports.sendResponseError = function (result, res, noCloseReq) {
  var r;
  if (!noCloseReq) {
    if (result === constants.PG_CONNECT_ERROR) {
      if (!res.statusCode || res.statusCode === constants.HTTP_STATUS.OK) {
        res.status(500);
      }
      r = res.json(constants.E900);
    } else {
      r = res.json(result);
    }
  }
  return r || result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name sendResponseSuccess
 * @description send response success
 * @param result {Object} result from PG
 * @param res {Object} response
 * @param noCloseReq {Boolean} no request
 * @returns Object
 */
exports.sendResponseSuccess = function (result, res, noCloseReq) {
  var r;
  if (!noCloseReq) {
    r = res.json(result);
  }
  return r || result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name parseCookies
 * @description convert cookies string to array
 * @param cookies {String} string with cookies
 * @returns Object
 */
exports.parseCookies = function (cookies) {
  var arr = [], pom = [], i, l, item = [];
  pom = cookies.split('; ');
  for (i = 0, l = pom.length; i < l; i += 1) {
    item = pom[i].split('=');
    arr[item[0]] = item[1];
  }
  return arr;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name isNumber
 * @description check if value is a number
 * @param value {String} String
 * @returns boolean
 */
exports.isNumber = function (value) {
  var i, l, pos, tmp, p = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], result, valueTmp;
  result = true;
  if (!value) {
    return false;
  }
  valueTmp = String(value);
  for (i = 0, l = valueTmp.length; i < l; i += 1) {
    tmp = valueTmp.substring(i, i + 1);
    pos = p.indexOf(tmp);
    if (pos === -1) {
      result = false;
      break;
    }
  }
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name validateDate
 * @description validate date
 * @param value {String} String
 * @returns boolean
 */
exports.validateDate = function (value) {
  var sep, i, l, f, z, zn, pos, tmp, val, frmt = constants.DATE_FORMAT, result = true;
  tmp = frmt;
  tmp = tmp.replace(/m/gi, '');
  tmp = tmp.replace(/d/gi, '');
  tmp = tmp.replace(/y/gi, '');
  sep = tmp[0];
  val = value.split(sep);
  f = frmt.split(sep);
  result = val.length === 3;
  if (result) {
    for (i = 0, l = f.length; i < l; i += 1) {
      z = f[i].toUpperCase();
      if (z[0] === 'Y') {
        pos = i;
        zn = f[i];
      }
    }
    for (i = 0, l = val.length; i < l; i += 1) {
      result = result && exports.isNumber(val[i]);
      if (pos === i) {
        result = result && (zn.length === val[i].length);
      }
    }
  }
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name validateIsoDate
 * @description validate date
 * @param value {String} String
 * @returns boolean
 */
exports.validateIsoDate = function (value) {
  /* ISOString: YYYY-MM-DDTHH:mm:ss.sssZ */
  var result, re = /^([\+\-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+\-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
  result = value ? re.test(value) : true;
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getStringFromArray
 * @description get string from array on possition with comma
 * @param str {String} string
 * @param count {Number} possition
 * @param comma {String} comma
 * @returns String
 */
exports.getStringFromArray = function (str, count, comma) {
  var arr = str.split(comma), i, l, e = 0;
  for (i = 0, l = arr.length; i < l; i += 1) {
    if (arr[i] && arr[i] !== comma) {
      e += 1;
    }
    if (e === count) {
      return arr[i];
    }
  }
  return null;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name addMonths
 * @description add months
 * @param date {Date}
 * @param c {Number} amount
 * @returns Date
 */
exports.addMonths = function (date, c) {
  var newDate, year, month, i;
  year = date.getFullYear();
  month = date.getMonth() + 1;
  if (c >= 0) {
    for (i = 0; i < c; i += 1) {
      if (month === 12) {
        month = 1;
        year += 1;
      } else {
        month += 1;
      }
    }
  } else {
    for (i = 0; i < (c * -1); i += 1) {
      if (month === 1) {
        month = 12;
        year -= 1;
      } else {
        month -= 1;
      }
    }
  }
  newDate = new Date(year, month, 0, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()); // v teto konstrukci kde den je 0 se mesic bere z rozsahu 1 - 12 oproti ostatni deklaraci, pokud je den 0, vraci to posledni den v mesici a mesic se zadava kalendarni
  return date.getDate() > newDate.getDate() ? newDate : new Date(year, month - 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getColorEventForCalendar
 * @description get color with type event
 * @param event {Object}
 * @returns String
 */
exports.getColorEventForCalendar = function (event) {
  var result;
  // for appointment
  if (event.type === constants.TYPE_CALENDAR_EVENT_APPOINTMENT) {
    // set color for type
    switch (parseInt(event.typeId, 10)) {
    case 1:
      result = 'SkyBlue';
      break;
    case 2:
      result = 'YellowGreen';
      break;
    case 3:
      result = 'Blue';
      break;
    case 4:
      result = 'DarkGreen';
      break;
    }
  }
  // for reminder
  if (event.type === constants.TYPE_CALENDAR_EVENT_REMINDER) {
    // set color for type
    result = 'Orange';
  }
  return result;
};

/**
 * @memberof __Server_Tools
 * @method
 * @name sendEmail
 * @description send email
 * @param obj {Object}
 * @returns void
 */
exports.sendEmail = function (obj) {
  var transporter = nodemailer.createTransport();
  transporter.sendMail({
    from: 'notia@notia.cz',
    to: obj.recipient,
    subject: obj.subject,
    text: obj.text
  });
};

/**
 * @memberof __Server_Tools
 * @method
 * @name prepareCloseConnection
 * @description prepare close connecton
 * @param res {Object} response
 * @returns void
 */
exports.prepareCloseConnection = function (res) {
  res.status(401);
  tools.deleteCookie(res, 'auth_token');
  tools.sendResponseError(constants.PG_CONNECT_ERROR, res, false);
};

/**
 * @memberof __Server_Tools
 * @method
 * @name refreshTimerForCloseConnection
 * @description refresh timer for close connecton
 * @param req {Object} request
 * @returns void
 */
exports.refreshTimerForCloseConnection = function (req) {
  var connObj, pause;
  pause = constants.CONNECTION_LOST_TIME;
  //connObj = conn.getConnection(req);
  //connObj.closeConnectionTime = connObj.closeConnectionTime || new Date();
  //clearTimeout(connObj.closeConnectionTimer);
  clearTimeout(stackForTimeout);
  //connObj.closeConnectionTimer = setTimeout(function () {
  stackForTimeout = setTimeout(function () {
    /*if ((new Date() - (connObj.closeConnectionTime || 0)) >= constants.CONNECTION_LOST_TIME) {
      connObj.closeConnectionTime = new Date();
      tools.sendWarningForCloseConnection(req);
    }*/
    tools.sendWarningForCloseConnection(req);
  }, pause);
};

/**
 * @memberof __Server_Tools
 * @method
 * @name sendWarningForCloseConnection
 * @description send warning for close connecton
 * @param req {Object} request
 * @returns void
 */
exports.sendWarningForCloseConnection = function (req) {
  var messages = [
    {
      message: {
        type: constants.MESSAGE_WARNING_MODAL_CONN_LOST
      },
      users: [
        req.signedCookies.auth_token
      ]
    }
  ];
  socketio.sendForUsers(messages);
};

/**
 * @memberof __Server_Tools
 * @method
 * @name authExportImport
 * @description authentication user for export/import
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Function} next reference object
 * @returns void
 */
exports.authExportImport = function (req, res, next) {
  if (req.url.substring(0, 12) === '/api/exchange/') {
    if ((req.body.hash || req.query.hash) === constants.INTERNAL_TOKEN) {
      next();
    } else {
      res.status(401);
      tools.sendResponseError(constants.PG_CONNECT_ERROR, res, false);
    }
  } else {
    next();
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name replaceCsv
 * @description replace chars for export csv
 * @param str {String} str
 * @param delimiter {String} delimiter
 * @returns String
 */
exports.replaceCsv = function (str, delimiter) {
  var ex = false;
  if (str && str.indexOf && str.indexOf('"') > -1) {
    ex = true;
    str = str.replace(/"/g, '""');
  }
  if (str && str.indexOf && str.indexOf(delimiter) > -1) {
    ex = true;
  }
  if (ex) {
    str = '"' + str + '"';
  }
  return str || '';
};

/**
 * @memberof __Server_Tools
 * @method
 * @name setUpdateProperty
 * @description set update property for sql
 * @param val {String} str
 * @param column {String} column
 * @param vals {Array} vals
 * @param sqlColumns {Array} sqlColumns
 * @returns void
 */
exports.setUpdateProperty = function (val, column, vals, sqlColumns) {
  if (val === undefined) {
    vals.push(val);
    sqlColumns.push(column + ' = $' + vals.length);
  }
};

/**
 * @memberof __Server_Tools
 * @method
 * @name getReqResObject
 * @description get object with req res properties for internal use
 * @param req {Object} request reference object
 * @returns Object
 */
exports.getReqResObject = function (req) {
  var obj = {}, errPush;
  errPush = function (arg) {
    if (!obj.errors) {
      obj.errors = [];
    }
    obj.errors.push(arg);
  };
  obj.errors = null;
  obj.req = {
    internalToken: req && req.signedCookies ? null : constants.INTERNAL_TOKEN,
    signedCookies: req && req.signedCookies ? req.signedCookies : {auth_token: null},
    noCloseReq: true,
    validationErrors: function () {
      return obj.errors;
    },
    assert: function (name, desc) {
      var value;
      if (obj.req.body) {
        value = obj.req.body[name];
      }
      if (obj.req.params) {
        value = obj.req.params[name];
      }
      if (obj.req.query) {
        value = obj.req.query[name];
      }
      return {
        notEmpty: function () {
          if (!value) {
            errPush({name: desc});
          }
        },
        isInt: function () {
          if (!tools.isNumber(value)) {
            errPush({name: desc});
          }
        },
        len: function (from, to) {
          if (value && (String(value).length < from || String(value).length > to)) {
            errPush({name: desc});
          }
        }
      };
    }
  };
  obj.res = {
    json: function (result) {
      return result;
    }
  };
  return obj;
};
