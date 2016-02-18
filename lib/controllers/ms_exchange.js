/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Milan Králíček on 10.01.2016.
 */

/*jslint node: true, unparam: true */
'use strict';

/**
 * @file ms_exchange
 * @fileOverview __Server_REST_API_MSExchange
 */

/**
 * @namespace __Server_REST_API_MSExchange
 * @author Milan Králíček
 */


// https://msdn.microsoft.com/en-us/office/office365/api/calendar-rest-operations
// https://msdn.microsoft.com/en-us/office/office365/api/contacts-rest-operations

var  postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  appointmentMsexchange = require('./appointment_msexchange'),
  Ppromise = require('promise'),
  conn = require('./connections'),
  url = require("url"),
  outlook = require("node-outlook"),
  credentials = {
    clientID: constants.MS_EXCHANGE.CREDENTIALS.CLIENT_ID,
    clientSecret: constants.MS_EXCHANGE.CREDENTIALS.CLIENT_SECRET,
    site: constants.MS_EXCHANGE.CREDENTIALS.SITE,
    authorizationPath: constants.MS_EXCHANGE.CREDENTIALS.AUTHORIZATION_PATH,
    tokenPath: constants.MS_EXCHANGE.CREDENTIALS.TOKEN_PATH
  },
  oauth2 = require("simple-oauth2")(credentials),
//  password = require('simple-oauth2/lib/client/password')(config),

  exchangeTokenAccess,
  exchangeTokenId,

  getAuthUrl,
  getTokenFromCode,
  getTokenFromDB,
  saveTokenToDB,
  tokenReceived,
  getEmailFromIdToken,
  saveToken,
  msConnect,

  contactsSynchronize,
  msContactSaveToDB,
  eventsSynchronizeMS,
  eventsSynchronizeDB,
  msEventSaveToDB;


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name getAuthUrl
 * @description msexchange getAuthUrl
 * @return String
 */
getAuthUrl = function () {
  return oauth2.authCode.authorizeURL({
    redirectUri: constants.MS_EXCHANGE.REDIRECT_URI,
    scope: constants.MS_EXCHANGE.SCOPES.join(" ")
  });
};

/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name getTokenFromCode
 * @description getTokenFromCode
 * @param authCode {Object} request reference object
 * @param callBack {Object} response reference object
 * @param req {Object} response reference object
 * @param res {Object} response reference object
 * @returns void
 */
getTokenFromCode = function (authCode, callBack, req, res) {
  var token;
  oauth2.authCode.getToken({
    code: authCode,
    redirectUri: constants.MS_EXCHANGE.REDIRECT_URI,
    scope: constants.MS_EXCHANGE.SCOPES.join(" ")
  }, function (error, result) {
    if (error) {
      callBack(req, res, error, null);
    } else {
      token = oauth2.accessToken.create(result);
      callBack(req, res, null, token);
    }
  });
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name getTokenFromDB
 * @description getTokenFromDB
 * @param connect {Object} connection to database
 * @param loginName {string} request reference object
 * @returns Promise
 */
getTokenFromDB = function (connect, loginName) {
  return new Promise(function (resolve, reject) {
    var sql;
    try {
      sql =
        'SELECT ' +
        '  exch_token_id  as "exchTokenId", ' +
        '  exch_token_access  as "exchTokenAccess" ' +
        'FROM ' +
        '  users_login ' +
        'WHERE ' +
        '  login_name = $1';
      postgres.select(sql, [loginName], null, connect).then(
        function (result) {
          resolve({id: tools.getSingleResult(result).exchTokenId, access: tools.getSingleResult(result).exchTokenAccess});
          return;
        }
      );
    } catch (e) {
      tools.sendResponseError(e, 'getTokenFromDB', false);
    }
  });
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name saveToken
 * @description saveToken
 * @param req {Object} response reference object
 * @param res {Object} response reference object
 * @returns void
 */
saveTokenToDB = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'UPDATE users_login set ' +
      ' exch_token_id = $2, ' +
      ' exch_token_access = $3 ' +
      'WHERE' +
      '  login_name = $1';
    conn.getConnectionForMsExchangeAPI().then(
      function (msExchangeConnection) {                                                       // msExchangeConnection
        postgres.executeSQL(req, res, sql, ['developer', exchangeTokenId, exchangeTokenAccess], null, null).then(
          function () {
            console.log('saveToken: ' + constants.OK);
            tools.sendResponseSuccess(constants.OK, res, false);
          },
          function () {
            console.log('saveToken: ' + constants.E500);
            tools.sendResponseError(constants.E500, res, false);
          }
        );
      }
    );
  } catch (e) {
    console.log('saveToken-e: ' + constants.E500);
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name tokenReceived
 * @description tokenReceived
 * @param res {Object} request reference object
 * @param err {Object} response reference object
 * @param token {Object} response reference object
 * @returns void
 */
tokenReceived = function (req, res, err, token) {
  if (err) {
    exchangeTokenAccess = undefined;
    exchangeTokenId = undefined;
    console.log('tokenReceived ERROR: ' + err);
  } else {
    exchangeTokenAccess = token.token.access_token;
    exchangeTokenId = token.token.id_token;
    console.log('*exchangeTokenAccess: ' + exchangeTokenAccess);
    console.log('*exchangeTokenId: ' + exchangeTokenId);

    /*
     // docasne ulozeni do cookie
     var cookies = ['node-tutorial-token-access=' + exchangeTokenAccess + ';Max-Age=3600',
     'node-tutorial-token-id=' + exchangeTokenId + ';Max-Age=3600'];
     res.setHeader('Set-Cookie', cookies);
     */

    if (exchangeTokenAccess === undefined || exchangeTokenId === undefined) {
      console.log('*: undefined');
    } else {
      saveTokenToDB(req, res);
//    res.writeHead(200, {"Content-Type": "text/html"});
//      res.write('<p>Sign saved</p>');
//      res.write('<p>/' + exchangeTokenAccess + '/</p>');
//      res.write('<p>/' + exchangeTokenId + '/</p>');
//    res.end();
    }
  }
};



/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name msConnect
 * @description msexchange msConnect
 * @param connect {Object} connection to database
 * @param user {Object}
 * @returns void
 */
msConnect = function (connect, user) {
  console.log('msConnect: ' + user.loginName);
  /*
   var sql, rows, i, l;
   try {
   conn.getConnectionForMsExchangeAPI().then(
   function (msExchangeConnection) {
   return postgres.select(sql, [], null, msExchangeConnection).then(
   function (result) {
   rows = tools.getMultiResult(result);
   for (i = 0, l = rows.length; i < l; i += 1) {
   if (rows[i].loginName) {
   console.log(rows[i].loginName);
   }
   }
   }
   );
   }
   );
   } catch (e) {
   tools.sendResponseError(e, 'getConnectionForMsExchangeAPI', false);
   }
   */
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name loginUrl
 * @description msexchange loginUrl
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.loginUrl = function (req, res) {
  var url_parts = url.parse(req.url, true),
    code = url_parts.query.code;

  getTokenFromCode(code, tokenReceived, req, res);

  console.log('.exchangeTokenAccess: ' + exchangeTokenAccess);
  console.log('.exchangeTokenId: ' + exchangeTokenId);
  if (exchangeTokenAccess === undefined || exchangeTokenId === undefined) {


//    exchangeTokenAccess = getValueFromCookie('node-tutorial-token-access', req.headers.cookie);
//    exchangeTokenId = getValueFromCookie('node-tutorial-token-id', req.headers.cookie);

//    res.write('<p>.' + exchangeTokenAccess + '.</p>');
//    res.write('<p>.' + exchangeTokenId + '.</p>');

    if (exchangeTokenAccess === undefined || exchangeTokenId === undefined) {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write('<p>Please <a href="' + getAuthUrl() + '">sign in</a> with your Office 365 or Outlook.com account.</p>');
      res.end();
    } else {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write('<p>Sign loaded.</p>');
      res.write('<p>*' + exchangeTokenAccess + '*</p>');
      res.write('<p>*' + exchangeTokenId + '*</p>');
      res.end();
    }
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name authorize
 * @description msexchange authorize
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.authorize = function (req, res) {
  var url_parts = url.parse(req.url, true),
    code = url_parts.query.code;
  getTokenFromCode(code, tokenReceived, res);
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name getEmailFromIdToken
 * @description getEmailFromIdToken
 * @param idToken {Object} response reference String
 * @returns String
 */
getEmailFromIdToken = function (idToken) {
  var tokenParts = idToken.split('.'),
    encodedToken = new Buffer(tokenParts[1].replace("-", "_").replace("+", "/"), 'base64'),
    decodedToken = encodedToken.toString(),
    jwt = JSON.parse(decodedToken);
  return jwt.preferred_username;
};



/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name showMail
 * @description msexchange showMail
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */

exports.showMail = function (req, res) {
  var token = exchangeTokenAccess,
    email = getEmailFromIdToken(exchangeTokenId),
    queryParams = {
      '$select': 'Subject,ReceivedDateTime,From',
      '$orderby': 'ReceivedDateTime desc',
      '$top': 20
    };
  if (token) {
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('<div><h1>Your inbox</h1></div>');


    outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
//    outlook.base.setPreferredTimeZone('European Central Time');
    outlook.base.setAnchorMailbox(email);
    outlook.mail.getMessages({token: token, odataParams: queryParams},
      function (error, result) {
        if (error) {
          console.log('getMessages returned an error: ' + error);
          res.write("<p>ERROR: " + error + "</p>");
          res.end();
        } else if (result) {
          console.log('getMessages returned ' + result.value.length + ' messages.');
          res.write('<table><tr><th>From</th><th>Subject</th><th>Received</th></tr>');
          result.value.forEach(function (message) {
            console.log('  Subject: ' + message.Subject);
            var from = message.From ? message.From.EmailAddress.Name : "NONE";
            res.write('<tr><td>' + from +
              '</td><td>' + message.Subject +
              '</td><td>' + message.ReceivedDateTime.toString() + '</td></tr>');
          });

          res.write('</table>');
          res.end();
        }
      });
  } else {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<p> No token found in cookie!</p>');
    res.end();
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name showTasks
 * @description msexchange showTasks
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.showTasks = function (req, res) {
  var token = exchangeTokenAccess;
//  var token = getValueFromCookie('node-tutorial-token', req.headers.cookie);
  /*
   ,
   email = getValueFromCookie('node-tutorial-email', req.headers.cookie),
   queryParams = {
   '$select': 'GivenName,Surname,EmailAddresses',
   '$orderby': 'GivenName asc',
   '$top': 10
   };
   */
  if (token) {
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('<div><h1>Your tasks</h1></div>');
  } else {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<p> No token found in cookie!</p>');
    res.end();
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name showContacts
 * @description msexchange showContacts
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.showContacts = function (req, res) {
  var token = exchangeTokenAccess,
//    email = getEmailFromIdToken(exchangeTokenId),
//    queryParams = {};
    queryParams = {
      '$select': '',
      '$orderby': 'GivenName asc',
      '$top': 10
    };

  if (token) {
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('<div><h1>Contacts</h1></div>');

    outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
//    GET https://outlook.office.com/api/v2.0/me/contacts
//    GET https://outlook.office.com/api/v2.0/me/contactfolders/{contact_folder_id}/contacts
//    GET https://outlook.office.com/api/v2.0/me/contacts('{contact_id}')/photo
//    GET https://outlook.office.com/api/v2.0/me/contacts?$select=EmailAddresses,GivenName,Surname

//    outlook.base.setAnchorMailbox(email);
    outlook.contacts.getContacts({token: token, odataParams: queryParams},

      function (error, result) {
        console.log('getContacts returned ' + result.value.length + ' contacts.');
        if (error) {
          res.write("<p>ERROR: " + error + "</p>");
          res.end();
        } else if (result) {
          console.log('getContacts returned ' + result.value.length + ' contacts.');
          res.write('<table BorderColor="black" border="1" ><tr>' +
            '<th>GivenName</th>' +
            '<th>Surname</th>' +
            '<th>MiddleName</th>' +
            '<th>NickName</th>' +
            '<th>Birthday</th>' +
            '<th>Title</th>' +
            '<th>YomiGivenName</th>' +
            '<th>YomiSurname</th>' +
            '<th>YomiCompanyName</th>' +
            '<th>Generation</th>' +
            '<th>JobTitle</th>' +
            '<th>CompanyName</th>' +
            '<th>Department</th>' +
            '<th>OfficeLocation</th>' +
            '<th>Profession</th>' +
            '<th>BusinessHomePage</th>' +
            '<th>AssistantName</th>' +
            '<th>Manager</th>' +
            '<th>MobilePhone1</th>' +
            '<th>HomePhones</th>' +
            '<th>BusinessPhones</th>' +
            '<th>EmailAddresses</th>' +
            '<th>ImAddresses</th>' +
            '<th>HomeAddressStreet</th>' +
            '<th>HomeAddressCity</th>' +
            '<th>HomeAddressState</th>' +
            '<th>HomeAddressCountryOrRegion</th>' +
            '<th>HomeAddressPostalCode</th>' +
            '<th>BusinessAddressStreet</th>' +
            '<th>BusinessAddressCity</th>' +
            '<th>BusinessAddressState</th>' +
            '<th>BusinessAddressCountryOrRegion</th>' +
            '<th>BusinessAddressPostalCode</th>' +
            '<th>OtherAddressStreet</th>' +
            '<th>OtherAddressCity</th>' +
            '<th>OtherAddressState</th>' +
            '<th>OtherAddressCountryOrRegion</th>' +
            '<th>OtherAddressPostalCode</th>' +
            '<th>Categories</th>' +
            '<th>Children</th>' +
            '<th>SpouseName</th>' +
            '<th>PersonalNotes</th>' +
            '<th>FileAs</th>' +
            '<th>DisplayName</th>' +
            '<th>LastModifiedDateTime</th>' +
            '<th>ChangeKey</th>' +
            '<th>Id</th>' +
            '</tr>');
          result.value.forEach(function (contact) {

//            console.log(contact);

            res.write('<tr>' +
              '<td>' + contact.GivenName + '</td>' +
              '<td>' + contact.Surname + '</td>' +
              '<td>' + contact.MiddleName + '</td>' +
              '<td>' + contact.NickName + '</td>' +
              '<td>' + contact.Birthday + '</td>' +
              '<td>' + contact.Title + '</td>' +
              '<td>' + contact.YomiGivenName + '</td>' +
              '<td>' + contact.YomiSurname + '</td>' +
              '<td>' + contact.YomiCompanyName + '</td>' +
              '<td>' + contact.Generation + '</td>' +
              '<td><NoBR>' + contact.JobTitle + '</td>' +
              '<td>' + contact.CompanyName + '</td>' +
              '<td>' + contact.Department + '</td>' +
              '<td>' + contact.OfficeLocation + '</td>' +
              '<td>' + contact.Profession + '</td>' +
              '<td>' + contact.BusinessHomePage + '</td>' +
              '<td>' + contact.AssistantName + '</td>' +
              '<td>' + contact.Manager + '</td>' +
              '<td>' + contact.MobilePhone1 + '</td>'
              );

            res.write('<td><NoBR>');
            contact.HomePhones.forEach(function (phone) {
              res.write(phone + '; ');
            });
            res.write('</td>');

            res.write('<td><NoBR>');
            contact.BusinessPhones.forEach(function (phone) {
              res.write(phone + '; ');
            });
            res.write('</td>');

            res.write('<td>');
            contact.EmailAddresses.forEach(function (adr) {
              res.write('<NoBR>' + adr.Address  + '(' + adr.Name + ');</NoBR> ');
            });
            res.write('</td>');

            res.write('<td><NoBR>');
            contact.ImAddresses.forEach(function (adr) {
              res.write(adr + '; ');
            });
            res.write('</td>');

            if (contact.HomeAddress) {
              res.write('<td>' + contact.HomeAddress.Street + '</td>' +
                '<td>' + contact.HomeAddress.City + '</td>' +
                '<td>' + contact.HomeAddress.State + '</td>' +
                '<td>' + contact.HomeAddress.CountryOrRegion + '</td>' +
                '<td>' + contact.HomeAddress.PostalCode + '</td>');
            } else {
              res.write('<td></td>' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ');
            }

            if (contact.BusinessAddress) {
              res.write('<td>' + contact.BusinessAddress.Street + '</td>' +
                '<td>' + contact.BusinessAddress.City + '</td>' +
                '<td>' + contact.BusinessAddress.State + '</td>' +
                '<td>' + contact.BusinessAddress.CountryOrRegion + '</td>' +
                '<td>' + contact.BusinessAddress.PostalCode + '</td>');
            } else {
              res.write('<td></td>' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ');
            }

            if (contact.OtherAddress) {
              res.write('<td>' + contact.OtherAddress.Street + '</td>' +
                '<td>' + contact.OtherAddress.City + '</td>' +
                '<td>' + contact.OtherAddress.State + '</td>' +
                '<td>' + contact.OtherAddress.CountryOrRegion + '</td>' +
                '<td>' + contact.OtherAddress.PostalCode + '</td>');
            } else {
              res.write('<td></td>' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ' +
                '<td></td> ');
            }

            res.write('<td><NoBR>');
            contact.Categories.forEach(function (cat) {
              res.write(cat + '; ');
            });
            res.write('</td>');

            res.write('<td><NoBR>');
            contact.Children.forEach(function (child) {
              res.write(child + '; ');
            });
            res.write('</td>');

            res.write('<td>' + contact.SpouseName + '</td>' +
              '<td>' + contact.PersonalNotes + '</td>' +
              '<td><NoBR>' + contact.FileAs + '</td>' +
              '<td><NoBR>' + contact.DisplayName + '</td>' +
              '<td>' + contact.LastModifiedDateTime + '</td>' +
              '<td>' + contact.ChangeKey + '</td>' +
              '<td>' + contact.Id + '</td>' +
              '</tr>');
          });
          res.write('</table>');
          res.end();
        }
      });
  } else {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<p> No token found in cookie!</p>');
    res.end();
  }
};

/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name msContactSaveToDB
 * @description msexchange msContactSaveToDB
 * @param connect {Object} connection to database
 * @param record {Object}
 * @returns void
 */
msContactSaveToDB = function (connect, record) {
//  console.log('msContactSaveToDB - record');
  console.log('  Osoba: ' + record.GivenName + ' ' + record.Surname);
};

/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name ContactsSynchronize
 * @description msexchange ContactsSynchronize
 * @param connect {Object} connection to database
 * @param user {Object}
 * @returns void
 */
contactsSynchronize = function (connect, user) {
  console.log('***** getContacts: ' + user.loginName);
  var queryParams = {
//      '$select': '',
    '$orderby': 'GivenName asc',
    '$top': 10
  };
  if (user.exchTokenAccess) {
    console.log('getContacts: token');
    outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
    outlook.contacts.getContacts({token: user.exchTokenAccess, odataParams: queryParams},
      function (error, result) {
        if (error) {
          console.log('getContacts - error: ' + error);
        } else if (result) {
          console.log('getContacts returned ' + result.value.length + ' contacts.');
          result.value.forEach(function (record) {
            console.log('getContacts');
//            msContactSaveToDB(connect, record);
          });
        } else {
          console.log('getContacts: NO token');
        }
      });
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name EventsSynchronizeDB
 * @description msexchange EventsSynchronizeDB   DBtoMS
 * @param connect {Object} connection to database
 * @param user {Object}
 * @returns void
 */
eventsSynchronizeDB = function (connect, user) {
  if (user.exchTokenAccess) {
    var sql, aktDate, ownerId;
    console.log('EventsSynchronizeDB returned 0 Events. ' + user.loginName);
    sql = 'SELECT exch_appointments_last_date as "exchDate", people_id as "ownerId" ' +
      ' FROM users_login ' +
      ' WHERE login_name = $1 ';

    postgres.select(sql, [user.loginName], null, connect).then(
      function (result) {
        aktDate = tools.getSingleResult(result).exchDate;
        ownerId = tools.getSingleResult(result).ownerId;
        if (!aktDate) {  // Sync run - only last modification
          aktDate = new Date();
          if (user.exchAppValidDay) {
            aktDate.setTime(aktDate.getTime() - user.exchAppValidDay * 24 * 60 * 60 * 1000);  // by parameter from user
          } else {
            aktDate.setTime(aktDate.getTime() - 14 * 24 * 60 * 60 * 1000);// 14 days back
          }
        }
        /*
        console.log(aktDate + '**' + ownerId);
        sql = 'SELECT id as "eventId", subject as "subject" ' +
          ' FROM appointments ' +
          ' WHERE owner_id = $1 AND zmeneo>';
        postgres.select(sql, [ownerId, aktDate], null, connect).then(
          function (result) {
          }
        );
*/
      }
    );


/*
    try {
      sql = 'UPDATE users_login SET exch_appointments_last_date=$2 ' +
        'WHERE login_name=$1 ';
      postgres.executeSQL(null, null, sql, [user.loginName, new Date()], connect, null);
    } catch (e) {
      console.log('UPDATE Users_login timestamp DB - error');
      console.log(e);
    }
 */
  } else {
    console.log('EventsSynchronizeDB: NO User token in DB. ' + user.loginName);
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name EventsSynchronizeMS
 * @description msexchange EventsSynchronizeMS  MStoDB
 * @param connect {Object} connection to database
 * @param user {Object}
 * @returns void
 */
eventsSynchronizeMS = function (connect, user) {
  return new Promise(function (resolve, reject) {
    var sql, dt, aktDate,
      queryParams = {
        '$select': '',
        '$filter': '',
//        '$filter': 'Subject eq \'Druzina\' ',
//        '$filter': 'Start/DateTime gt \'2016-01-26T00:00:00Z\' ',
//        '$filter': 'CreatedDateTime gt 2016-01-26T00:00:00Z ' +
//               ' or LastModifiedDateTime gt 2016-01-26T00:00:00Z ',
//               ' or LastModifiedDateTime lt \'2016-01-01T00:00:00Z\' ',
//               'or Subject eq \'Druzina\' ',

        '$orderby': 'LastModifiedDateTime desc, CreatedDateTime desc',  // Yes this. First record to update timestamps
        '$top': 1//99999999    // size of type integer  default = 10  grrrr
      };

    if (user.exchTokenAccess) {
      if (user.exchAppLastKey) {  // Sync run - only last modification
        queryParams.$filter = 'CreatedDateTime gt ' + user.exchAppLastKey + ' or LastModifiedDateTime gt ' + user.exchAppLastKey;
      } else {                    // NO Sync run - number of days back
        aktDate = new Date();
        if (user.exchAppValidDay) {
          aktDate.setTime(aktDate.getTime() - user.exchAppValidDay * 24 * 60 * 60 * 1000);  // by parameter from user
        } else {
          aktDate.setTime(aktDate.getTime() - 14 * 24 * 60 * 60 * 1000);// 14 days back
        }
        queryParams.$filter = 'Start/DateTime gt \'' + aktDate.getFullYear() + '-' + aktDate.getMonth() + 1 + '-' + aktDate.getDate() + 'T00:00:00Z\'';
      }
//      console.log(queryParams.$filter);
      outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
      outlook.calendar.getEvents({token: user.exchTokenAccess, odataParams: queryParams},
        function (error, result) {
          if (error) {
            console.log('EventsSynchronizeMS - error: ' + error + ' ** ' + user.loginName);
          } else if (result) {
            console.log('EventsSynchronizeMS returned ' + result.value.length + ' Events. ' + user.loginName);
            if (result.value.length > 0) { // user timestamp update
              result.value.forEach(function (msEvent) {
//                console.log(msEvent);
//                console.log('msEvent: ' + msEvent.Subject);
                msEventSaveToDB(connect, msEvent, user);
              });

              try {
                sql = 'UPDATE Users_login SET  exch_appointments_last_key=$2' +
                  'WHERE login_name=$1 ';

                if (result.value[0].LastModifiedDateTime > result.value[0].CreatedDateTime) {
                  dt = result.value[0].LastModifiedDateTime;
                } else {
                  dt = result.value[0].CreatedDateTime;
                }
                postgres.executeSQL(null, null, sql, [user.loginName, dt], connect, null);
              } catch (e) {
                console.log('UPDATE Users_login timestamp MS - error');
                console.log(e);
              }
            }
            resolve('EventsSynchronizeMS:OK. ' + user.loginName);
          } else {
            console.log('EventsSynchronizeMS: NO token. ' + user.loginName);
            resolve('EventsSynchronizeMS:NO User token in DB. ' + user.loginName);
          }
        });
    } else {
      console.log('EventsSynchronizeMS: NO User token in DB. ' + user.loginName);
      resolve('EventsSynchronizeMS:NO User token in DB. ' + user.loginName);
    }
  });
};

/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name msEventSaveToDB
 * @description msexchange msEventSaveToDB
 * @param connect {Object} connection to database
 * @param msEvent {Object}
 * @param user {Object}
 * @returns void
 */
msEventSaveToDB = function (connect, msEvent, user) {
//  GET https://outlook.office.com/api/v2.0/me/events/{event_id}/attachments
  var event, sqlExists;
  try {
    event = {
      id: null,
      subject: msEvent.Subject,
      location: null,
      place: 'ELSEWHERE',
      start_time: msEvent.Start.DateTime.substr(0, 23) + 'Z',  // 2016-01-21T15:00:00.000Z
      end_time: msEvent.End.DateTime.substr(0, 23) + 'Z',      // 2016-01-21T16:00:00.000Z
      timezone_name: 'Europe/London', //Europe/Prague
      company_id: null,
      reminder: 1,
      team_reminder: 1,
      attendee_reminder: 1,
//      memo: msEvent.Body.Content,
      memo: msEvent.BodyPreview,
      memoType: msEvent.Body.ContentType,
      memoAtt: msEvent.Body.Content,
      hasAttachments: msEvent.HasAttachments,
      private: null,   //msEvent.Sensitivity,
      Importance: null,//msEvent.Importance,
      reminder_seconds: msEvent.ReminderMinutesBeforeStart * 60,
      emailAddress: msEvent.Attendees, // EmailAddress
      type_id: '4',
      msImportance: msEvent.Importance,
      msSensitivity: msEvent.Sensitivity,
      team_reminder_seconds: 3600,
      attendee_reminder_seconds: 3600,
      sales_pipeline_id: null,
      sales_pipeline_stage_id: null,
      msCategories: msEvent.Categories,
      msCreatedDateTime: msEvent.CreatedDateTime,
      msLastModifiedDateTime: msEvent.LastModifiedDateTime,
      msOriginalStartTimeZone: msEvent.OriginalStartTimeZone,
      msOriginalEndTimeZone: msEvent.OriginalEndTimeZone,
      msKey: msEvent.ChangeKey,
      msId: msEvent.Id,
      user: user,
      connect: connect,
      internalToken: constants.INTERNAL_TOKEN
    };
    if (msEvent.Location.DisplayName) {
      event.location = msEvent.Location.DisplayName;
    } else if (msEvent.Location.Address) {
      event.location = msEvent.Location.Address.Street + ' ' +
        msEvent.Location.Address.City + ' ' +
        msEvent.Location.Address.PostalCode + ' ' +
        msEvent.Location.Address.CountryOrRegion + ' ' +
        msEvent.Location.Address.State;
    }

//  insert or update


    sqlExists = 'SELECT min(appointment_id) as "eventId" FROM appointments_synch' +
      ' WHERE exch_id = $1';
    postgres.select(sqlExists, [msEvent.Id], null, connect).then(
      function (result) {
        event.id = tools.getSingleResult(result).eventId;
        if (event.id > 0) {
          console.log('Update: ' + event.id);
          console.log('Update: ' + event.subject);
          appointmentMsexchange.put(event).then(function (result) {
            console.log(result.errors);
          });
        } else {
          console.log('Insert: ' + event.id);
          console.log('Update: ' + event.subject);
//          appointmentMsexchange.post(event).then(function (result) {
//            console.log(result.errors);
//          });
        }
      }
    );
  } catch (e) {
//    console.log('msEventSaveToDB-e: ' + constants.E500);
    console.log(e);
//    tools.sendResponseError(constants.E500, res, false);
  }
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name showCalendar
 * @description msexchange showCalendar
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.showCalendar = function (req, res) {
  var token,
    queryParams = {
      '$select': 'Subject,' +
        'Start,' +
        'OriginalStartTimeZone,' +
        'End,' +
        'OriginalEndTimeZone,' +
        'HasAttachments,' +
        'Body,' +  // ContentType, Content
        'Location,' +  // DisplayName, Address (Street,City,State, PostalCode
        'Attendees,' +
        'Sensitivity,' +
        'ReminderMinutesBeforeStart,' +
        'Categories,' +
        'CreatedDateTime, ' +
        'LastModifiedDateTime,' +
        'ChangeKey,' +
        'Id',
      '$orderby': 'Start/DateTime desc',
      '$top': 10
    };


  conn.getConnectionForMsExchangeAPI().then(
    function (msExchangeConnection) {
      getTokenFromDB(msExchangeConnection, 'developer').then(
        function (result) {
          token = result.access;
          console.log(result.id);

          if (token) {
            res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
            res.write('<div><h1>Your calendar</h1></div>');

            outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
//    outlook.base.setAnchorMailbox(email);
//    outlook.base.setPreferredTimeZone('Central European Standard Time');
//    outlook.base.setPreferredTimeZone('Eastern Standard Time');
            outlook.calendar.getEvents({token: token, odataParams: queryParams},
              function (error, result) {
                if (error) {
//          console.log('getEvents returned an error: ' + error);
                  res.write("<p>ERROR: " + error + "</p>");
                  res.end();
                } else if (result) {
//          console.log('getEvents returned ' + result.value.length + ' events.');
                  res.write('<table BorderColor="black" border="1" ><tr>' +
                    '<th>Subject</th>' +
                    '<th>Start</th>' +
                    '<th>StartT</th>' +
                    '<th>OriginalStartTimeZone</th>' +
                    '<th>End</th>' +
                    '<th>EndT</th>' +
                    '<th>OriginalEndTimeZone</th>' +
                    '<th>HasAttachments</th>' +
                    '<th>BodyContentType</th>' +
                    '<th>BodyContent</th>' +
                    '<th>LocationDisplayName</th>' +
                    '<th>LocationStreet</th>' +
                    '<th>LocationCity</th>' +
                    '<th>LocationState</th>' +
                    '<th>LocationCountryOrRegion</th>' +
                    '<th>LocationPostalCode</th>' +
                    '<th>Attendees</th>' +
                    '<th>Sensitivity</th>' +
                    '<th>ReminderMinutesBeforeStart</th>' +
                    '<th>Categories</th>' +
                    '<th>LastModifiedDateTime</th>' +
                    '<th>ChangeKey</th>' +
                    '<th>Id</th>' +
                    '</tr>');
                  result.value.forEach(function (event) {
//            console.log('  Subject: ' + event.Subject);
//            console.log(event.Start);
//            console.log(event.End);
                    console.log(event.Attendees);
                    res.write('<tr>' +
                      '<td>' + event.Subject + '</td>' +
                      '<td>' + event.Start.DateTime.toString() + '</td>' +
                      '<td>' + event.Start.TimeZone + '</td>' +
                      '<td>' + event.OriginalStartTimeZone + '</td>' +
                      '<td>' + event.End.DateTime.toString() + '</td>' +
                      '<td>' + event.End.TimeZone + '</td>' +
                      '<td>' + event.OriginalEndTimeZone + '</td>' +
                      '<td>' + event.HasAttachments + '</td>' +
                      '<td>' + event.Body.ContentType + '</td>' +
                      '<td>' + event.Body.Content + '</td>' +
                      '<td>' + event.Location.DisplayName + '</td>'
                      );
                    if (event.Location.Address) {
                      res.write('<td>' + event.Location.Address.Street + '</td>' +
                        '<td>' + event.Location.Address.City + '</td>' +
                        '<td>' + event.Location.Address.State + '</td>' +
                        '<td>' + event.Location.Address.CountryOrRegion + '</td>' +
                        '<td>' + event.Location.Address.PostalCode + '</td>');
                    } else {
                      res.write('<td></td>' +
                        '<td></td> ' +
                        '<td></td> ' +
                        '<td></td> ' +
                        '<td></td> ');
                    }

                    res.write('<td><NoBR>');
                    event.Attendees.forEach(function (eventA) {
                      res.write(eventA.EmailAddress.Name + '; ');
                    });

                    res.write('</td>');
                    res.write('<td>' + event.Sensitivity + '</td>' +
                      '<td>' + event.ReminderMinutesBeforeStart + '</td>' +
                      '<td>' + event.Categories + '</td>' +
                      '<td>' + event.LastModifiedDateTime + '</td>' +
                      '<td>' + event.ChangeKey + '</td>' +
                      '<td>' + event.Id + '</td>' +
                      '</tr>');
                  });
                  res.write('</table>');
                  res.end();
                }
              });
          } else {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<p> No token found in cookie!</p>');
            res.end();
          }
        }
      );
    }
  );
};


/**
 * @memberof __Server_REST_API_MSExchange
 * @method
 * @name exchangeSynchronize
 * @description msexchange exchangeSynchronize
 * @param connect {Object} connection to database
 * @param meta {Object}
 * @param user {Object}
 * @returns void
 */
exports.exchangeSynchronize = function (connect, meta, user) {
  var sql, rows, i, l, fncSuccEvent, fncErr;
  conn.setEnv(process.env.NODE_ENV);
  try {
    sql =
      'SELECT ' +
      '  login_name as "loginName",' +
      '  people_id as "ownerId",' +
      '  exch_user  as "exchUser", ' +
      '  exch_password  as "exchPass", ' +
      '  exch_token_id  as "exchTokenId", ' +
      '  exch_token_access  as "exchTokenAccess", ' +
      '  exch_appointments_last_key  as "exchAppLastKey", ' +
      '  exch_appointments_last_date  as "exchAppLastDate", ' +
      '  exch_appointments_valid_days as "exchAppValidDay" ' +
      'FROM ' +
      '  users_login ' +
      'WHERE exch_token_id is not null  ' +
      '  AND exch_token_access is not null ' +
      'ORDER BY ' +
      '  login_name';
    postgres.select(sql, [], null, connect).then(
      function (result) {
        rows = tools.getMultiResult(result);

        fncSuccEvent = function (conn, row) {
          return function (result) {
            eventsSynchronizeDB(conn, row);
          };
        };
        fncErr = function (error) {
          console.log(error);
        };

        for (i = 0, l = rows.length; i < l; i += 1) {
          if (rows[i].loginName) {
/*
            msConnect(connect, rows[i]);
            //            console.log('token');
            //            contactsSynchronize(connect, rows[i]);
            console.log('*************************************************************************************');
            eventsSynchronizeMS(connect, rows[i]).then(
              fncSuccEvent(connect, rows[i]),
              fncErr
            );
*/
          }
        }
      }
    );
  } catch (e) {
    tools.sendResponseError(e, 'exchangeSynchronize', false);
  }
};


/* one
 outlook.calendar.getEvent({token: user.exchTokenAccess,
 eventId: 'AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ-AAAAAAEOAAB92LRwA1VaQZCFc7uqcAZ-AAC9hsAQAAA=',
 odataParams: queryParams
 },
 */

/*
 { '@odata.id': 'https://outlook.office.com/api/v2.0/Users(\'19669fe1-7dda-4895-a5b7-82708551ecce@0827ce72-b9b2-4903-83ad-28fc4ca3b329\')/Events(\'AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ-AAAAAAEOAAB92LRwA1VaQZCFc7uqcAZ-AADRUElMAAA=\')',
 '@odata.etag': 'W/"dM1cVGXhlkOmwvUeykB1oAAGKFY="',
 Id: 'AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ-AAAAAAEOAAB92LRwA1VaQZCFc7uqcAZ-AADRUElMAAA=',
 CreatedDateTime: '2016-01-25T07:30:46.1543678Z',
 LastModifiedDateTime: '2016-01-25T07:28:00.9121002Z',
 ChangeKey: 'dM1cVGXhlkOmwvUeykB1oAAGKFY=',
 Categories: [],
 OriginalStartTimeZone: 'Central Europe Standard Time',
 OriginalEndTimeZone: 'Central Europe Standard Time',
 ResponseStatus: { Response: 'Accepted', Time: '2016-01-25T07:30:00Z' },
 iCalUId: '040000008200E00074C5B7101A82E0080000000050F143B84757D101000000000000000010000000AB3D3B17978C4A49973ADD932470A7F5',
 ReminderMinutesBeforeStart: 15,
 IsReminderOn: false,
 HasAttachments: false,
 Subject: 'SEC ÚCL',
 Body:
 { ContentType: 'HTML',
 Content: '<html>\r\n<head>\r\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\r\n<meta content="text/html; charset=iso-8859-2">\r\n<meta name="Generator" content="Microsoft Word 15 (filtered medium)">\r\n<style>\r\n<!--\r\n@font-face\r\n\t{font-family:"Cambria Math"}\r\n@font-face\r\n\t{font-family:Calibri}\r\np.MsoNormal, li.MsoNormal, div.MsoNormal\r\n\t{margin:0cm;\r\n\tmargin-bottom:.0001pt;\r\n\tfont-size:11.0pt;\r\n\tfont-family:"Calibri",sans-serif}\r\na:link, span.MsoHyperlink\r\n\t{color:#0563C1;\r\n\ttext-decoration:underline}\r\na:visited, span.MsoHyperlinkFollowed\r\n\t{color:#954F72;\r\n\ttext-decoration:underline}\r\np.msonormal0, li.msonormal0, div.msonormal0\r\n\t{margin-right:0cm;\r\n\tmargin-left:0cm;\r\n\tfont-size:12.0pt;\r\n\tfont-family:"Times New Roman",serif}\r\nspan.StylE-mailovZprvy18\r\n\t{font-family:"Calibri",sans-serif;\r\n\tcolor:windowtext}\r\n.MsoChpDefault\r\n\t{font-size:10.0pt;\r\n\tfont-family:"Calibri",sans-serif}\r\n@page WordSection1\r\n\t{margin:70.85pt 70.85pt 70.85pt 70.85pt}\r\ndiv.WordSection1\r\n\t{}\r\n-->\r\n</style>\r\n</head>\r\n<body lang="EN-US" link="#0563C1" vlink="#954F72">\r\n<div class="WordSection1">\r\n<p class="MsoNormal"><span lang="CS">&nbsp;</span></p>\r\n</div>\r\n</body>\r\n</html>\r\n' },
 BodyPreview: '',
 Importance: 'Normal',
 Sensitivity: 'Normal',
 Start: { DateTime: '2016-01-25T10:00:00.0000000', TimeZone: 'UTC' },
 End: { DateTime: '2016-01-25T10:30:00.0000000', TimeZone: 'UTC' },
 Location: { DisplayName: 'Alfa, Blanická' },
 IsAllDay: false,
 IsCancelled: false,
 IsOrganizer: false,
 Recurrence: null,
 ResponseRequested: true,
 SeriesMasterId: null,
 ShowAs: 'Busy',
 Type: 'SingleInstance',
 Attendees:
 [ { Status: [Object], Type: 'Required', EmailAddress: [Object] },
 { Status: [Object], Type: 'Required', EmailAddress: [Object] } ],
 Organizer: { EmailAddress: { Name: 'Michalis Michailidis', Address: 'mik@notia.cz' } },
 WebLink: 'https://outlook.office365.com/owa/?ItemID=AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ%2FAAAAAAEOAAB92LRwA1VaQZCFc7uqcAZ%2FAADRUElMAAA%3D&exvsurl=1&viewmodel=ICalendarItemDetailsViewModelFactory',
 'Calendar@odata.associationLink': 'https://outlook.office.com/api/v2.0/Users(\'19669fe1-7dda-4895-a5b7-82708551ecce@0827ce72-b9b2-4903-83ad-28fc4ca3b329\')/Calendars(\'AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ-AAAAAAEHAAB92LRwA1VaQZCFc7uqcAZ-AAAAO_dYAAA=\')/$ref',
 'Calendar@odata.navigationLink': 'https://outlook.office.com/api/v2.0/Users(\'19669fe1-7dda-4895-a5b7-82708551ecce@0827ce72-b9b2-4903-83ad-28fc4ca3b329\')/Calendars(\'AAMkADc0NDNlMDVmLWYzNWEtNDQ3OS1iNmNmLTdmOTM3N2YyZjMzNwBGAAAAAABEXljR8DDJS5DbEHBOufOcBwB92LRwA1VaQZCFc7uqcAZ-AAAAAAEHAAB92LRwA1VaQZCFc7uqcAZ-AAAAO_dYAAA=\')' }
 */


