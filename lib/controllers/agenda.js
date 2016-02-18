/*jslint node: true, unparam: true */
'use strict';

/**
 * @file agenda
 * @fileOverview __Server_REST_API_Agenda
 */

/**
 * @namespace __Server_REST_API_Agenda
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name listForWeek
 * @description list of events for agenda week
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForWeek = function (req, res) {
  var sql, errors, dateFrom, dateTo, message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    sqlPhoneCall, sqlBusinessMeeting, sqlOtherAppointment, sqlAllDayEvent, sqlTask, sqlReminder,
    sqlBirthdayUsers, sqlBirthdayUsersComp, sqlAnniversaryUsers, sqlAnniversaryUsersComp, week,
    loginToken;
  loginToken = req.signedCookies.auth_token;
  req.assert('date', 'date not found.').notEmpty();
  if (!tools.isDate(new Date(req.params.date))) {
    req.assert('date', tools.getValidationMessage('date', message_valid_format, null, null)).isNull();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    week = 7;
    dateFrom = new Date(req.params.date);
    dateTo = new Date((new Date(dateFrom)).setMilliseconds(week * 24 * 60 * 60 * 1000));

    // PHONE CALL
    sqlPhoneCall =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 1 and ' +
      '  a.start_time >= $1::date and ' +
      '  a.start_time < $2::date';

    // BUSINESS MEETING
    sqlBusinessMeeting =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject,' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName",' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 3 and ' +
      '  a.start_time >= $1::date and ' +
      '  a.start_time < $2::date';

    // OTHER APPOINTMENT
    sqlOtherAppointment =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_OTHER + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 4 and ' +
      '  a.start_time >= $1::date and ' +
      '  a.start_time < $2::date';

    // ALL DAY EVENT
    sqlAllDayEvent =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 2 and ' +
      '  a.start_time >= $1::date and ' +
      '  a.start_time < $2::date';

    // TASK
    sqlTask =
      'SELECT ' +
      '  t.start_date as "datePrimary", ' +
      '  t.owner_id as "ownerId", ' +
      '  t.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_TASK + '\' as type, ' +
      '  t.start_date as "startTime", ' +
      '  t.due_date as "endTime", ' +
      '  t.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  tasks t' +
      '  INNER JOIN users_login u ON t.owner_id = u.people_id ' +
      '  LEFT JOIN people p ON t.person_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      'WHERE' +
      '  t.finish_date is null and ' +
      '  (t.start_date::date) >= $1::date and ' +
      '  (t.start_date::date) < $2::date';

    // REMINDER
    sqlReminder =
      'SELECT ' +
      '  r.original_time as "datePrimary", ' +
      '  r.recipient_id as "ownerId", ' +
      '  r.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_REMINDER + '\' as type, ' +
      '  original_time as "startTime", ' +
      '  null as "endTime", ' +
      '  r.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  null as "companyName", ' +
      '  null as people,' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  reminder r ' +
      '  INNER JOIN users_login u ON r.recipient_id = u.people_id ' +
      '  LEFT JOIN people p ON r.recipient_id = p.id ' +
      'WHERE ' +
      '  r.finish_date is null and ' +
      '  r.appointment_id is null and ' +
      '  r.task_id is null and ' +
      '  r.goal_id is null and ' +
      '  (r.original_time::date) >= $1::date and ' +
      '  (r.original_time::date) < $2::date';

    // BIRTHDAY
    sqlBirthdayUsers =
      'SELECT ' +
      '  to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') as "datePrimary", ' +
      /*'  7 as "ownerId", ' +*/
      '  (SELECT people_id FROM users_login ul WHERE login_token = $3) as "ownerId", ' +
      '  p.id, ' +
      '  p.email, ' +
      '  \'' + constants.AGENDA_TYPE_BIRTHDAY + '\' as type, ' +
      '  birthday as "startTime", ' +
      '  null as "endTime", ' +
      '  null as subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  EXTRACT(YEAR FROM birthday::date) as "birthdayYear", ' +
      '  (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM COALESCE(birthday::date, CURRENT_DATE))) as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  people p ' +
      '  INNER JOIN users_login u ON p.id = u.people_id ' +
      '  LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '  LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') >= $1::date) and ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') < $2::date) ';

    sqlBirthdayUsersComp =
      'SELECT ' +
      '  to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') as "datePrimary", ' +
      /*'  7 as "ownerId", ' +*/
      '  (SELECT people_id FROM users_login ul WHERE login_token = $3) as "ownerId", ' +
      '  p.id, ' +
      '  p.email, ' +
      '  \'' + constants.AGENDA_TYPE_BIRTHDAY + '\' as type, ' +
      '  birthday as "startTime", ' +
      '  null as "endTime", ' +
      '  null as subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  EXTRACT(YEAR FROM birthday::date) as "birthdayYear", ' +
      '  (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM COALESCE(birthday::date, CURRENT_DATE))) as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  people p ' +
      '  LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '  LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') >= $1::date) and ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM birthday::date) || \'-\' || EXTRACT(DAY FROM birthday::date), \'YYYY-MM-DD\') < $2::date) and ' +
      '   c.owner_id = (SELECT people_id FROM users_login ul WHERE login_token = $3)';
      /*'   c.owner_id = 7 ';*/

    // ANNIVERSARY
    sqlAnniversaryUsers =
      'SELECT ' +
      '  to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') as "datePrimary", ' +
      /*'  7 as "ownerId", ' +*/
      '  (SELECT people_id FROM users_login ul WHERE login_token = $3) as "ownerId", ' +
      '  p.id, ' +
      '  p.email, ' +
      '  \'' + constants.AGENDA_TYPE_ANNIVERSARY + '\' as type, ' +
      '  anniversary as "startTime", ' +
      '  null as "endTime", ' +
      '  anniversary_name as subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  pos.name as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  EXTRACT(YEAR FROM anniversary) as "anniversaryYear", ' +
      '  (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM COALESCE(anniversary, CURRENT_DATE))) as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  people p ' +
      '  INNER JOIN users_login u ON p.id = u.people_id ' +
      '  LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '  LEFT JOIN companies c ON pc.companies_id = c.id ' +
      '  LEFT JOIN positions pos ON pc.position_id = pos.id ' +
      'WHERE ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') >= $1::date) and ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') < $2::date)';

    sqlAnniversaryUsersComp =
      'SELECT ' +
      '  to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') as "datePrimary", ' +
      /*'  7 as "ownerId", ' +*/
      '  c.owner_id as "ownerId", ' +
      '  p.id, ' +
      '  p.email, ' +
      '  \'' + constants.AGENDA_TYPE_ANNIVERSARY + '\' as type, ' +
      '  anniversary as "startTime", ' +
      '  null as "endTime", ' +
      '  anniversary_name as subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  pos.name as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  EXTRACT(YEAR FROM anniversary) as "anniversaryYear", ' +
      '  (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM COALESCE(anniversary, CURRENT_DATE))) as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  people p ' +
      '  LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '  LEFT JOIN companies c ON pc.companies_id = c.id ' +
      '  LEFT JOIN positions pos ON pc.position_id = pos.id ' +
      'WHERE ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') >= $1::date) and ' +
      '  (to_date(EXTRACT(YEAR FROM CURRENT_DATE) || \'-\' || EXTRACT(MONTH FROM anniversary) || \'-\' || EXTRACT(DAY FROM anniversary), \'YYYY-MM-DD\') < $2::date) and ' +
      '   c.owner_id = (SELECT people_id FROM users_login ul WHERE login_token = $3)';
    /*'   c.owner_id = 7 ';*/

    sql =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '   UNION ' +
      '     (' + sqlReminder + ')' +
      '   UNION ' +
      '     (' + sqlBirthdayUsers + ')' +
      '   UNION ' +
      '     (' + sqlBirthdayUsersComp + ')' +
      '   UNION ' +
      '     (' + sqlAnniversaryUsers + ')' +
      '   UNION ' +
      '     (' + sqlAnniversaryUsersComp + ')' +
      '  ) S ';

    postgres.select(sql, [dateFrom, dateTo, loginToken], req).then(
      function (result) {
        res.json(tools.getMultiResult(result));
      },
      function (result) {
        console.log(result);
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    console.log(e);
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name sendEmail
 * @description send email to person
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.sendEmail = function (req, res) {
  var sql, errors, email, emailMessage = {}, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;
  req.assert('person', 'person not found.').notEmpty();
  if (req.body.person) {
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
      '  email ' +
      'FROM ' +
      '  people p ' +
      'WHERE ' +
      '  p.id = $1';
    postgres.select(sql, [req.body.person], req).then(
      function (result) {
        email = tools.getSingleResult(result).email;
        if (email) {
          emailMessage.recipient = email;
          emailMessage.subject = 'Send from agenda';
          emailMessage.text = 'Send from agenda - text';
          tools.sendEmail(emailMessage);
          res.json(constants.OK);
        } else {
          res.json({message: {type: 'ERROR_MODAL', msg: 'Error on server(Email for person not found)'}});
        }
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
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name listForOpportunity
 * @description list of events for agenda - opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForOpportunity = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, sqlMaster, sqlDate,
    sqlPhoneCall, sqlBusinessMeeting, sqlOtherAppointment, sqlAllDayEvent, sqlTask, sqlCount, sqlDatePaging,
    obj = {rows: [], count: req.query.count},
    page = req.query.page || 1,
    amount = req.query.amount || 10,
    offset = (page * amount) - amount,
    accessDirection,
    accessColumnOrder,
    accessColumnOrderDirection,
    sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
    sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
    direction = req.query.direction,
    sqlOrderBy,
    sqlOrderByField,
    sqlOrderByDirection,
    sqlDirection,
    loadCount = parseInt(req.query.loadCount, 10);

  accessColumnOrder = ['DATEPRIMARY'];
  accessDirection = ['>=', '<='];
  accessColumnOrderDirection = ['ASC', 'DESC'];
  sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' "datePrimary" ';
  sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' DESC ';
  sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';
  sqlDirection = accessDirection.indexOf(direction) > -1 ? direction : ' >= ';

  req.checkParams('id', 'id not found.').notEmpty();
  if (req.params.id) {
    req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    // PHONE CALL
    sqlPhoneCall =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 1 and ' +
      '  a.sales_pipeline_id = $1 ';

    // BUSINESS MEETING
    sqlBusinessMeeting =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject,' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName",' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 3 and ' +
      '  a.sales_pipeline_id = $1 ';

    // OTHER APPOINTMENT
    sqlOtherAppointment =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_OTHER + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 4 and ' +
      '  a.sales_pipeline_id = $1 ';

    // ALL DAY EVENT
    sqlAllDayEvent =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 2 and ' +
      '  a.sales_pipeline_id = $1 ';

    // TASK
    sqlTask =
      'SELECT ' +
      '  t.start_date as "datePrimary", ' +
      '  t.owner_id as "ownerId", ' +
      '  t.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_TASK + '\' as type, ' +
      '  t.start_date as "startTime", ' +
      '  t.due_date as "endTime", ' +
      '  t.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  tasks t' +
      '  INNER JOIN users_login u ON t.owner_id = u.people_id ' +
      '  LEFT JOIN people p ON t.person_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      'WHERE' +
      '  t.finish_date is null and ' +
      '  t.sales_pipeline_id = $1 ';

    sqlMaster =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ';

    sqlDate =
      'SELECT ' +
      ' s."datePrimary" ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ' +
      'WHERE ' +
      '  ($2::varchar IS NOT NULL AND s."datePrimary" ' + sqlDirection + ' $2::date) OR ($2::varchar IS NULL) ' +
      'GROUP BY ' +
      '  s."datePrimary" ';

    sqlDatePaging =
      sqlDate +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $3::integer ' +
      'OFFSET $4::integer';

    sql =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      ' (' +
      sqlMaster +
      ' ) S2 ' +
      'WHERE ' +
      '  S2."datePrimary" IN ( ' +
      sqlDatePaging +
      ') ' +
      'ORDER BY ' +
      sqlOrderBy;

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM (' + sqlDate + ') S2';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.params.id, req.query.datePrimary], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [req.params.id, req.query.datePrimary, amount, offset], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(constants.E500, res, false);
        }
      );
    }
  } catch (e) {
    console.log(e);
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name listForProject
 * @description list of events for agenda - project
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForProject = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, sqlMaster, sqlDate,
    sqlPhoneCall, sqlBusinessMeeting, sqlOtherAppointment, sqlAllDayEvent, sqlTask, sqlCount, sqlDatePaging,
    obj = {rows: [], count: req.query.count},
    page = req.query.page || 1,
    amount = req.query.amount || 10,
    offset = (page * amount) - amount,
    accessDirection,
    accessColumnOrder,
    accessColumnOrderDirection,
    sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
    sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
    direction = req.query.direction,
    sqlOrderBy,
    sqlOrderByField,
    sqlOrderByDirection,
    sqlDirection,
    loadCount = parseInt(req.query.loadCount, 10);

  accessColumnOrder = ['DATEPRIMARY'];
  accessDirection = ['>=', '<='];
  accessColumnOrderDirection = ['ASC', 'DESC'];
  sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' "datePrimary" ';
  sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' DESC ';
  sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';
  sqlDirection = accessDirection.indexOf(direction) > -1 ? direction : ' >= ';

  req.checkParams('id', 'id not found.').notEmpty();
  if (req.params.id) {
    req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    // PHONE CALL
    sqlPhoneCall =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_projects ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 1 and ' +
      '  ap.project_id = $1 ';

    // BUSINESS MEETING
    sqlBusinessMeeting =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject,' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName",' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_projects ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 3 and ' +
      '  ap.project_id = $1 ';

    // OTHER APPOINTMENT
    sqlOtherAppointment =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_OTHER + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_projects ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 4 and ' +
      '  ap.project_id = $1 ';

    // ALL DAY EVENT
    sqlAllDayEvent =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_projects ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 2 and ' +
      '  ap.project_id = $1 ';

    // TASK
    sqlTask =
      'SELECT ' +
      '  t.start_date as "datePrimary", ' +
      '  t.owner_id as "ownerId", ' +
      '  t.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_TASK + '\' as type, ' +
      '  t.start_date as "startTime", ' +
      '  t.due_date as "endTime", ' +
      '  t.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  tasks t' +
      '  INNER JOIN users_login u ON t.owner_id = u.people_id ' +
      '  LEFT JOIN people p ON t.person_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      'WHERE' +
      '  t.finish_date is null and ' +
      '  t.project_id = $1 ';

    sqlMaster =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ';

    sqlDate =
      'SELECT ' +
      ' s."datePrimary" ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ' +
      'WHERE ' +
      '  ($2::varchar IS NOT NULL AND s."datePrimary" ' + sqlDirection + ' $2::date) OR ($2::varchar IS NULL) ' +
      'GROUP BY ' +
      '  s."datePrimary" ';

    sqlDatePaging =
      sqlDate +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $3::integer ' +
      'OFFSET $4::integer';

    sql =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      ' (' +
      sqlMaster +
      ' ) S2 ' +
      'WHERE ' +
      '  S2."datePrimary" IN ( ' +
      sqlDatePaging +
      ') ' +
      'ORDER BY ' +
      sqlOrderBy;

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM (' + sqlDate + ') S2';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.params.id, req.query.datePrimary], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [req.params.id, req.query.datePrimary, amount, offset], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(constants.E500, res, false);
        }
      );
    }
  } catch (e) {
    console.log(e);
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name listForPerson
 * @description list of events for agenda - person
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForPerson = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, sqlMaster, sqlDate,
    sqlPhoneCall, sqlBusinessMeeting, sqlOtherAppointment, sqlAllDayEvent, sqlTask, sqlCount, sqlDatePaging,
    obj = {rows: [], count: req.query.count},
    page = req.query.page || 1,
    amount = req.query.amount || 10,
    offset = (page * amount) - amount,
    accessDirection,
    accessColumnOrder,
    accessColumnOrderDirection,
    sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
    sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
    direction = req.query.direction,
    sqlOrderBy,
    sqlOrderByField,
    sqlOrderByDirection,
    sqlDirection,
    loadCount = parseInt(req.query.loadCount, 10);

  accessColumnOrder = ['DATEPRIMARY'];
  accessDirection = ['>=', '<='];
  accessColumnOrderDirection = ['ASC', 'DESC'];
  sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' "datePrimary" ';
  sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' DESC ';
  sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';
  sqlDirection = accessDirection.indexOf(direction) > -1 ? direction : ' >= ';

  req.checkParams('id', 'id not found.').notEmpty();
  if (req.params.id) {
    req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    // PHONE CALL
    sqlPhoneCall =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_persons ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 1 and ' +
      '  ap.person_id = $1 ';

    // BUSINESS MEETING
    sqlBusinessMeeting =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject,' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName",' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_persons ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 3 and ' +
      '  ap.person_id = $1 ';

    // OTHER APPOINTMENT
    sqlOtherAppointment =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_OTHER + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_persons ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 4 and ' +
      '  ap.person_id = $1 ';

    // ALL DAY EVENT
    sqlAllDayEvent =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      '  LEFT JOIN appointment_persons ap ON a.id = ap.appointment_id ' +
      'WHERE ' +
      '  a.type_id = 2 and ' +
      '  ap.person_id = $1 ';

    // TASK
    sqlTask =
      'SELECT ' +
      '  t.start_date as "datePrimary", ' +
      '  t.owner_id as "ownerId", ' +
      '  t.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_TASK + '\' as type, ' +
      '  t.start_date as "startTime", ' +
      '  t.due_date as "endTime", ' +
      '  t.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  tasks t' +
      '  INNER JOIN users_login u ON t.owner_id = u.people_id ' +
      '  LEFT JOIN people p ON t.person_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      'WHERE' +
      '  t.finish_date is null and ' +
      '  t.person_id = $1 ';

    sqlMaster =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ';

    sqlDate =
      'SELECT ' +
      ' s."datePrimary" ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ' +
      'WHERE ' +
      '  ($2::varchar IS NOT NULL AND s."datePrimary" ' + sqlDirection + ' $2::date) OR ($2::varchar IS NULL) ' +
      'GROUP BY ' +
      '  s."datePrimary" ';

    sqlDatePaging =
      sqlDate +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $3::integer ' +
      'OFFSET $4::integer';

    sql =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      ' (' +
      sqlMaster +
      ' ) S2 ' +
      'WHERE ' +
      '  S2."datePrimary" IN ( ' +
      sqlDatePaging +
      ') ' +
      'ORDER BY ' +
      sqlOrderBy;

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM (' + sqlDate + ') S2';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.params.id, req.query.datePrimary], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [req.params.id, req.query.datePrimary, amount, offset], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(constants.E500, res, false);
        }
      );
    }
  } catch (e) {
    console.log(e);
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Agenda
 * @method
 * @name listForCompany
 * @description list of events for agenda - company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForCompany = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, sqlMaster, sqlDate,
    sqlPhoneCall, sqlBusinessMeeting, sqlOtherAppointment, sqlAllDayEvent, sqlTask, sqlCount, sqlDatePaging,
    obj = {rows: [], count: req.query.count},
    page = req.query.page || 1,
    amount = req.query.amount || 10,
    offset = (page * amount) - amount,
    accessDirection,
    accessColumnOrder,
    accessColumnOrderDirection,
    sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
    sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
    direction = req.query.direction,
    sqlOrderBy,
    sqlOrderByField,
    sqlOrderByDirection,
    sqlDirection,
    loadCount = parseInt(req.query.loadCount, 10);

  accessColumnOrder = ['DATEPRIMARY'];
  accessDirection = ['>=', '<='];
  accessColumnOrderDirection = ['ASC', 'DESC'];
  sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' "datePrimary" ';
  sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' DESC ';
  sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';
  sqlDirection = accessDirection.indexOf(direction) > -1 ? direction : ' >= ';

  req.checkParams('id', 'id not found.').notEmpty();
  if (req.params.id) {
    req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    // PHONE CALL
    sqlPhoneCall =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_PHONE_CALL + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 1 and ' +
      '  a.company_id = $1 ';

    // BUSINESS MEETING
    sqlBusinessMeeting =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject,' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName",' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 3 and ' +
      '  a.company_id = $1 ';

    // OTHER APPOINTMENT
    sqlOtherAppointment =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_OTHER + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 4 and ' +
      '  a.company_id = $1 ';

    // ALL DAY EVENT
    sqlAllDayEvent =
      'SELECT ' +
      '  a.start_time as "datePrimary", ' +
      '  a.owner_id as "ownerId", ' +
      '  a.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT + '\' as type, ' +
      '  a.start_time as "startTime", ' +
      '  a.end_time as "endTime", ' +
      '  a.subject, ' +
      '  a.location, ' +
      '  a.place, ' +
      '  c.company_name as "companyName", ' +
      '  ARRAY(' +
      '    (select ' +
      '       COALESCE(p.first_name, \'\') || \' \' || COALESCE(p.last_name, \'\') || ' +
      '       CASE WHEN com.company_name IS NOT NULL THEN \'(\' ELSE \'\' END || COALESCE(com.company_name, \'\') || CASE WHEN com.company_name IS NOT NULL THEN \')\' ELSE \'\' END ' +
      '     from ' +
      '       appointment_persons ap ' +
      '       LEFT JOIN people p ON ap.person_id = p.id ' +
      '       LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      '       LEFT JOIN companies com ON pc.companies_id = com.id ' +
      '     where ' +
      '       ap.appointment_id = a.id)' +
      '  ) as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  null as recipient ' +
      'FROM ' +
      '  appointments a ' +
      '  INNER JOIN users_login u ON a.owner_id = u.people_id ' +
      '  LEFT JOIN companies c ON a.company_id = c.id ' +
      'WHERE ' +
      '  a.type_id = 2 and ' +
      '  a.company_id = $1 ';

    // TASK
    sqlTask =
      'SELECT ' +
      '  t.start_date as "datePrimary", ' +
      '  t.owner_id as "ownerId", ' +
      '  t.id, ' +
      '  null as email, ' +
      '  \'' + constants.AGENDA_TYPE_TASK + '\' as type, ' +
      '  t.start_date as "startTime", ' +
      '  t.due_date as "endTime", ' +
      '  t.subject, ' +
      '  null as location, ' +
      '  null as place, ' +
      '  c.company_name as "companyName", ' +
      '  null as people, ' +
      '  null as position, ' +
      '  0 as "birthdayYear", ' +
      '  0 as "birthdayCount", ' +
      '  0 as "anniversaryYear", ' +
      '  0 as "anniversaryCount", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN (COALESCE(p.first_name, \'\')||COALESCE(p.last_name, \'\')) IS NOT NULL THEN \' \' ELSE \'\' END || COALESCE(p.last_name, \'\') as recipient ' +
      'FROM ' +
      '  tasks t' +
      '  INNER JOIN users_login u ON t.owner_id = u.people_id ' +
      '  LEFT JOIN people p ON t.person_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      'WHERE' +
      '  t.finish_date is null and ' +
      '  t.company_id = $1 ';

    sqlMaster =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ';

    sqlDate =
      'SELECT ' +
      ' s."datePrimary" ' +
      'FROM ' +
      '  ( ' +
      '     (' + sqlPhoneCall + ')' +
      '   UNION ' +
      '     (' + sqlBusinessMeeting + ')' +
      '   UNION ' +
      '     (' + sqlOtherAppointment + ')' +
      '   UNION ' +
      '     (' + sqlAllDayEvent + ')' +
      '   UNION ' +
      '     (' + sqlTask + ')' +
      '  ) S ' +
      'WHERE ' +
      '  ($2::varchar IS NOT NULL AND s."datePrimary" ' + sqlDirection + ' $2::date) OR ($2::varchar IS NULL) ' +
      'GROUP BY ' +
      '  s."datePrimary" ';

    sqlDatePaging =
      sqlDate +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $3::integer ' +
      'OFFSET $4::integer';

    sql =
      'SELECT ' +
      ' * ' +
      'FROM ' +
      ' (' +
      sqlMaster +
      ' ) S2 ' +
      'WHERE ' +
      '  S2."datePrimary" IN ( ' +
      sqlDatePaging +
      ') ' +
      'ORDER BY ' +
      sqlOrderBy;

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM (' + sqlDate + ') S2';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.params.id, req.query.datePrimary], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [req.params.id, req.query.datePrimary, amount, offset], req).then(
        function (result) {
          res.json(tools.getMultiResult(result));
        },
        function (result) {
          tools.sendResponseError(constants.E500, res, false);
        }
      );
    }
  } catch (e) {
    console.log(e);
    tools.sendResponseError(constants.E500, res, false);
  }
};
