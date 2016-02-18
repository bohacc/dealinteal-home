/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Milan Králíček on 20.01.2016.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file appointment_msexchange
 * @fileOverview __Server_REST_API_Appointment
 */

/**
 * @namespace __Server_REST_API_Appointment
 * @author Milan Králíček
 */

var Promise = require('promise'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  appointmentMsexchange = require('./appointment_msexchange'),
  timezones = require('./timezones'),
  people = require('./people'),
  constants = require('./constants'),

  addPeople,
  addBodyNoText,
  addSynchKey,
  addAttachments;


/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name put
 * @description post appointmentMsexchange
 * @param event {Object} request reference object
 * @returns void
 */
exports.put = function (event) {
  try {
    var vals, sql,

 /*
      errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE,
*/
      sqlProperties;

/*
    // validations
    req.assert('type_id', 'Type_id not found.').notEmpty();
    if (req.body.type_id) {
      req.assert('type_id', tools.getValidationMessage('type_id', message_valid_number, null, null)).isInt();
    }
    req.assert('type_id', tools.getValidationMessage('type_id', message_valid_length, 0, 2)).len(0, 2);
    if (req.body.type_id) {
      req.assert('type_id', tools.getValidationMessage('type_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.subject) {
      req.assert('type_id', tools.getValidationMessage('type_id', message_valid_length, 0, 100)).len(0, 100);
    }
    req.assert('place', 'Place row not found.').notEmpty();
    if (req.body.place) {
      req.assert('place', tools.getValidationMessage('place', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.location) {
      req.assert('location', tools.getValidationMessage('location', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.company_id) {
      req.assert('company_id', tools.getValidationMessage('company_id', message_valid_number, null, null)).isInt();
    }
    req.assert('start_time', 'start_time not found.').notEmpty();
    if (req.body.start_time && !tools.validateIsoDate(req.body.start_time)) {
      req.assert('start_time', tools.getValidationMessage('start_time', message_valid_format, null, null)).isNull();
    }
    req.assert('end_time', 'end_time not found.').notEmpty();
    if (req.body.end_time && !tools.validateIsoDate(req.body.end_time)) {
      req.assert('end_time', tools.getValidationMessage('end_time', message_valid_format, null, null)).isNull();
    }
    if (req.body.start_time && req.body.end_time && new Date(req.body.end_time) < new Date(req.body.start_time)) {
      req.assert('start_time', tools.getValidationMessage('start_time and end_time', message_valid_date_range, null, null)).isNull();
    }
    if (req.body.reminder) {
      req.assert('reminder', tools.getValidationMessage('reminder', message_valid_number, null, null)).isInt();
      req.assert('reminder_seconds', 'ReminderSeconds not found.').notEmpty();
    }
    if (req.body.reminder_seconds) {
      req.assert('reminder_seconds', tools.getValidationMessage('reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.team_reminder) {
      req.assert('team_reminder', tools.getValidationMessage('team_reminder', message_valid_number, null, null)).isInt();
      req.assert('team_reminder_seconds', 'TeamReminderSeconds not found.').notEmpty();
    }
    if (req.body.team_reminder_seconds) {
      req.assert('team_reminder_seconds', tools.getValidationMessage('team_reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.attendee_reminder) {
      req.assert('attendee_reminder', tools.getValidationMessage('attendee_reminder', message_valid_number, null, null)).isInt();
      req.assert('attendee_reminder_seconds', 'AttendeeReminderSeconds not found.').notEmpty();
    }
    if (req.body.attendee_reminder_seconds) {
      req.assert('attendee_reminder_seconds', tools.getValidationMessage('attendee_reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.memo) {
      req.assert('memo', tools.getValidationMessage('memo', message_valid_length, 0, 2000)).len(0, 2000);
    }
    if (req.body.sales_pipeline_id) {
      req.assert('sales_pipeline_id', tools.getValidationMessage('sales_pipeline_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.sales_pipeline_stage_id) {
      req.assert('sales_pipeline_stage_id', tools.getValidationMessage('sales_pipeline_stage_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.private) {
      req.assert('private', tools.getValidationMessage('private', message_valid_number, null, null)).isInt();
    }
    if (req.body.timezone_name) {
      req.assert('timezone_name', tools.getValidationMessage('timezone_name', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.owner_id) {
      req.assert('owner_id', tools.getValidationMessage('owner_id', message_valid_number, null, null)).isInt();
    }
    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }
*/
    tools.setNullForEmpty(event);
    sql =
      'UPDATE appointments SET ' +
      '  subject = $2, start_time = $3, end_time = $4, ' +
      '  place = $5, location = $6, memo = $7, timezone_name = $8, ' +
      '  company_id = $9, reminder = $10, team_reminder = $11, attendee_reminder = $12, ' +
      '  private = $13, ' +
      '  reminder_seconds = $14 ' +
      'WHERE id = $1 ';
//    team_reminder, attendee_reminder, team_reminder_seconds , attendee_reminder_seconds // Not exists in  Exchange => No update


    sqlProperties = postgres.createTransaction(event);


//    console.log('Event Update 0');
    // GET TOMEZONE - CONVERT
//    console.log('krok -1');
    return timezones.amountForDate(event, null, {date: event.start_time, timezoneName: event.timezone_name}).then(
      function (result) {
        var amount = new Date(event.end_time) - new Date(event.start_time), convertDateTime, ms;
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        convertDateTime = new Date((new Date(event.start_time)).setMilliseconds(ms));
        event.start_time = convertDateTime.toISOString();
        event.end_time = (new Date(convertDateTime.setMilliseconds(amount))).toISOString();
      }
    ).then(
      function () {
        // vals must be here, because array vals is create withou reference to object - req.body.start_time
        vals = [event.id, event.subject, event.start_time, event.end_time,
          event.place, event.location, event.memo, event.timezone_name,
          event.company_id, event.reminder, event.team_reminder, event.attendee_reminder,
          event.private,
          event.reminder_seconds];
//    team_reminder, attendee_reminder, team_reminder_seconds , attendee_reminder_seconds // Not exists in  Exchange => No update

//        console.log('krok 1');
//        console.log(vals);
        return postgres.executeSQL(event, null, sql, vals, null, sqlProperties);
      }
    ).then(
      function () {
        // set appointment_persons
//        console.log('krok addPeople');
        return addPeople(event, sqlProperties);
      }
    ).then(
      function () {
        // set addBodyNoText
//        console.log('krok addBodyNoText');
        return addBodyNoText(event, sqlProperties);
      }
    ).then(
      function () {
        // set addAttachments
//        console.log('krok addAttachments');
        return addAttachments(event, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        console.log('Put: save');
      },
      function (result) {
        return null;
      }
    );
  } catch (e) {
    console.log('Put - error');
    console.log(e);
    return null;
  }
};


/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name post
 * @description post appointmentMsexchange
 * @param event {Object} request reference object
 * @returns void
 */
exports.post = function (event) {
  try {
    var vals, sql, sqlSeq,
/*
      loginToken, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE,
*/
      sqlProperties;

//    loginToken = event.signedCookies.auth_token;


// validations
/*
    req.assert('type_id', 'Type_id not found.').notEmpty();
    if (req.body.type_id) {
      req.assert('type_id', tools.getValidationMessage('type_id', message_valid_number, null, null)).isInt();
    }
    req.assert('type_id', tools.getValidationMessage('type_id', message_valid_length, 0, 2)).len(0, 2);
    if (req.body.type_id) {
      req.assert('type_id', tools.getValidationMessage('type_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.subject) {
      req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
    }
    req.assert('place', 'Place row not found.').notEmpty();
    if (req.body.place) {
      req.assert('place', tools.getValidationMessage('place', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.location) {
      req.assert('location', tools.getValidationMessage('location', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.company_id) {
      req.assert('company_id', tools.getValidationMessage('company_id', message_valid_number, null, null)).isInt();
    }
    req.assert('start_time', 'start_time not found.').notEmpty();
    if (req.body.start_time && !tools.validateIsoDate(req.body.start_time)) {
      req.assert('start_time', tools.getValidationMessage('start_time', message_valid_format, null, null)).isNull();
    }
    req.assert('end_time', 'end_time not found.').notEmpty();
    if (req.body.end_time && !tools.validateIsoDate(req.body.end_time)) {
      req.assert('end_time', tools.getValidationMessage('end_time', message_valid_format, null, null)).isNull();
    }
    if (req.body.start_time && req.body.end_time && new Date(req.body.end_time) < new Date(req.body.start_time)) {
      req.assert('start_time', tools.getValidationMessage('start_time and end_time', message_valid_date_range, null, null)).isNull();
    }
    if (req.body.reminder) {
      req.assert('reminder', tools.getValidationMessage('reminder', message_valid_number, null, null)).isInt();
      req.assert('reminder_seconds', 'ReminderSeconds row not found.').notEmpty();
    }
    if (req.body.reminder_seconds) {
      req.assert('reminder_seconds', tools.getValidationMessage('reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.team_reminder) {
      req.assert('team_reminder', tools.getValidationMessage('team_reminder', message_valid_number, null, null)).isInt();
      req.assert('team_reminder_seconds', 'TeamReminderSeconds not found.').notEmpty();
    }
    if (req.body.team_reminder_seconds) {
      req.assert('team_reminder_seconds', tools.getValidationMessage('team_reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.attendee_reminder) {
      req.assert('attendee_reminder', tools.getValidationMessage('attendee_reminder', message_valid_number, null, null)).isInt();
      req.assert('attendee_reminder_seconds', 'AttendeeReminderSeconds not found.').notEmpty();
    }
    if (req.body.attendee_reminder_seconds) {
      req.assert('attendee_reminder_seconds', tools.getValidationMessage('attendee_reminder_seconds', message_valid_number, null, null)).isInt();
    }
    if (req.body.memo) {
      req.assert('memo', tools.getValidationMessage('memo', message_valid_length, 0, 2000)).len(0, 2000);
    }
    if (req.body.sales_pipeline_id) {
      req.assert('sales_pipeline_id', tools.getValidationMessage('sales_pipeline_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.sales_pipeline_stage_id) {
      req.assert('sales_pipeline_stage_id', tools.getValidationMessage('sales_pipeline_stage_id', message_valid_number, null, null)).isInt();
    }
    if (req.body.private) {
      req.assert('private', tools.getValidationMessage('private', message_valid_number, null, null)).isInt();
    }
    if (req.body.timezone_name) {
      req.assert('timezone_name', tools.getValidationMessage('timezone_name', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.owner_id) {
      req.assert('owner_id', tools.getValidationMessage('owner_id', message_valid_number, null, null)).isInt();
    }
    errors = req.validationErrors();
    console.log(errors);
    if (errors) {
      console.log('krok 01');
      return new Promise(function (resolve, reject) {
        resolve(res.json(errors));
      });
    }
*/
    tools.setNullForEmpty(event);
    sqlSeq = 'SELECT nextval(\'seq_appointments_id\') AS id,people_id as owner_id FROM users_login WHERE login_name = $1';

    sql =
      'INSERT INTO appointments ' +
      '  (id, subject, start_time, end_time, ' +
      '   place, location, memo, timezone_name, ' +
      '   company_id, reminder, team_reminder, attendee_reminder, ' +
      '   sales_pipeline_id, sales_pipeline_stage_id, private, ' +
      '   reminder_seconds, team_reminder_seconds, attendee_reminder_seconds,' +
      '   type_id, owner_id) ' +
      'VALUES($1, $2, $3, $4, ' +
        '     $5, $6, $7, $8, ' +
        '     $9, $10, $11, $12, ' +
        '     $13, $14, $15, $16, ' +
        '     $17, $18, ' +
        '     $19, $20)';

    sqlProperties = postgres.createTransaction(event);


    // GET TOMEZONE - CONVERT
    return timezones.amountForDate(event, null, {date: event.start_time, timezoneName: event.timezone_name}).then(
      function (result) {
        var amount = new Date(event.end_time) - new Date(event.start_time), convertDateTime, ms;
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        convertDateTime = new Date((new Date(event.start_time)).setMilliseconds(ms));
        event.start_time = convertDateTime.toISOString();
        event.end_time = (new Date(convertDateTime.setMilliseconds(amount))).toISOString();
      }
    ).then(
      function () {
        return postgres.select(sqlSeq, [event.user.loginName], event).then(
          function (result) {
            event.owner_id = tools.getSingleResult(result).owner_id;
            // vals must be here, because array vals is create withou reference to object - req.body.start_time
            vals = [null, event.subject, event.start_time, event.end_time,
              event.place, event.location, event.memo, event.timezone_name,
              event.company_id, event.reminder, event.team_reminder, event.attendee_reminder,
              event.sales_pipeline_id, event.sales_pipeline_stage_id, event.private,
              event.reminder_seconds, event.team_reminder_seconds, event.attendee_reminder_seconds,
              event.type_id, event.user.owner_id];

            event.id = event.id || tools.getSingleResult(result).id;
            vals[0] = event.id;

            event.user.owner_id = event.user.owner_id || tools.getSingleResult(result).owner_id;
            vals[19] = event.user.owner_id;

//            console.log('krok 1');
//            console.log(vals);
            return postgres.executeSQL(event, null, sql, vals, null, sqlProperties);
          }
        );
      }
    ).then(
      function () {
        // set appointment_persons
//        console.log('krok addPeople');
        return addPeople(event, sqlProperties);
      }
    ).then(
      function () {
        // set addBodyNoText
//        console.log('krok addBodyNoText');
        return addBodyNoText(event, sqlProperties);
      }
    ).then(
      function () {
        // set addAttachments
//        console.log('krok addAttachments');
        return addAttachments(event, sqlProperties);
      }
    ).then(
      function () {
        // set addSynchKey
//        console.log('krok addSynchKey');
        return addSynchKey(event, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        console.log('Post: save');
      },
      function (result) {
        return null;
      }
    );
  } catch (e) {
    console.log('Post - error');
    console.log(e);
    return null;
  }
};


/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addSynchKey
 * @description addSynchKey for Appointment
 * @param event {Object} request reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
addSynchKey = function (event, obj) {
  try {
    var  vals, sqlSeq, sqlInsert;
    sqlSeq = 'SELECT nextval(\'seq_appointments_id\') AS id, people_id as "ownerId" FROM users_login WHERE login_name = $1';

    sqlInsert = 'INSERT INTO appointments_synch(id, appointment_id, person_id, user_id, ' +
      ' data_in, status, exch_id, exch_key, ' +
      ' external_system)' +
      'VALUES($1, $2, $3, $4, ' +
      ' $5, $6, $7, $8, ' +
      ' $9)';

    return postgres.select(sqlSeq, [event.user.loginName], event).then(
      function (result) {
        vals = [null, event.id, null, event.user.owner_id,
          1, 0, event.msId, event.msKey, 'MSEXCHANGE'];
        vals[0] = tools.getSingleResult(result).id;
        return postgres.executeSQL(event, null, sqlInsert, vals, null, obj);
      }
    );
  } catch (e) {
    console.log('addSynchKey - error');
    console.log(e);
  }
};


/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addBodyNoText
 * @description addBodyNoText for Appointment
 * @param event {Object} request reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
addBodyNoText = function (event, obj) {
  try {
    var  vals, sqlSeq, sqlInsertT, sqlUpdateT, sqlInsertTT,  sqlExistTT,
      fncSuccMemo, fncErr, newId, returnFnc;
    sqlSeq = 'SELECT nextval(\'seq_texts_id\') AS id FROM users_login WHERE login_name = $1';


    sqlInsertT = 'INSERT INTO texts(id, text)' +
      'VALUES($1, $2)';
    sqlUpdateT = 'UPDATE texts SET text = $2 ' +
      'WHERE id = $1';

    sqlInsertTT = 'INSERT INTO texts_tables(table_name, table_id, text_id) ' +
      'VALUES($1, $2, $3)';

    sqlExistTT = 'SELECT COALESCE(min(text_id),0) as "textId" FROM  texts_tables ' +
      ' WHERE table_name = $1 AND table_id = $2 ';


    fncSuccMemo = function (result) {
      newId = tools.getSingleResult(result).textId;
//      console.log('nalezen: ' + newId);
      if (newId === '0') {
        returnFnc = postgres.select(sqlSeq, [event.user.loginName], event).then(
          function (result) {
            newId = tools.getSingleResult(result).id; // newId from SEQ
            vals = [newId, event.memoAtt];
            return postgres.executeSQL(event, null, sqlInsertT, vals, null, obj).then( // First data
              function (result) {
                vals = [constants.AGENDA_TYPE_APPOINTMENT, event.id, newId];
                return postgres.executeSQL(event, null, sqlInsertTT, vals, null, obj); // link
              }
            );
          }
        );
      } else {
        vals = [newId, event.memoAtt];
        returnFnc = postgres.executeSQL(event, null, sqlUpdateT, vals, null, obj);// only data
      }
      return returnFnc;
    };

    fncErr = function (error) {
      console.log(error);
    };

    vals = [constants.ATTACHMENTS_TYPES.APPOINTMENT, event.id];
    return postgres.select(sqlExistTT, vals, event).then(
      function (result) {
        return fncSuccMemo(result);
      },
      fncErr
    );

  } catch (e) {
    console.log('addBodyNoText - error');
    console.log(e);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addPeople
 * @description add people for Appointment
 * @param event {Object} request reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
addPeople = function (event, obj) {
  try {
    var  vals, sqlInsert, sqlExist, sqlPeople, iterator;

//    console.log('addPeople');

    sqlPeople =
      'SELECT id as "peopleId" FROM people WHERE upper(email) = upper($1)' +
      ' UNION ALL ' +
      'SELECT id as "peopleId" FROM people WHERE upper(email2) = upper($1)';
    sqlInsert = 'INSERT INTO appointment_persons(person_id, appointment_id) VALUES($1, $2)';

    sqlExist = 'SELECT count(*) as q FROM appointment_persons ' +
               ' WHERE person_id = $1 AND appointment_id = $2 ';

//    console.log('emailAddress ' + event.emailAddress.length + ' emails.');

    iterator = function (email) {
      return postgres.select(sqlPeople, [email.EmailAddress.Address], event).then(
        function (result) {
          vals = [null, event.id];
          vals[0] = tools.getSingleResult(result).peopleId;
          return postgres.select(sqlExist, vals, event).then(
            function (result) {
//              console.log('nalezen: ' + tools.getSingleResult(result).q);
              if (tools.getSingleResult(result).q === 0) {
                return postgres.executeSQL(event, null, sqlInsert, vals, null, obj);
              }
            }
          );
        }
      );
    };
    return Promise.all(event.emailAddress.map(function (el) {
      return iterator(el);
    }));

  } catch (e) {
    console.log('addPeople - error');
    console.log(e);
    return new Promise(function (resolve, reject) {resolve({error: e}); });
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addAttachments
 * @description addAttachments for Appointment
 * @param event {Object} request reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
addAttachments = function (event, obj) {
  try {
/*
    var  vals, sqlSeq, sqlInsertT, sqlUpdateT, sqlInsertTT,  sqlExistTT,
      fncSuccMemo, fncErr, newId, returnFnc;
    sqlSeq = 'SELECT nextval(\'seq_texts_id\') AS id FROM users_login WHERE login_name = $1';


    sqlInsertT = 'INSERT INTO texts(id, text)' +
      'VALUES($1, $2)';
    sqlUpdateT = 'UPDATE texts SET text = $2 ' +
      'WHERE id = $1';

    sqlInsertTT = 'INSERT INTO texts_tables(table_name, table_id, text_id) ' +
      'VALUES($1, $2, $3)';

    sqlExistTT = 'SELECT COALESCE(min(text_id),0) as "textId" FROM  texts_tables ' +
      ' WHERE table_name = $1 AND table_id = $2 ';


    fncSuccMemo = function (result) {
      newId = tools.getSingleResult(result).textId;
//      console.log('nalezen: ' + newId);
      if (newId === '0') {
        returnFnc = postgres.select(sqlSeq, [event.user.loginName], event).then(
          function (result) {
            newId = tools.getSingleResult(result).id; // newId from SEQ
            vals = [newId, event.memoAtt];
            return postgres.executeSQL(event, null, sqlInsertT, vals, null, obj).then( // First data
              function (result) {
                vals = [constants.AGENDA_TYPE_APPOINTMENT, event.id, newId];
                return postgres.executeSQL(event, null, sqlInsertTT, vals, null, obj); // link
              }
            );
          }
        );
      } else {
        vals = [newId, event.memoAtt];
        returnFnc = postgres.executeSQL(event, null, sqlUpdateT, vals, null, obj);// only data
      }
      return returnFnc;
    };

    fncErr = function (error) {
      console.log(error);
    };

    vals = [constants.ATTACHMENTS_TYPES.APPOINTMENT, event.id];
    return postgres.select(sqlExistTT, vals, event).then(
      function (result) {
        return fncSuccMemo(result);
      },
      fncErr
    );
 */
    return;
  } catch (e) {
    console.log('addAttachments - error');
    console.log(e);
  }
};

