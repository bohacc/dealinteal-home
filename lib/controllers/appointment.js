/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 29.10.2014.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file appointment
 * @fileOverview __Server_REST_API_Appointment
 */

/**
 * @namespace __Server_REST_API_Appointment
 * @author Martin Boháč
 */

var Promise = require('promise'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  appointment = require('./appointment'),
  timezones = require('./timezones'),
  reminders = require('./reminders'),
  people = require('./people'),
  projects = require('./projects'),
  texts = require('./texts'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name types
 * @description types of appointment events
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.types = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql = 'SELECT ' +
      '  * ' +
      'FROM ' +
      '  appointment_types at ' +
      'ORDER BY ' +
      '  name ';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name places
 * @description places of appointment events
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.places = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql = 'SELECT ' +
      '  * ' +
      'FROM ' +
      '  appointment_places ap ' +
      'ORDER BY ' +
      '  name ';

    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name tags
 * @description tags of appointment events
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.tags = function (req, res) {
  var sql, errors;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql = 'SELECT * FROM appointment_tags at ORDER BY name ';
    postgres.select(sql, [], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name nextFreeTime
 * @description nextFreeTime
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.nextFreeTime = function (req, res) {
  var sql, errors, loginToken;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    loginToken = req.signedCookies.auth_token;
    sql =
      'SELECT ' +
      '  MAX(ap.end_time) as next_free_time ' +
      'FROM ' +
      '  appointments ap, ' +
      '  users_login u ' +
      'WHERE ' +
      '  u.login_token = $1::varchar and ' +
      '  ap.owner_id = u.people_id ';

    postgres.select(sql, [loginToken], req).then(
      function (result) {
        res.json(tools.getSingleResult(result));
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name post
 * @description post appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  try {
    var vals, sql, errors, sqlSeq, loginToken, sqlProperties,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE;

    loginToken = req.signedCookies.auth_token;

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
    if (errors) {
      return new Promise(function (resolve, reject) {
        resolve(res.json(errors));
      });
    }

    /*console.log('krok 0');*/

    tools.setNullForEmpty(req.body);
    sqlSeq = 'SELECT nextval(\'seq_appointments_id\') AS id,people_id as owner_id FROM users_login ul WHERE login_token = $1';

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

    //sqldb = postgres.createTransaction(req);
    //sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    sqlProperties = postgres.createTransaction(req);


    // GET TOMEZONE - CONVERT
    return timezones.amountForDate(req, res, {date: req.body.start_time, timezoneName: req.body.timezone_name}).then(
      function (result) {
        var amount = new Date(req.body.end_time) - new Date(req.body.start_time), convertDateTime, ms;
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        convertDateTime = new Date((new Date(req.body.start_time)).setMilliseconds(ms));
        req.body.start_time = convertDateTime.toISOString();
        req.body.end_time = (new Date(convertDateTime.setMilliseconds(amount))).toISOString();
      }
    ).then(
      function () {
        return postgres.select(sqlSeq, [loginToken], req).then(
          function (result) {
            req.body.owner_id = tools.getSingleResult(result).owner_id;
            // vals must be here, because array vals is create withou reference to object - req.body.start_time
            vals = [null, req.body.subject, req.body.start_time, req.body.end_time,
              req.body.place, req.body.location, req.body.memo, req.body.timezone_name,
              req.body.company_id, req.body.reminder, req.body.team_reminder, req.body.attendee_reminder,
              req.body.sales_pipeline_id, req.body.sales_pipeline_stage_id, req.body.private,
              req.body.reminder_seconds, req.body.team_reminder_seconds, req.body.attendee_reminder_seconds,
              req.body.type_id, req.body.owner_id];
            vals[0] = req.body.id || tools.getSingleResult(result).id;
            // insert appointment_tags
            req.body.id = vals[0];
            vals[19] = req.body.owner_id = tools.getSingleResult(result).owner_id;
            return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
          }
        );
      }
    ).then(
      function () {
        // save tags
        //console.log('krok 2');
        return appointment.saveAppointmentTags(req, res, sqlProperties);
      }
    ).then(
      function () {
        // save company
        //console.log('krok 3');
        return appointment.saveCompany(req, res, sqlProperties);
      }
    ).then(
      function () {
        // save sales pipeline
        //console.log('krok 4');
        return appointment.saveSalesPipeline(req, res, sqlProperties);
      }
    ).then(
      function () {
        // create persons
        //console.log('krok 5');
        return appointment.createPeople(req, res, sqlProperties);
      }
    ).then(
      function () {
        // set appointment_persons
        //console.log('krok 6');
        return appointment.addPeople(req, res, sqlProperties);
      }
    ).then(
      function () {
        // set reminders
        //console.log('krok 7');
        return appointment.addReminders(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 8');
        return appointment.createProject(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 9');
        return appointment.addProjects(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 10');
        sqlProperties.texts = {tableName: constants.ATTACHMENTS_TYPES.APPOINTMENT, tableId: req.body.id};
        return texts.saveText(req, res, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 11');
        return tools.sendResponseSuccess({id: req.body.id}, res, false);
      },
      function (result) {
        return tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    return tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name del
 * @description delete appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.del = function (req, res) {
  var sql, errors, sqlPerson, sqlTags, sqlReminder,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.body.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql = 'DELETE FROM appointments WHERE id = $1';
    sqlTags = 'DELETE FROM appointment_appointment_tags WHERE appointment_id = $1';
    sqlPerson = 'DELETE FROM appointment_persons WHERE appointment_id = $1';
    sqlReminder = 'DELETE FROM reminder WHERE appointment_id = $1';
    // transaction
    postgres.executeSQL(req, res, sqlTags, [req.params.id], null, null)
      .then(
        function () {
          return postgres.executeSQL(req, res, sqlPerson, [req.params.id], null, null);
        }
      ).then(
        function () {
          return postgres.executeSQL(req, res, sqlReminder, [req.params.id], null, null);
        }
      ).then(
        function () {
          postgres.executeSQL(req, res, sql, [req.params.id], null, null);
        }
      ).then(
        function (result) {
          tools.sendResponseSuccess(constants.OK, res, false);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name deleteAppointmentTags
 * @description delete appointment tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.deleteAppointmentTags = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var e, j, i, l, noExist = [], exist, rows, sqlDelete, sqlExists, callbackEmptyEndPromise, promiseCount = 0,
        callbackEmptyEndPromiseError;
      sqlExists = 'SELECT appointment_tag_id AS id FROM appointment_appointment_tags aat WHERE appointment_id = $1';
      sqlDelete = 'DELETE FROM appointment_appointment_tags WHERE appointment_id = $1 AND appointment_tag_id = $2';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      postgres.select(sqlExists, [req.body.id], req).then(function (result) {
        rows = tools.getMultiResult(result);
        for (i = 0, l = rows.length; i < l; i += 1) {
          exist = false;
          if (req.body.appointment_tags) {
            for (e = 0, j = req.body.appointment_tags.length; e < j; e += 1) {
              if (req.body.appointment_tags[e].id === rows[i].id) {
                exist = true;
                break;
              }
            }
          }
          if (!exist) {
            noExist.push(rows[i].id);
          }
        }
        promiseCount = noExist.length;
        for (i = 0, l = noExist.length; i < l; i += 1) {
          postgres.executeSQL(req, res, sqlDelete, [req.body.id, noExist[i]], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
        }
        if (noExist.length === 0) {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name saveAppointmentTags
 * @description save appointment tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveAppointmentTags = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, sql, sqlNewTags, sqlSeq, callbackInsertTag, promiseCount, callbackEmptyEndPromise, sqlExists,
        callbackTagId, sqlExistsAppTag, callbackEmptyEndPromiseError, tmpId;
      sql = 'INSERT INTO appointment_appointment_tags(appointment_id, appointment_tag_id) VALUES($1, $2)';
      sqlExistsAppTag = 'SELECT 1 AS exist FROM appointment_appointment_tags aat WHERE appointment_id = $1 AND appointment_tag_id = $2';
      sqlNewTags = 'INSERT INTO appointment_tags(id, name) VALUES($1, $2)';
      sqlSeq = 'SELECT nextval(\'seq_appointment_tags_id\') AS id';
      sqlExists = 'SELECT id FROM appointment_tags at WHERE name = $1';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      callbackTagId = function (item) {
        return function (result) {
          return tools.getSingleResult(result).id || postgres.select(sqlSeq, [], req).then(
            function (result) {
              if (req.testId && req.testId[item.id]) { // req.testId[item.id] - for tests
                tmpId = req.testId[item.id];
              } else {
                tmpId = tools.getSingleResult(result).id;
              }
              return postgres.executeSQL(req, res, sqlNewTags, [tmpId, item.name], null, obj).then(
                function () {
                  return tools.getSingleResult(result).id;
                }
              );
            }
          );
        };
      };
      callbackInsertTag = function (id) {
        postgres.select(sqlExistsAppTag, [req.body.id, id], req).then(
          function (result) {
            if (tools.getSingleResult(result).exist) {
              callbackEmptyEndPromise();
            } else {
              postgres.executeSQL(req, res, sql, [req.body.id, id], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
            }
          },
          callbackEmptyEndPromiseError
        );
      };
      if (!req.body.id) {
        reject();
      }
      // property for managing loop promise
      promiseCount = req.body.appointment_tags ? req.body.appointment_tags.length : 0;
      // exit
      if (!req.body.appointment_tags || (req.body.appointment_tags && req.body.appointment_tags.length === 0)) {
        resolve();
        return;
      }
      for (i = 0, l = req.body.appointment_tags.length; i < l; i += 1) {
        if (!tools.isNumber(req.body.appointment_tags[i].id)) {
          postgres.select(sqlExists, [req.body.appointment_tags[i].name], req)
            .then(callbackTagId(req.body.appointment_tags[i]), callbackEmptyEndPromiseError)
            .then(callbackInsertTag, callbackEmptyEndPromiseError);
        } else {
          // if error then reject
          if (!req.body.appointment_tags[i].id) {
            reject();
          }
          // save tag
          callbackInsertTag(req.body.appointment_tags[i].id);
        }
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name saveCompany
 * @description save company for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveCompany = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var sqlNewCompany, sqlSeq, sqlUpdateAppointment, loginToken;
      loginToken = req.signedCookies.auth_token;
      sqlNewCompany = 'INSERT INTO companies(id, company_name, owner_id) VALUES($1, $2, $3)';
      sqlSeq = 'SELECT nextval(\'seq_companies_id\') AS id, ' +
        '  (SELECT people_id FROM users_login ul WHERE login_token = $1) as "ownerId" ';
      sqlUpdateAppointment = 'UPDATE appointments SET company_id = $2 WHERE id = $1';
      if (req.body.company && req.body.company[0] && !tools.isNumber(req.body.company[0].id)) {
        postgres.select(sqlSeq, [loginToken], req).then(
          function (result) {
            req.body.company_id = tools.getSingleResult(result).id;
            return postgres.executeSQL(req, res, sqlNewCompany, [req.body.company_id, req.body.company[0].name, tools.getSingleResult(result).ownerId], null, obj).then(
              function () {
                return req.body.company_id;
              }
            );
          }
        ).then(
          function () {
            return postgres.executeSQL(req, res, sqlUpdateAppointment, [req.body.id, req.body.company_id], null, obj);
          }
        ).then(
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      } else {
        if (req.body.company && req.body.company[0] && req.body.company[0].id) {
          req.body.company_id = req.body.company[0].id;
        } else {
          req.body.company_id = null;
        }
        postgres.executeSQL(req, res, sqlUpdateAppointment, [req.body.id, req.body.company_id], null, obj).then(
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      }
    } catch (e) {
      console.log(e);
      reject();
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name saveSalesPipeline
 * @description save Sales Pipeline for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveSalesPipeline = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var sql, sqlSeq, sqlInsert, sqlUpdateSalesPipeline;
      sql = 'UPDATE appointments SET sales_pipeline_id = $2 WHERE id = $1';
      sqlUpdateSalesPipeline = 'UPDATE sales_pipeline SET stage_id = $2 WHERE id = $1';
      sqlSeq = 'SELECT nextval(\'seq_sales_pipeline_id\') AS id';
      sqlInsert = 'INSERT INTO sales_pipeline(id, company_id, subject, owner_id, stage_id) VALUES($1, $2, $3, $4, $5)';
      // for next operations must be company exists
      if (!req.body.company_id) {
        resolve();
        return;
      }
      if (req.body.salesPipeline && req.body.salesPipeline[0] && tools.isNumber(req.body.salesPipeline[0].id)) {
        // update appointment with sales pipeline
        postgres.executeSQL(req, res, sql, [req.body.id, req.body.salesPipeline[0].id], null, obj).then(
          function () {
            return postgres.executeSQL(req, res, sqlUpdateSalesPipeline, [req.body.salesPipeline[0].id, req.body.sales_pipeline_stage_id], null, obj);
          }
        ).then(
          function () {
            resolve();
          },
          function (err) {
            reject();
          }
        );
      } else {
        if (req.body.salesPipeline && req.body.salesPipeline[0]) {
          // get sequence
          postgres.select(sqlSeq, [], req).then(
            function (result) {
              // create new sales pipeline
              req.body.sales_pipeline_id = tools.getSingleResult(result).id;
              return postgres.executeSQL(req, res, sqlInsert, [req.body.sales_pipeline_id, req.body.company_id, req.body.salesPipeline[0].name, req.body.owner_id, req.body.sales_pipeline_stage_id], null, obj);
            }
          ).then(
            function () {
              // update appointment with new sales pipeline
              return postgres.executeSQL(req, res, sql, [req.body.id, req.body.sales_pipeline_id], null, obj);
            }
          ).then(
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        } else {
          // remove sales pipeline id
          postgres.executeSQL(req, res, sql, [req.body.id, null], null, obj).then(
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      }
    } catch (e) {
      reject();
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name deletePeople
 * @description delete appointment people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.deletePeople = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var e, j, i, l, noExist = [], exist, rows, sqlDelete, sqlExists, callbackEmptyEndPromise, promiseCount = 0, people,
        callbackEmptyEndPromiseError;
      sqlExists = 'SELECT person_id AS id FROM appointment_persons ap WHERE appointment_id = $1';
      sqlDelete = 'DELETE FROM appointment_persons WHERE appointment_id = $1 AND person_id = $2';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      people = [];
      people = req.body.teamReminderMembers ? people.concat(req.body.teamReminderMembers) : people;
      people = req.body.attendeeReminderMembers ? people.concat(req.body.attendeeReminderMembers) : people;
      postgres.select(sqlExists, [req.body.id], req).then(function (result) {
        rows = tools.getMultiResult(result);
        for (i = 0, l = rows.length; i < l; i += 1) {
          exist = false;
          for (e = 0, j = people.length; e < j; e += 1) {
            if (people[e].id === rows[i].id) {
              exist = true;
              break;
            }
          }
          if (!exist) {
            noExist.push(rows[i].id);
          }
        }
        promiseCount = noExist.length;
        for (i = 0, l = noExist.length; i < l; i += 1) {
          postgres.executeSQL(req, res, sqlDelete, [req.body.id, noExist[i]], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
        }
        if (noExist.length === 0) {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addPeople
 * @description add people for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.addPeople = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, people, sqlInsert, callbackEmptyEndPromise, promiseCount = 0, sqlExistsAppPerson, callback,
        callbackEmptyEndPromiseError;
      sqlInsert = 'INSERT INTO appointment_persons(appointment_id, person_id) VALUES($1, $2)';
      sqlExistsAppPerson = 'SELECT 1 AS exist FROM appointment_persons ap WHERE appointment_id = $1 AND person_id = $2';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      callback = function (id) {
        return function (result) {
          if (tools.getSingleResult(result).exist) {
            callbackEmptyEndPromise();
          } else {
            postgres.executeSQL(req, res, sqlInsert, [req.body.id, id], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
          }
        };
      };
      people = [];
      people = req.body.teamReminderMembers ? people.concat(req.body.teamReminderMembers) : people;
      people = req.body.attendeeReminderMembers ? people.concat(req.body.attendeeReminderMembers) : people;
      if (!people || (people && people.length === 0)) {
        resolve();
        return;
      }
      promiseCount = people.length;
      for (i = 0, l = people.length; i < l; i += 1) {
        if (tools.isNumber(people[i].id)) {
          postgres.select(sqlExistsAppPerson, [req.body.id, people[i].id], req)
            .then(callback(people[i].id), callbackEmptyEndPromiseError);
        } else {
          callbackEmptyEndPromise();
        }
      }
      // exit
      if (promiseCount === 0) {
        resolve();
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name createPeople
 * @description create persons for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.createPeople = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    var i, l, callbackEmptyEndPromise, promiseCount = 0, callbackEmptyEndPromiseError;
    callbackEmptyEndPromise = function (index) {
      return function (result) {
        req.body.attendeeReminderMembers[index].id = result.id;
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
    };
    callbackEmptyEndPromiseError = function (result) {
      promiseCount -= 1;
      reject(result);
    };
    if (!req.body.attendeeReminderMembers) {
      resolve();
      return;
    }
    for (i = 0, l = req.body.attendeeReminderMembers.length; i < l; i += 1) {
      if (!tools.isNumber(req.body.attendeeReminderMembers[i].id)) {
        promiseCount += 1;
      }
    }
    for (i = 0, l = req.body.attendeeReminderMembers.length; i < l; i += 1) {
      if (!tools.isNumber(req.body.attendeeReminderMembers[i].id)) {
        people.smartInsert(req, res, {person: [req.body.attendeeReminderMembers[i]], companyId: req.body.company_id}, null).then(
          callbackEmptyEndPromise(i),
          callbackEmptyEndPromiseError
        );
      }
    }
    // exit
    if (promiseCount === 0) {
      resolve();
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name deleteReminders
 * @description delete reminders for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.deleteReminders = function (req, res, obj) {
  var sql = 'DELETE FROM reminder WHERE appointment_id = $1';
  return postgres.executeSQL(req, res, sql, [req.body.id], null, obj);
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addReminders
 * @description add reminders for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.addReminders = function (req, res, conn) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, reminderTimeISO, ms, callbackEmptyEndPromiseError, Reminder, promiseCount, callbackEmptyEndPromise;
      Reminder = function (recipientId, reminderTime, internalRem, emailRem) {
        this.testId = req.body.testId;
        this.appointment_id = req.body.id;
        this.recipient_id = recipientId;
        this.subject = req.body.subject;
        this.note = null;
        this.original_time = req.body.start_time;
        this.reminder_time = reminderTime;
        this.in_app_rem = internalRem;
        this.email_rem = emailRem;
        this.task_id = null;
        this.goal_id = null;
      };
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };

      promiseCount = parseInt(req.body.reminder_seconds, 10) > 0 ? 1 : 0; // inn app - owner
      promiseCount +=
        (parseInt(req.body.team_reminder_seconds, 10) > 0 ? req.body.teamReminderMembers.length : 0) +
        (parseInt(req.body.attendee_reminder_seconds, 10) > 0 ? req.body.attendeeReminderMembers.length : 0);

      // add owner reminder - internal
      if (parseInt(req.body.reminder_seconds, 10) > 0) {
        // reminder_seconds - SECONDS to MILLISECONDS
        reminders.addReminder(req, res, new Reminder(req.body.owner_id, (new Date(new Date(req.body.start_time).setMilliseconds((req.body.reminder_seconds || 0) * 1000 * -1))).toISOString(), 1, null), conn).then(
          callbackEmptyEndPromise,
          callbackEmptyEndPromiseError
        );
      }

      // add team reminder - email
      if (parseInt(req.body.team_reminder_seconds, 10) > 0) {
        // team_reminder_seconds - SECONDS to MILLISECONDS
        ms = ((parseInt(req.body.team_reminder_seconds, 10) || 0) * 1000) * -1;
        reminderTimeISO = (new Date(new Date(req.body.start_time).setMilliseconds(ms))).toISOString();
        for (i = 0, l = req.body.teamReminderMembers.length; i < l; i += 1) {
          reminders.addReminder(req, res, new Reminder(req.body.teamReminderMembers[i].id, reminderTimeISO, null, 1), conn).then(
            callbackEmptyEndPromise,
            callbackEmptyEndPromiseError
          );
        }
      }

      // add other person reminder - email
      if (parseInt(req.body.attendee_reminder_seconds, 10) > 0) {
        // attendee_reminder_seconds - SECONDS to MILLISECONDS
        ms = ((parseInt(req.body.attendee_reminder_seconds, 10) || 0) * 1000) * -1;
        reminderTimeISO = (new Date(new Date(req.body.start_time).setMilliseconds(ms))).toISOString();
        for (i = 0, l = req.body.attendeeReminderMembers.length; i < l; i += 1) {
          // people exists
          reminders.addReminder(req, res, new Reminder(req.body.attendeeReminderMembers[i].id, reminderTimeISO, null, 1), conn).then(
            callbackEmptyEndPromise,
            callbackEmptyEndPromiseError
          );
        }
      }
      //console.log(promiseCount);
      // exit
      if (promiseCount === 0) {
        resolve();
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name get
 * @description get appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.get = function (req, res) {
  var sql, sqlTags, sqlReminderTeam, sqlReminderOthers, sqlProjects, sqlTexts, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, obj;

  req.assert('id', 'Id row not found.').notEmpty();
  req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();

  errors = req.validationErrors();
  if (errors) {
    return new Promise(function (resolve, reject) {
      resolve(res.json(errors));
    });
  }

  try {
    sql =
      'SELECT ' +
      '  ap.*,' +
      '  c.company_name, ' +
      '  sp.subject As pipeline_subject, ' +
      '  sps.name as sales_pipeline_stage_name,' +
      '  p.first_name||\' \'||p.last_name AS owner_name, ' +
      '  (select company_name from my_company) as "myCompanyName", ' +
      '  (SELECT MAX(id) FROM tasks t WHERE appointment_id=$1) AS "taskId", ' +
      '  (SELECT MAX(table_id) FROM texts_tables tt WHERE table_id=$1 AND table_name=\'' + constants.ATTACHMENTS_TYPES.APPOINTMENT + '\') AS "textId", ' +
      '  (SELECT MAX(attachment_id) FROM attachments_tables at WHERE table_id=$1 AND table_name=\'' + constants.ATTACHMENTS_TYPES.APPOINTMENT + '\') AS "attachmentId" ' +
      'FROM ' +
      '  appointments ap ' +
      '  LEFT JOIN reminder re ON ap.id = re.appointment_id and re.in_app_rem = 1 ' +
      '  LEFT JOIN companies c ON ap.company_id = c.id ' +
      '  LEFT JOIN sales_pipeline sp ON ap.sales_pipeline_id = sp.id ' +
      '  LEFT JOIN sales_pipeline_stages sps ON ap.sales_pipeline_stage_id = sps.id ' +
      '  LEFT JOIN people p ON ap.owner_id = p.id ' +
      'WHERE ' +
      '  ap.id = $1';

    sqlTags =
      'SELECT t.* ' +
      'FROM ' +
      '  appointment_appointment_tags tv, ' +
      '  appointment_tags t ' +
      'WHERE ' +
      '  tv.appointment_id = $1 and ' +
      '  tv.appointment_tag_id = t.id';

    sqlReminderTeam =
      'SELECT ' +
      '  p.id, ' +
      '  p.first_name||\' \'||p.last_name as name ' +
      'FROM ' +
      '  appointment_persons ap, ' +
      '  users_login u, ' +
      '  people p ' +
      'WHERE ' +
      '  ap.person_id = u.people_id AND ' +
      '  u.people_id = p.id AND ' +
      '  ap.appointment_id = $1 ' +
      'ORDER BY ' +
      '  p.last_name ';

    sqlReminderOthers =
      'SELECT ' +
      '  p.id, ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN p.first_name IS NOT NULL THEN \' \' ELSE \'\' END || p.last_name as name ' +
      'FROM ' +
      '  appointment_persons ap, ' +
      '  people p ' +
      'WHERE ' +
      '  ap.person_id = p.id AND ' +
      '  ap.appointment_id = $1 AND ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = ap.person_id) ' +
      'ORDER BY ' +
      '  p.last_name ';

    sqlProjects =
      'SELECT ' +
      '  p.id, ' +
      '  p.subject as name ' +
      'FROM ' +
      '  appointment_projects ap, ' +
      '  projects p ' +
      'WHERE ' +
      '  ap.project_id = p.id AND ' +
      '  ap.appointment_id = $1 ' +
      'ORDER BY ' +
      '  p.subject ';

    sqlTexts =
      'SELECT ' +
      ' t.id, ' +
      ' t.text ' +
      'FROM ' +
      '  texts t, ' +
      '  texts_tables tt ' +
      'WHERE ' +
      '  t.id = tt.text_id AND ' +
      '  tt.table_name = \'' + constants.ATTACHMENTS_TYPES.APPOINTMENT + '\' AND ' +
      '  tt.table_id = $1 ';

    return postgres.select(sql, [req.params.id], req).then(function (result) {
      obj = tools.getSingleResult(result);
      // company
      if (obj.company_id) {
        obj.company = [{id: obj.company_id, name: obj.company_name}];
      } else {
        obj.company = [];
      }
      // sales_pipeline
      if (obj.sales_pipeline_id) {
        obj.salesPipeline = [{id: obj.sales_pipeline_id, name: obj.pipeline_subject}];
      } else {
        obj.salesPipeline = [];
      }
    }).then(function () {
      // GET TIMEZONE - CONVERT
      return timezones.amountForDate(req, res, {date: obj.start_time, timezoneName: obj.timezone_name}).then(
        function (result) {
          var amount = new Date(obj.end_time) - new Date(obj.start_time), convertDateTime, ms;
          // convert start_time
          ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
          //ms = ms * -1; // to timezone 0 we must gmt_offset plus
          convertDateTime = new Date((new Date(obj.start_time)).setMilliseconds(ms));
          obj.start_time = convertDateTime.toISOString();
          obj.end_time = (new Date(convertDateTime.setMilliseconds(amount))).toISOString();
        }
      );
    }).then(function () {
      return postgres.select(sqlTags, [req.params.id], req).then(
        function (result) {
          obj.appointment_tags = tools.getMultiResult(result);
        }
      );
    }).then(function () {
      return postgres.select(sqlReminderTeam, [req.params.id], req).then(
        function (result) {
          obj.teamReminderMembers = tools.getMultiResult(result);
        }
      );
    }).then(function () {
      return postgres.select(sqlReminderOthers, [req.params.id], req).then(
        function (result) {
          obj.attendeeReminderMembers = tools.getMultiResult(result);
        }
      );
    }).then(function () {
      return postgres.select(sqlProjects, [req.params.id], req).then(
        function (result) {
          obj.projects = tools.getMultiResult(result);
        }
      );
    }).then(function () {
      return postgres.select(sqlTexts, [req.params.id], req).then(
        function (result) {
          obj.text = tools.getSingleResult(result);
        }
      );
    }).then(
      function (result) {
        return tools.sendResponseSuccess(obj, res, false);
      },
      function (result) {
        return tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    return tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name put
 * @description put appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  try {
    var vals, sql, errors, sqlProperties, textId,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE;


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

    tools.setNullForEmpty(req.body);

    sql =
      'UPDATE appointments SET ' +
      '  subject = $2, place = $3, location = $4, company_id = $5, start_time = $6, end_time = $7, reminder = $8, ' +
      '  team_reminder = $9, attendee_reminder = $10, memo = $11, sales_pipeline_id = $12, sales_pipeline_stage_id = $13, ' +
      '  type_id = $14, private = $15, timezone_name = $16, reminder_seconds = $17, team_reminder_seconds = $18,' +
      '  attendee_reminder_seconds = $19 ' +
      'WHERE ' +
      '  id = $1';


    //sqldb = postgres.createTransaction(req);
    //sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    sqlProperties = postgres.createTransaction(req);
    // GET TOMEZONE - CONVERT
    /*console.log('krok -1');*/
    timezones.amountForDate(req, res, {date: req.body.start_time, timezoneName: req.body.timezone_name}).then(
      function (result) {
        var amount = new Date(req.body.end_time) - new Date(req.body.start_time), convertDateTime, ms;
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        convertDateTime = new Date((new Date(req.body.start_time)).setMilliseconds(ms));
        req.body.start_time = convertDateTime.toISOString();
        req.body.end_time = (new Date(convertDateTime.setMilliseconds(amount))).toISOString();
      }
    ).then(
      function () {
        // vals must be here, because array vals is create withou reference to object - req.body.start_time
        vals = [req.body.id, req.body.subject, req.body.place, req.body.location, req.body.company_id, req.body.start_time,
          req.body.end_time, req.body.reminder, req.body.team_reminder, req.body.attendee_reminder, req.body.memo,
          req.body.sales_pipeline_id, req.body.sales_pipeline_stage_id, req.body.type_id, req.body.private,
          /*req.body.owner_id,*/ req.body.timezone_name, req.body.reminder_seconds, req.body.team_reminder_seconds,
          req.body.attendee_reminder_seconds];
        // PUT APPOINTMENT
        //console.log('krok 0');
        return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
      }
    ).then(
      function () {
        // delete deleted tags
        //console.log('krok 1');
        return appointment.deleteAppointmentTags(req, res, sqlProperties);
      }
    ).then(
      function () {
        // save tags
        //console.log('krok 2');
        return appointment.saveAppointmentTags(req, res, sqlProperties);
      }
    ).then(
      function () {
        // save company
        //console.log('krok 3');
        return appointment.saveCompany(req, res, sqlProperties);
      }
    ).then(
      function () {
        // save sales pipeline
        //console.log('krok 4');
        return appointment.saveSalesPipeline(req, res, sqlProperties);
      }
    ).then(
      function () {
        // create persons
        //console.log('krok 5');
        return appointment.deletePeople(req, res, sqlProperties);
      }
    ).then(
      function () {
        // create persons
        //console.log('krok 6');
        return appointment.createPeople(req, res, sqlProperties);
      }
    ).then(
      function () {
        // set appointment_persons
        //console.log('krok 7');
        return appointment.addPeople(req, res, sqlProperties);
      }
    ).then(
      function () {
        // delete reminders
        //console.log('krok 8');
        return appointment.deleteReminders(req, res, sqlProperties);
      }
    ).then(
      function () {
        // set reminders
        //console.log('krok 9');
        return appointment.addReminders(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 10');
        return appointment.deleteProjects(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 11');
        return appointment.createProject(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 12');
        return appointment.addProjects(req, res, sqlProperties);
      }
    ).then(
      function () {
        //console.log('krok 13');
        sqlProperties.texts = {tableName: constants.ATTACHMENTS_TYPES.APPOINTMENT, tableId: req.body.id};
        return texts.saveText(req, res, sqlProperties);
      }
    ).then(
      function (result) {
        //console.log('krok 14');
        textId = tools.getSingleResult(result).textId;
        //console.log('krok 100');
        sqlProperties.tx.commit();
        //console.log('krok 1000');
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 10');
        tools.sendResponseSuccess({id: vals[0], textId: textId}, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name listForCalendar
 * @description list of appointments for calendar
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForCalendar = function (req, res) {
  var sql, errors, dateFrom, dateTo, date, loginToken, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
    events, i, l;
  loginToken = req.signedCookies.auth_token;
  if (req.params.person) {
    req.assert('person', tools.getValidationMessage('person', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    sql =
      'SELECT ' +
      '  a.id, ' +
      '  \'' + constants.TYPE_CALENDAR_EVENT_APPOINTMENT + '\' As type, ' +
      '  a.subject as title, ' +
      '  a.start_time as start, ' +
      '  a.end_time as end, ' +
      '  CASE WHEN a.type_id = 2 THEN TRUE ELSE FALSE END As "allDay", ' +
      '  a.location, ' +
      '  a.type_id as "typeId", ' +
      '  c.company_name As "companyName",' +
      '  array_to_string(array(' +
      '    select ' +
      '      first_name||\' \'||last_name ' +
      '    from ' +
      '      appointment_persons ap, ' +
      '      people p ' +
      '    where ' +
      '      ap.person_id = p.id AND ' +
      '      ap.appointment_id = a.id ' +
      '  ), \',\') as attendees ' +
      'FROM ' +
      '  appointments a ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN users_login u ON a.owner_id = u.people_id ' +
      'WHERE ' +
      '  a.start_time >= $1::date AND ' +
      '  a.start_time <= $2::date AND ' +
      '  ((u.login_token = $3::varchar AND $4::int IS NULL) OR (u.people_id = $4::int AND $4 IS NOT NULL))' +
      'ORDER BY ' +
      '  a.start_time desc ';

    if (req.query.startTime) {
      dateFrom = tools.addMonths(new Date(req.query.startTime), -1);
      dateTo = tools.addMonths(new Date(req.query.endTime), 1);
    } else {
      date = new Date();
      dateFrom = tools.addMonths(date, -1);
      dateTo = tools.addMonths(date, 1);
    }
    postgres.select(sql, [dateFrom, dateTo, loginToken, req.params.person], req).then(
      function (result) {
        events = tools.getMultiResult(result);
        for (i = 0, l = events.length; i < l; i += 1) {
          events[i].backgroundColor = tools.getColorEventForCalendar(events[i]);
          events[i].editable = !(((new Date(events[i].end) - new Date(events[i].start)) < 30 * 60 * 1000) || events[i].allDay);
        }
        tools.sendResponseSuccess(events, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name putFromCalendar
 * @description put from calendar
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.putFromCalendar = function (req, res) {
  var sql, errors, values,
  //message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.body.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  req.assert('start_time', 'start_time not found.').notEmpty();
  if (req.body.start_time && !tools.validateIsoDate(req.body.start_time)) {
    req.assert('start_time', tools.getValidationMessage('start_time', message_valid_format, null, null)).isNull();
  }
  req.assert('end_time', 'end_time not found.').notEmpty();
  if (req.body.end_time && !tools.validateIsoDate(req.body.end_time)) {
    req.assert('end_time', tools.getValidationMessage('end_time', message_valid_format, null, null)).isNull();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'UPDATE appointments set ' +
      ' start_time = $2, end_time = $3 ' +
      'WHERE' +
      '  id = $1';

    values = [req.body.id, req.body.start_time, req.body.end_time];
    postgres.executeSQL(req, res, sql, values, null, null).then(
      function (result) {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name list
 * @description list of appointments
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.list = function (req, res) {
  try {
    var obj = {rows: [], count: req.query.count},
      page = req.query.page || 1,
      amount = req.query.amount || 10,
      type = req.query.type || -1,
      offset = (page * amount) - amount,
      loadCount = parseInt(req.query.loadCount, 10),
      searchStr = req.query.searchStr ? req.query.searchStr.toUpperCase() : '',
      sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection;

    accessColumnOrder = ['START_TIME', 'SUBJECT', 'OWNER', 'OWNERSORT'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' SUBJECT ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  a.ID, ' +
      '  a.SUBJECT, ' +
      '  a.START_TIME, ' +
      '  a.END_TIME, ' +
      '  (a.START_TIME - a.END_TIME) as "duration", ' +
      '  pe.FIRST_NAME||\' \'||pe.LAST_NAME AS "owner", ' +
      '  pe.LAST_NAME||\' \'||pe.FIRST_NAME AS "ownersort" ' +
      'FROM ' +
      '  appointments a ' +
      '    LEFT JOIN PEOPLE pe ON a.OWNER_ID = pe.ID ' +
      'WHERE ' +
      '  (UPPER(a.SUBJECT) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      '  AND ( (($4::integer = 0 AND to_char(a.end_time, \'YYYY-MM-DD HH24:MM:SS\') > to_char(current_timestamp at time zone \'UTC\', \'YYYY-MM-DD HH24:MM:SS\')) OR $4::integer = -1) ' +
      '  OR (($4::integer = 1 AND to_char( a.end_time, \'YYYY-MM-DD HH24:MM:SS\') <= to_char(current_timestamp at time zone \'UTC\', \'YYYY-MM-DD HH24:MM:SS\')) OR $4::integer = -1) ' +
      ' ) ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount, $1::varchar as x ' +
      'FROM ' +
      '  appointments a ' +
      'WHERE ' +
      '   (UPPER(a.SUBJECT) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   $1::varchar = \'\') ' +
      '  AND ( (($2::integer = 0 AND to_char(a.end_time, \'YYYY-MM-DD HH24:MM:SS\') > to_char(current_timestamp at time zone \'UTC\', \'YYYY-MM-DD HH24:MM:SS\')) OR $2::integer = -1) ' +
      '  OR (($2::integer = 1 AND to_char(a.end_time, \'YYYY-MM-DD HH24:MM:SS\') <= to_char(current_timestamp at time zone \'UTC\', \'YYYY-MM-DD HH24:MM:SS\')) OR $2::integer = -1) ' +
      ' ) ';

    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr, type], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr, type], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    }
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name createProject
 * @description create projects for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.createProject = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    var i, l, callbackEmptyEndPromise, promiseCount = 0, callbackEmptyEndPromiseError;
    callbackEmptyEndPromise = function (index) {
      return function (result) {
        req.body.projects[index].id = result.id;
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
    };
    callbackEmptyEndPromiseError = function (result) {
      promiseCount -= 1;
      reject(result);
    };

    if (!req.body.projects) {
      resolve();
      return;
    }
    for (i = 0, l = req.body.projects.length; i < l; i += 1) {
      if (!tools.isNumber(req.body.projects[i].id)) {
        promiseCount += 1;
      }
    }
    for (i = 0, l = req.body.projects.length; i < l; i += 1) {
      if (!tools.isNumber(req.body.projects[i].id)) {
        projects.smartInsert(req, res, {project: [req.body.projects[i]]}, null).then(
          callbackEmptyEndPromise(i),
          callbackEmptyEndPromiseError
        );
      }
    }
    // exit
    if (promiseCount === 0) {
      resolve();
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name addProjects
 * @description add projects for Appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.addProjects = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, projects, sqlInsert, callbackEmptyEndPromise, promiseCount = 0, sqlExistsAppProject, callback,
        callbackEmptyEndPromiseError;
      sqlInsert = 'INSERT INTO appointment_projects(appointment_id, project_id) VALUES($1, $2)';
      sqlExistsAppProject = 'SELECT 1 AS exist FROM appointment_projects ap WHERE appointment_id = $1 AND project_id = $2';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      callback = function (id) {
        return function (result) {
          if (tools.getSingleResult(result).exist) {
            callbackEmptyEndPromise();
          } else {
            postgres.executeSQL(req, res, sqlInsert, [req.body.id, id], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
          }
        };
      };
      projects = [];
      projects = req.body.projects ? projects.concat(req.body.projects) : projects;
      if (!projects || (projects && projects.length === 0)) {
        resolve();
        return;
      }
      promiseCount = projects.length;
      for (i = 0, l = projects.length; i < l; i += 1) {
        if (tools.isNumber(projects[i].id)) {
          postgres.select(sqlExistsAppProject, [req.body.id, projects[i].id], req)
            .then(callback(projects[i].id), callbackEmptyEndPromiseError);
        } else {
          callbackEmptyEndPromise();
        }
      }
      // exit
      if (promiseCount === 0) {
        resolve();
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Appointment
 * @method
 * @name deleteProjects
 * @description delete appointment projects
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.deleteProjects = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var e, j, i, l, noExist = [], exist, rows, sqlDelete, sqlExists, callbackEmptyEndPromise, promiseCount = 0, projects,
        callbackEmptyEndPromiseError;
      sqlExists = 'SELECT project_id AS id FROM appointment_projects ap WHERE appointment_id = $1';
      sqlDelete = 'DELETE FROM appointment_projects WHERE appointment_id = $1 AND project_id = $2';
      callbackEmptyEndPromise = function () {
        promiseCount -= 1;
        if (promiseCount === 0) {
          resolve();
        }
      };
      callbackEmptyEndPromiseError = function (result) {
        promiseCount -= 1;
        reject(result);
      };
      projects = [];
      projects = req.body.projects ? projects.concat(req.body.projects) : projects;
      postgres.select(sqlExists, [req.body.id], req).then(function (result) {
        rows = tools.getMultiResult(result);
        for (i = 0, l = rows.length; i < l; i += 1) {
          exist = false;
          for (e = 0, j = projects.length; e < j; e += 1) {
            if (projects[e].id === rows[i].id) {
              exist = true;
              break;
            }
          }
          if (!exist) {
            noExist.push(rows[i].id);
          }
        }
        promiseCount = noExist.length;
        for (i = 0, l = noExist.length; i < l; i += 1) {
          postgres.executeSQL(req, res, sqlDelete, [req.body.id, noExist[i]], null, obj).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
        }
        if (noExist.length === 0) {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
