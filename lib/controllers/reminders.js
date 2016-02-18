/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 13.11.2014.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file reminders
 * @fileOverview __Server_REST_API_Reminders
 */

/**
 * @namespace __Server_REST_API_Reminders
 * @author Martin Boháč
 */

var
  constants = require('./constants'),
  postgres = require('./api_pg'),
  tools = require('./tools');

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name addReminder
 * @description add reminder
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.addReminder = function (req, res, obj, conn) {
  var sql, sqlSeq, errors, values,
    loginToken = req.signedCookies.auth_token;
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return null;
  }
  try {
    sqlSeq = 'SELECT nextval(\'seq_reminder_id\') AS id,people_id as owner_id FROM users_login ul WHERE login_token = $1';
    sql = 'INSERT INTO reminder(id, recipient_id, subject, note, original_time, reminder_time, in_app_rem,' +
          ' email_rem, appointment_id, task_id, goal_id, email, finish_date, owner_id) ' +
          'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)';
    return postgres.select(sqlSeq, [loginToken], req).then(function (result) {
      values = [(obj.testId || tools.getSingleResult(result).id), obj.recipient_id, obj.subject,
        obj.note, obj.original_time, obj.reminder_time, obj.in_app_rem, obj.email_rem, obj.appointment_id,
        obj.task_id, obj.goal_id, obj.email, obj.finish_date, tools.getSingleResult(result).owner_id];
      return postgres.executeSQL(req, res, sql, values, null, conn).then(
        function (result) {
          tools.sendResponseSuccess(constants.OK, res, true);
          return constants.OK;
        },
        function (result) {
          tools.sendResponseError(result, res, true);
          throw {message: {type: constants.MESSAGE_ERROR_MODAL, msg: result}};
        }
      );
    });
  } catch (e) {
    tools.sendResponseError(constants.E500, res, true);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name post
 * @description post reminder
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  var sql, sqlSeq, errors, values,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
    loginToken = req.signedCookies.auth_token;

  req.assert('recipient_id', 'Recipient_id not found.').notEmpty();
  if (req.body.recipient_id) {
    req.assert('recipient_id', tools.getValidationMessage('recipient_id', message_valid_number, null, null)).isInt();
  }
  req.assert('subject', 'Subject not found.').notEmpty();
  if (req.body.subject) {
    req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
  }
  if (req.body.note) {
    req.assert('note', tools.getValidationMessage('note', message_valid_length, 0, 2000)).len(0, 2000);
  }
  req.assert('original_time', 'Original_time not found.').notEmpty();
  if (req.body.original_time && !tools.validateIsoDate(req.body.original_time)) {
    req.assert('original_time', tools.getValidationMessage('original_time', message_valid_format, null, null)).isNull();
  }
  //req.assert('reminder_time', 'Reminder_time not found.').notEmpty();
  if (req.body.reminder_time && !tools.validateIsoDate(req.body.reminder_time)) {
    req.assert('reminder_time', tools.getValidationMessage('reminder_time', message_valid_format, null, null)).isNull();
  }
  if (req.body.in_app_rem) {
    req.assert('in_app_rem', tools.getValidationMessage('in_app_rem', message_valid_number, null, null)).isInt();
  }
  if (req.body.email_rem) {
    req.assert('email_rem', tools.getValidationMessage('email_rem', message_valid_number, null, null)).isInt();
  }
  if (req.body.email && !tools.validateEmail(req.body.email)) {
    req.assert('email', tools.getValidationMessage('email', message_valid_format, null, null)).isNull();
  }
  if (req.body.appointment_id) {
    req.assert('appointment_id', tools.getValidationMessage('appointment_id', message_valid_number, null, null)).isInt();
  }
  if (req.body.task_id) {
    req.assert('task_id', tools.getValidationMessage('task_id', message_valid_number, null, null)).isInt();
  }
  if (req.body.goal_id) {
    req.assert('goal_id', tools.getValidationMessage('goal_id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sqlSeq = 'SELECT nextval(\'seq_reminder_id\') AS id,people_id as owner_id FROM users_login ul WHERE login_token = $1';
    sql = 'INSERT INTO reminder(id, recipient_id, subject, note, original_time, reminder_time, in_app_rem,' +
      ' email_rem, appointment_id, task_id, goal_id, email, owner_id) ' +
      'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';

    tools.setNullForEmpty(req.body);

    postgres.select(sqlSeq, [loginToken], req).then(function (result) {
      values = [req.body.id || tools.getSingleResult(result).id, req.body.recipient_id, req.body.subject,
        req.body.note, req.body.original_time, req.body.reminder_time || req.body.original_time, req.body.in_app_rem,
        req.body.email_rem, req.body.appointment_id, req.body.task_id, req.body.goal_id, req.body.email, tools.getSingleResult(result).owner_id];
      postgres.executeSQL(req, res, sql, values, null, null).then(
        function (result) {
          tools.sendResponseSuccess({id: values[0]}, res, false);
        },
        function (result) {
          tools.sendResponseError(constants.E500, res, false);
        }
      );
    });
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name put
 * @description put reminder
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  var sql, errors, values,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.body.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  req.assert('recipient_id', 'Recipient_id not found.').notEmpty();
  if (req.body.recipient_id) {
    req.assert('recipient_id', tools.getValidationMessage('recipient_id', message_valid_number, null, null)).isInt();
  }
  req.assert('subject', 'Subject not found.').notEmpty();
  if (req.body.subject) {
    req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
  }
  if (req.body.note) {
    req.assert('note', tools.getValidationMessage('note', message_valid_length, 0, 2000)).len(0, 2000);
  }
  req.assert('original_time', 'Original_time not found.').notEmpty();
  if (req.body.original_time && !tools.validateIsoDate(req.body.original_time)) {
    req.assert('original_time', tools.getValidationMessage('original_time', message_valid_format, null, null)).isNull();
  }
  req.assert('reminder_time', 'Reminder_time not found.').notEmpty();
  if (req.body.reminder_time && !tools.validateIsoDate(req.body.reminder_time)) {
    req.assert('reminder_time', tools.getValidationMessage('reminder_time', message_valid_format, null, null)).isNull();
  }
  if (req.body.in_app_rem) {
    req.assert('in_app_rem', tools.getValidationMessage('in_app_rem', message_valid_number, null, null)).isInt();
  }
  if (req.body.email_rem) {
    req.assert('email_rem', tools.getValidationMessage('email_rem', message_valid_number, null, null)).isInt();
  }
  if (req.body.email && !tools.validateEmail(req.body.email)) {
    req.assert('email', tools.getValidationMessage('email', message_valid_format, null, null)).isNull();
  }
  if (req.body.appointment_id) {
    req.assert('appointment_id', tools.getValidationMessage('appointment_id', message_valid_number, null, null)).isInt();
  }
  if (req.body.task_id) {
    req.assert('task_id', tools.getValidationMessage('task_id', message_valid_number, null, null)).isInt();
  }
  if (req.body.goal_id) {
    req.assert('goal_id', tools.getValidationMessage('goal_id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'UPDATE reminder set' +
      ' recipient_id = $2, subject = $3, note = $4, original_time = $5, reminder_time = $6, in_app_rem = $7,' +
      ' email_rem = $8, appointment_id = $9, task_id = $10, goal_id = $11, email = $12' +
      'WHERE' +
      '  id = $1';

    tools.setNullForEmpty(req.body);

    values = [req.body.id, req.body.recipient_id, req.body.subject, req.body.note, req.body.original_time,
      req.body.reminder_time, req.body.in_app_rem, req.body.email_rem, req.body.appointment_id, req.body.task_id, req.body.goal_id,
      req.body.email];
    postgres.executeSQL(req, res, sql, values, null, null).then(
      function (result) {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name del
 * @description del reminder
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.del = function (req, res) {
  var sql, errors,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql = 'DELETE FROM reminder WHERE id = $1';
    postgres.executeSQL(req, res, sql, [req.params.id], null, null).then(
      function (result) {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name get
 * @description get reminder
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;
  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  r.*, ' +
      '  CASE WHEN u.people_id IS NULL THEN 2 ELSE 1 END As remind, ' +
      '  p.id As remind_id, ' +
      '  p.email As remind_email, ' +
      '  p.email2 As remind_email2, ' +
      '  COALESCE(a.subject, t.subject) As type_subject, ' +
      '  p.first_name||\' \'||p.last_name as remind_name, ' +
      '  CASE WHEN p.last_name IS NOT NULL THEN COALESCE(p.last_name,\'\')||\' \'||COALESCE(p.first_name,\'\') ELSE p.first_name END As remind_person_name ' +
      'FROM ' +
      '  reminder r ' +
      '  LEFT JOIN users_login u ON r.recipient_id = u.people_id ' +
      '  LEFT JOIN people p ON r.recipient_id = p.id ' +
      '  LEFT JOIN appointments a ON r.appointment_id = a.id ' +
      '  LEFT JOIN tasks t ON r.task_id = t.id ' +
      'WHERE ' +
      '  r.id = $1 ';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        tools.sendResponseSuccess(tools.getSingleResult(result), res, false);
      },
      function (result) {
        tools.sendResponseError(constants.MESSAGE_ERROR_MODAL, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.MESSAGE_ERROR_MODAL, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
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

    accessColumnOrder = ['ORIGINAL_TIME', 'SUBJECT', 'OWNER', 'OWNERSORT', 'RECIPIENT', 'RECIPIENTSORT'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' ORIGINAL_TIME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' DESC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  r.ID, ' +
      '  r.SUBJECT, ' +
      '  r.ORIGINAL_TIME, ' +
      '  pe1.FIRST_NAME||\' \'||pe1.LAST_NAME AS "recipient", ' +
      '  pe1.LAST_NAME||\' \'||pe1.FIRST_NAME AS "recipientsort", ' +
      '  pe2.FIRST_NAME||\' \'||pe2.LAST_NAME AS "owner", ' +
      '  pe2.LAST_NAME||\' \'||pe2.FIRST_NAME AS "ownersort" ' +
      'FROM ' +
      '  reminder r ' +
      '    LEFT JOIN PEOPLE pe1 ON r.RECIPIENT_ID = pe1.ID ' +
      '    LEFT JOIN PEOPLE pe2 ON r.OWNER_ID = pe2.ID ' +
      'WHERE ' +
      '  UPPER(r.SUBJECT) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  reminder r ' +
      'WHERE ' +
      '   UPPER(r.SUBJECT) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   $1::varchar IS NULL';

    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr], req).then(
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
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name listForCalendar
 * @description list of reminders for calendar
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
      '  id, ' +
      '  \'' + constants.TYPE_CALENDAR_EVENT_REMINDER + '\' As type, ' +
      '  subject as title, ' +
      '  original_time as start, ' +
      '  original_time as end,' +
      '  reminder_time ' +
      'FROM ' +
      '  reminder r,' +
      '  users_login u ' +
      'WHERE ' +
      '  r.appointment_id is null AND ' +
      '  r.task_id is null AND ' +
      '  r.goal_id is null AND ' +
      '  r.original_time >= $1::date AND ' +
      '  r.original_time <= $2::date AND ' +
      '  r.recipient_id = u.people_id AND ' +
      '  ((u.login_token = $3::varchar AND $4::int IS NULL) OR (u.people_id = $4::int AND $4 IS NOT NULL))' +
      'ORDER BY ' +
      '  original_time desc ';

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
          events[i].className = 'reminderEvent';
          events[i].editable = !((new Date(events[i].end) - new Date(events[i].start)) < 30 * 60 * 1000);
        }
        tools.sendResponseSuccess(events, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.MESSAGE_ERROR_MODAL, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.MESSAGE_ERROR_MODAL, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
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
  req.assert('original_time', 'Original_time not found.').notEmpty();
  if (req.body.original_time && !tools.validateIsoDate(req.body.original_time)) {
    req.assert('original_time', tools.getValidationMessage('original_time', message_valid_format, null, null)).isNull();
  }
  req.assert('reminder_time', 'Reminder_time not found.').notEmpty();
  if (req.body.reminder_time && !tools.validateIsoDate(req.body.reminder_time)) {
    req.assert('reminder_time', tools.getValidationMessage('reminder_time', message_valid_format, null, null)).isNull();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'UPDATE reminder set ' +
      ' original_time = $2, reminder_time = $3 ' +
      'WHERE' +
      '  id = $1';

    values = [req.body.id, req.body.original_time, req.body.reminder_time];
    postgres.executeSQL(req, res, sql, values, null, null).then(
      function (result) {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name markAsDone
 * @description set reminder as done
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.markAsDone = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.body.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'UPDATE reminder set ' +
      ' finish_date = NOW() ' +
      'WHERE' +
      '  id = $1';

    postgres.executeSQL(req, res, sql, [req.body.id], null, null).then(
      function (result) {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Reminders
 * @method
 * @name deleteReminderFor
 * @description del reminder for
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.deleteReminderFor = function (req, res, obj, conn) {
  try {
    var sql = 'DELETE FROM reminder WHERE ' + obj.type + ' = $1::int';
    if (!obj.type) {
      return null;
    }
    return postgres.executeSQL(req, res, sql, [obj.id], null, conn);
  } catch (e) {
    return constants.E500;
  }
};
