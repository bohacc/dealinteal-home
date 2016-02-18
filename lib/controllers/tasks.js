/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Name
 * @fileOverview __Server_REST_API_Tasks
 */

/**
 * @namespace __Server_REST_API_Tasks
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  constants = require('./constants'),
  tasks = require('./tasks'),
  timezones = require('./timezones'),
  companies = require('./companies'),
  reminders = require('./reminders'),
  salesPipeline = require('./sales_pipeline'),
  projects = require('./projects'),
  people = require('./people'),
  taskPeople = require('./task_people'),
  tools = require('./tools'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name events
 * @description private function for message events in application
 * @param connect {Object} connection to database
 * @param meta {Object} meta data
 * @returns Promise
 */
exports.events = function (connect, meta) {
  var sql =
    'SELECT ' +
    '  id,' +
    '  start_date,' +
    '  u.login_token as users ' +
    'FROM ' +
    '  tasks t, ' +
    '  (select login_token from users_login ul where login_name = \'martin\') u',
    events = [],
    rows,
    i,
    l,
    usersArray;
  return postgres.select(sql, [], null, connect).then(function (result) {
    rows = tools.getMultiResult(result);
    for (i = 0, l = rows.length; i < l; i += 1) {
      if (rows[i].users) {
        usersArray = rows[i].users.split(',');
      }
      events.push({item: rows[i], users: usersArray, message: {type: 'SUCCESS', message: rows[i].start_date}});
    }
    meta.callback(meta.task);
    return events;
  });
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name markAsDone
 * @description set task as done
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
      'UPDATE tasks set ' +
      ' finish_date = NOW() ' +
      'WHERE' +
      '  id = $1';

    postgres.executeSQL(req, res, sql, [req.body.id], null, null).then(
      function () {
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name get
 * @description get task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.get = function (req, res) {
  var sql, sqlTags, sqlReminder, errors, obj, ms, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.project_id as "projectId", ' +
      '  p.subject as "projectName", ' +
      '  t.subject, ' +
      '  t.description, ' +
      '  t.start_date as "startDate", ' +
      '  t.due_date as "dueDate", ' +
      '  t.reminder_seconds as "reminderSeconds", ' +
      '  t.timezone_name as "timezoneName", ' +
      '  t.finish_date as "finishDate", ' +
      '  t.priority, ' +
      '  t.owner_id as "ownerId", ' +
      '  tp.people_id as "assignedToId", ' +
      '  t.private, ' +
      '  t.company_id as "companyId", ' +
      '  c.company_name as "companyName", ' +
      '  t.person_id as "personId", ' +
      '  COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '  t.sales_pipeline_id as "salesPipelineId", ' +
      '  sp.subject as "salesPipelineName", ' +
      '  t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '  t.preceding_task_id as "precedingTaskId" ' +
      'FROM ' +
      '  tasks t ' +
      '  LEFT JOIN projects p ON t.project_id = p.id ' +
      '  LEFT JOIN companies c ON t.company_id = c.id ' +
      '  LEFT JOIN people pe ON t.person_id = pe.id ' +
      '  LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '  LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '  LEFT JOIN people pea ON tp.people_id = pea.id ' +
      'WHERE ' +
      '  t.id = $1::int';

    sqlTags =
      'SELECT t.* ' +
      'FROM ' +
      '  tasks_tasks_tags tv, ' +
      '  tasks_tags t ' +
      'WHERE ' +
      '  tv.tasks_id = $1 and ' +
      '  tv.tasks_tags_id = t.id';

    sqlReminder =
      'SELECT ' +
      '  * ' +
      'FROM ' +
      '  reminder r ' +
      'WHERE ' +
      '  id = $1 ';

    postgres.select(sql, [req.params.id], req, null).then(function (result) {
      obj = tools.getSingleResult(result);
      // company
      if (obj.companyId) {
        obj.company = [{id: obj.companyId, name: obj.companyName}];
      } else {
        obj.company = [];
      }
      // sales_pipeline
      if (obj.salesPipelineId) {
        obj.salesPipeline = [{id: obj.salesPipelineId, name: obj.salesPipelineName}];
      } else {
        obj.salesPipeline = [];
      }
      // project
      if (obj.projectId) {
        obj.project = [{id: obj.projectId, name: obj.projectName}];
      } else {
        obj.project = [];
      }
      // person
      if (obj.personId) {
        obj.person = [{id: obj.personId, name: obj.personName}];
      } else {
        obj.person = [];
      }
    }).then(function () {
      // GET TOMEZONE - CONVERT
      return timezones.amountForDate(req, res, {date: obj.startDate, timezoneName: obj.timezoneName}).then(
        function (result) {
          // convert start_time
          ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
          obj.startDate = new Date((new Date(obj.startDate)).setMilliseconds(ms));
          obj.dueDate = new Date((new Date(obj.dueDate)).setMilliseconds(ms));
          if (obj.finishDate) {
            obj.finishDate = new Date((new Date(obj.finishDate)).setMilliseconds(ms));
          }
        }
      );
    }).then(function () {
      return postgres.select(sqlTags, [req.params.id], req, null).then(
        function (result) {
          obj.taskTags = tools.getMultiResult(result);
        }
      );
    }).then(function () {
      return postgres.select(sqlReminder, [req.params.id], req, null).then(
        function (result) {
          obj.reminder = tools.getMultiResult(result);
        }
      );
    }).then(
      function (result) {
        tools.sendResponseSuccess(obj, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name del
 * @description delete task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.del = function (req, res) {
  var sql, sqlProperties, sqldb, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    sql = 'DELETE FROM tasks WHERE id = $1::int';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    tasks.deleteTasksTags(req, res, {id: req.params.id}, sqlProperties).then(
      function () {
        return reminders.deleteReminderFor(req, res, {
          id: req.params.id,
          type: constants.REMINDER_BINDING_TYPE_FIELD_FOR_TASK
        }, sqlProperties);
      }
    ).then(
      function () {
        return taskPeople.delete(req, res, {taskId: req.params.id}, sqlProperties);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sql, [req.params.id], null, sqlProperties);
      }
    ).then(
      function (result) {
        // Success, close request
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess(constants.OK, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name tags
 * @description tags of tasks
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
    sql = 'SELECT * FROM tasks_tags tt ORDER BY name ';
    postgres.select(sql, [], req, null).then(
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name relatedList
 * @description all related tasks for task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.relatedList = function (req, res) {
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
      // PRECEDING
      '(WITH RECURSIVE q AS ( ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id,' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  WHERE ' +
      '    t.id = $1::int ' +
      '  UNION ALL ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  JOIN q ON t.id = q.preceding_task_id ' +
      ') ' +
      'SELECT * FROM q WHERE id <> $1::int ORDER BY "startDate") ' +
      ' UNION ' +
        // FOLLOWING
      '(WITH RECURSIVE q AS ( ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  WHERE ' +
      '    t.id = $1::int ' +
      '  UNION ALL ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  JOIN q ON q.id = t.preceding_task_id ' +
      ') ' +
      'SELECT * FROM q WHERE id <> $1::int ORDER BY "startDate")';
    postgres.select(sql, [req.params.id], req, null).then(
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name relatedPrecedingList
 * @description all related preceding tasks for task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.relatedPrecedingList = function (req, res) {
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
      'WITH RECURSIVE q AS ( ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id,' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  WHERE ' +
      '    t.id = $1::int ' +
      '  UNION ALL ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  JOIN q ON t.id = q.preceding_task_id ' +
      ') ' +
      'SELECT * FROM q WHERE id <> $1::int ORDER BY "startDate"';
    postgres.select(sql, [req.params.id], req, null).then(
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name relatedFollowingList
 * @description all related following tasks for task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.relatedFollowingList = function (req, res) {
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
      'WITH RECURSIVE q AS ( ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  WHERE ' +
      '    t.id = $1::int ' +
      '  UNION ALL ' +
      '  SELECT ' +
      '    t.id, ' +
      '    t.project_id as "projectId", ' +
      '    t.subject, ' +
      '    t.description, ' +
      '    t.start_date as "startDate", ' +
      '    t.due_date as "dueDate", ' +
      '    t.timezone_name as "timezoneName", ' +
      '    t.finish_date as "finishDate", ' +
      '    t.priority, ' +
      '    t.owner_id as "ownerId", ' +
      '    tp.people_id as "assignedToId", ' +
      '    t.private, ' +
      '    t.company_id as "companyId", ' +
      '    t.person_id as "personId", ' +
      '    t.sales_pipeline_id as "salesPipelineId", ' +
      '    t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '    t.preceding_task_id, ' +
      '    p.subject as "projectName", ' +
      '    sp.subject as "opportunityName", ' +
      '    sps.name as "salesPipelineStageName", ' +
      '    c.company_name as "companyName", ' +
      '    COALESCE(pe.first_name, \'\') || \' \' || COALESCE(pe.last_name, \'\') as "personName", ' +
      '    COALESCE(pea.first_name, \'\') || \' \' || COALESCE(pea.last_name, \'\') as "assigneeName" ' +
      '  FROM ' +
      '    tasks t ' +
      '    LEFT JOIN projects p ON t.project_id = p.id ' +
      '    LEFT JOIN sales_pipeline sp ON t.sales_pipeline_id = sp.id ' +
      '    LEFT JOIN sales_pipeline_stages sps ON sp.stage_id = sps.id ' +
      '    LEFT JOIN companies c ON t.company_id = c.id ' +
      '    LEFT JOIN people pe ON t.person_id = pe.id ' +
      '    LEFT JOIN task_people tp ON t.id = tp.task_id ' +
      '    LEFT JOIN people pea ON tp.people_id = pea.id ' +
      '  JOIN q ON q.id = t.preceding_task_id ' +
      ') ' +
      'SELECT * FROM q WHERE id <> $1::int ORDER BY "startDate"';
    postgres.select(sql, [req.params.id], req, null).then(
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name post
 * @description post task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.post = function (req, res) {
  var sql, sqlSeq, sqlProperties, sqldb, vals, errors, loginToken, ms, reminder, reminderTime, sp, row,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
    message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE;
  loginToken = req.signedCookies.auth_token;

  // validations
  req.assert('subject', 'subject not found.').notEmpty();
  if (req.body.subject) {
    req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
  }
  req.assert('startDate', 'startDate not found.').notEmpty();
  if (req.body.startDate) {
    if (!(new Date(req.body.startDate) instanceof Date)) {
      req.assert('startDate', tools.getValidationMessage('startDate', message_valid_number, null, null)).isNull();
    }
  }
  req.assert('dueDate', 'dueDate not found.').notEmpty();
  if (req.body.dueDate) {
    if (!(new Date(req.body.dueDate) instanceof Date)) {
      req.assert('dueDate', tools.getValidationMessage('dueDate', message_valid_format, null, null)).isNull();
    }
  }
  if ((new Date(req.body.startDate)) > (new Date(req.body.dueDate))) {
    req.assert('startDate', tools.getValidationMessage('date range', message_valid_date_range, null, null)).isNull();
  }
  req.assert('timezoneName', 'timezoneName not found.').notEmpty();
  if (req.body.timezoneName) {
    req.assert('timezoneName', tools.getValidationMessage('timezoneName', message_valid_length, 0, 100)).len(0, 100);
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    tools.setNullForEmpty(req.body);
    sqlSeq = 'SELECT nextval(\'seq_tasks_id\') AS id,people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO tasks(id, project_id, subject, description, start_date, due_date,' +
      '                  timezone_name, finish_date, priority, owner_id, private, company_id,' +
      '                  person_id, sales_pipeline_id, sales_pipeline_stage_id, preceding_task_id, reminder_seconds,' +
      '                  appointment_id, contract_id) ' +
      ' values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};

    // GET TOMEZONE - CONVERT
    timezones.amountForDate(req, res, {date: req.body.startDate, timezoneName: req.body.timezoneName}).then(
      function (result) {
        //console.log('krok 0');
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        req.body.startDate = (new Date(new Date(req.body.startDate).setMilliseconds(ms))).toISOString();
        req.body.dueDate = (new Date(new Date(req.body.dueDate).setMilliseconds(ms))).toISOString();
        if (req.body.finishDate) {
          req.body.finishDate = (new Date(new Date(req.body.finishDate).setMilliseconds(ms))).toISOString();
        }
      }
    ).then(
      function () {
        // save people
        //console.log('krok 1');
        return people.smartInsert(req, res, {person: req.body.person}, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.personId = result.id;
        // save company
        //console.log('krok 2');
        return companies.smartInsert(req, res, {company: req.body.company}, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.companyId = result.id;
        // save sales pipeline
        //console.log('krok 3');
        sp = {
          companyId: req.body.companyId,
          salesPipeline: req.body.salesPipeline,
          stageId: req.body.salesPipelineStageId
        };
        return salesPipeline.smartInsert(req, res, sp, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.salesPipelineId = result.id;
        // save project
        //console.log('krok 4');
        return projects.smartInsert(req, res, {
          startDate: req.body.startDate,
          project: req.body.project
        }, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.projectId = result.id;
        //console.log('krok 5');
        // save task
        return postgres.select(sqlSeq, [loginToken], req).then(
          function (result) {
            row = tools.getSingleResult(result);
            req.body.id = req.body.id || row.id;
            vals = [req.body.id, req.body.projectId, req.body.subject, req.body.description, req.body.startDate, req.body.dueDate,
              req.body.timezoneName, req.body.finishDate, req.body.priority, row.ownerId, req.body.private, req.body.companyId,
              req.body.personId, req.body.salesPipelineId, req.body.salesPipelineStageId, req.body.precedingTaskId, req.body.reminderSeconds,
              req.body.appointmentId, req.body.contractId];
            return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
          }
        );
      }
    ).then(
      function () {
        // save tags
        //console.log('krok 6');
        return tasks.insertTasksTags(req, res, {taskId: req.body.id, taskTags: req.body.taskTags}, sqlProperties);
      }
    ).then(
      function () {
        // save reminder
        //console.log('krok 7');
        if (!(req.body.reminderSeconds && parseInt(req.body.reminderSeconds, 10) > 0)) {
          return null;
        }
        reminderTime = new Date((new Date(req.body.startDate)).setMilliseconds((parseInt(req.body.reminderSeconds, 10) || 0) * 1000 * -1));
        reminder = {
          task_id: req.body.testId || req.body.id,
          recipient_id: req.body.ownerId,
          subject: req.body.subject,
          original_time: req.body.startDate,
          reminder_time: reminderTime,
          tx: sqlProperties.tx,
          client: sqlProperties.client,
          in_app_rem: 1
        };
        return reminders.addReminder(req, res, reminder, sqlProperties);
      }
    ).then(
      function () {
        return taskPeople.delete(req, res, {taskId: req.body.id}, sqlProperties);
      }
    ).then(
      function () {
        return taskPeople.smartInsert(req, res, {
          taskId: req.body.id,
          peopleId: (req.body.assignedToId || row.ownerId),
          startDate: req.body.startDate,
          dueDate: req.body.dueDate
        }, sqlProperties);
      }
    ).then(
      function () {
        // Success, close request
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name put
 * @description put task
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.put = function (req, res) {
  var sql, sqlSeq, sqlProperties, sqldb, vals, errors, loginToken, ms, reminder, reminderTime, sp, row,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
    message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE;
  loginToken = req.signedCookies.auth_token;

  // validations
  req.assert('subject', 'Id not found.').notEmpty();
  if (req.body.subject) {
    req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
  }
  req.assert('startDate', 'startDate not found.').notEmpty();
  if (req.body.startDate) {
    if (!(new Date(req.body.startDate) instanceof Date)) {
      req.assert('startDate', tools.getValidationMessage('startDate', message_valid_number, null, null)).isNull();
    }
  }
  req.assert('dueDate', 'dueDate not found.').notEmpty();
  if (req.body.dueDate) {
    if (!(new Date(req.body.dueDate) instanceof Date)) {
      req.assert('dueDate', tools.getValidationMessage('dueDate', message_valid_format, null, null)).isNull();
    }
  }
  if ((new Date(req.body.startDate)) > (new Date(req.body.dueDate))) {
    req.assert('startDate', tools.getValidationMessage('date range', message_valid_date_range, null, null)).isNull();
  }
  req.assert('timezoneName', 'timezoneName not found.').notEmpty();
  if (req.body.timezoneName) {
    req.assert('timezoneName', tools.getValidationMessage('timezoneName', message_valid_length, 0, 100)).len(0, 100);
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }
  try {
    tools.setNullForEmpty(req.body);
    sqlSeq = 'SELECT people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    sql =
      'UPDATE tasks set ' +
      '  project_id = $2, ' +
      '  subject = $3, ' +
      '  description = $4, ' +
      '  start_date = $5, ' +
      '  due_date = $6, ' +
      '  timezone_name = $7, ' +
      '  finish_date = $8, ' +
      '  priority = $9, ' +
      '  owner_id = $10, ' +
      '  private = $11, ' +
      '  company_id = $12, ' +
      '  person_id = $13, ' +
      '  sales_pipeline_id = $14, ' +
      '  sales_pipeline_stage_id = $15, ' +
      '  preceding_task_id = $16, ' +
      '  reminder_seconds = $17' +
      'WHERE ' +
      '  id = $1';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};

    // GET TOMEZONE - CONVERT
    timezones.amountForDate(req, res, {date: req.body.startDate, timezoneName: req.body.timezoneName}).then(
      function (result) {
        //console.log('krok 0');
        // convert start_time
        ms = parseInt(tools.getSingleResult(result).gmtOffset, 10) * 1000;
        ms = ms * -1; // to timezone 0 we must gmt_offset minus
        req.body.startDate = (new Date(new Date(req.body.startDate).setMilliseconds(ms))).toISOString();
        req.body.dueDate = (new Date(new Date(req.body.dueDate).setMilliseconds(ms))).toISOString();
        if (req.body.finishDate) {
          req.body.finishDate = (new Date(new Date(req.body.finishDate).setMilliseconds(ms))).toISOString();
        }
      }
    ).then(
      function () {
        // save people
        //console.log('krok 1');
        return people.smartInsert(req, res, {person: req.body.person}, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.personId = result.id;
        // save company
        //console.log('krok 2');
        return companies.smartInsert(req, res, {company: req.body.company}, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.companyId = result.id;
        // save sales pipeline
        //console.log('krok 3');
        sp = {
          companyId: req.body.companyId,
          salesPipeline: req.body.salesPipeline,
          stageId: req.body.salesPipelineStageId
        };
        return salesPipeline.smartInsert(req, res, sp, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.salesPipelineId = result.id;
        // save project
        //console.log('krok 4');
        return projects.smartInsert(req, res, {
          startDate: req.body.startDate,
          project: req.body.project
        }, sqlProperties);
      }
    ).then(
      function (result) {
        req.body.projectId = result.id;
        //console.log('krok 5');
        // save task
        return postgres.select(sqlSeq, [loginToken], req).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals = [req.body.id, req.body.projectId, req.body.subject, req.body.description, req.body.startDate, req.body.dueDate,
              req.body.timezoneName, req.body.finishDate, req.body.priority, row.ownerId, req.body.private, req.body.companyId,
              req.body.personId, req.body.salesPipelineId, req.body.salesPipelineStageId, req.body.precedingTaskId, req.body.reminderSeconds];
            return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
          }
        );
      }
    ).then(
      function () {
        // delete tags
        //console.log('krok 6');
        return tasks.deleteTasksTags(req, res, {id: req.body.id}, sqlProperties);
      }
    ).then(
      function () {
        // save tags
        //console.log('krok 7');
        return tasks.insertTasksTags(req, res, {taskId: req.body.id, taskTags: req.body.taskTags}, sqlProperties);
      }
    ).then(
      function () {
        // delete reminder
        // console.log('krok 8');
        return reminders.deleteReminderFor(req, res, {
          id: req.body.id,
          type: constants.REMINDER_BINDING_TYPE_FIELD_FOR_TASK
        }, sqlProperties);
      }
    ).then(
      function () {
        // save reminder
        //console.log('krok 9');
        if (!(req.body.reminderSeconds && parseInt(req.body.reminderSeconds, 10) > 0)) {
          return null;
        }
        reminderTime = new Date((new Date(req.body.startDate)).setMilliseconds((parseInt(req.body.reminderSeconds, 10) || 0) * 1000 * -1));
        reminder = {
          task_id: req.body.testId || req.body.id,
          recipient_id: req.body.ownerId,
          subject: req.body.subject,
          original_time: req.body.startDate,
          reminder_time: reminderTime,
          tx: sqlProperties.tx,
          client: sqlProperties.client,
          in_app_rem: 1
        };
        return reminders.addReminder(req, res, reminder, sqlProperties);
      }
    ).then(
      function () {
        return taskPeople.delete(req, res, {taskId: req.body.id}, sqlProperties);
      }
    ).then(
      function () {
        return taskPeople.smartInsert(req, res, {
          taskId: req.body.id,
          peopleId: (req.body.assignedToId || row.ownerId),
          startDate: req.body.startDate,
          dueDate: req.body.dueDate
        }, sqlProperties);
      }
    ).then(
      function () {
        // Success, close request
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name insertTasksTags
 * @description insert task tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with rows
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.insertTasksTags = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, sql, sqlNewTags, sqlSeq, callbackInsertTag, promiseCount, callbackEmptyEndPromise, sqlExists,
        callbackTagId, sqlExistsAppTag, callbackEmptyEndPromiseError, testId;
      sql = 'INSERT INTO tasks_tasks_tags(tasks_id, tasks_tags_id) VALUES($1, $2)';
      sqlExistsAppTag = 'SELECT 1 AS exist FROM tasks_tasks_tags ttt WHERE tasks_id = $1 AND tasks_tags_id = $2';
      sqlNewTags = 'INSERT INTO tasks_tags(id, name) VALUES($1, $2)';
      sqlSeq = 'SELECT nextval(\'seq_tasks_tags_id\') AS id';
      sqlExists = 'SELECT id FROM tasks_tags tt WHERE name = $1';
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
          return tools.getSingleResult(result).id || postgres.select(sqlSeq, [], req).then(function (result) {
            testId = req.testId ? req.testId[item.id] : null;
            return postgres.executeSQL(req, res, sqlNewTags, [testId || tools.getSingleResult(result).id, item.name], null, conn).then(  // req.testId[item.id] - for tests
              function () {
                return tools.getSingleResult(result).id;
              }
            );
          });
        };
      };
      callbackInsertTag = function (id) {
        postgres.select(sqlExistsAppTag, [obj.taskId, id], req).then(
          function (result) {
            if (tools.getSingleResult(result).exist) {
              callbackEmptyEndPromise();
            } else {
              postgres.executeSQL(req, res, sql, [obj.taskId, id], null, conn).then(callbackEmptyEndPromise, callbackEmptyEndPromiseError);
            }
          },
          callbackEmptyEndPromiseError
        );
      };
      if (!obj.taskId) {
        reject();
      }
      // property for managing loop promise
      promiseCount = obj.taskTags ? obj.taskTags.length : 0;
      // exit
      if (!obj.taskTags || (obj.taskTags && obj.taskTags.length === 0)) {
        resolve();
        return;
      }
      for (i = 0, l = obj.taskTags.length; i < l; i += 1) {
        if (!tools.isNumber(obj.taskTags[i].id)) {
          postgres.select(sqlExists, [obj.taskTags[i].name], req, null)
            .then(callbackTagId(obj.taskTags[i]), callbackEmptyEndPromiseError)
            .then(callbackInsertTag, callbackEmptyEndPromiseError);
        } else {
          // if error then reject
          if (!obj.taskTags[i].id) {
            reject();
          }
          // save tag
          callbackInsertTag(obj.taskTags[i].id);
        }
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name deleteTasksTags
 * @description delete task tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with rows
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.deleteTasksTags = function (req, res, obj, conn) {
  var sql = 'DELETE FROM tasks_tasks_tags WHERE tasks_id = $1::int';
  try {
    return postgres.executeSQL(req, res, sql, [obj.id], null, conn);
  } catch (e) {
    return constants.E500;
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name list
 * @description list of tasks
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
      appointment = req.query.appointmentId,
      offset = (page * amount) - amount,
      loadCount = parseInt(req.query.loadCount, 10),
      searchStr = req.query.searchStr ? req.query.searchStr.toUpperCase() : '',
      sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
      sqlCount,
      loginToken,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      sql;

    loginToken = req.signedCookies.auth_token;

    accessColumnOrder = ['DEADLINE', 'SUBJECT', 'TEAMMEMBER', 'OWNER', 'OWNERSORT'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' SUBJECT ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    // default
    sql =
      'SELECT ' +
      '  t.ID, ' +
      '  t.SUBJECT, ' +
      '  t.DUE_DATE as "deadline", ' +
      '  pe1.FIRST_NAME||\' \'||pe1.LAST_NAME AS "teammember", ' +
      '  pe2.FIRST_NAME||\' \'||pe2.LAST_NAME AS "owner", ' +
      '  pe2.LAST_NAME||\' \'||pe2.FIRST_NAME AS "ownersort" ' +
      'FROM ' +
      '  users_login u, ' +
      '  TASKS t ' +
      '    LEFT JOIN PEOPLE pe1 ON t.PERSON_ID = pe1.ID ' +
      '    LEFT JOIN PEOPLE pe2 ON t.OWNER_ID = pe2.ID ' +
      'WHERE ' +
      '  (UPPER(t.SUBJECT) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      '  AND u.login_token = $4::varchar ' +
      '  AND ((t.owner_id = u.people_id AND $5::integer > -1) OR ($5::integer = -1)) ' +
      '  AND ( ' +
      '    (($5::integer = 0 AND t.due_date::date < current_date AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 1 AND t.due_date::date = current_date AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 2 AND t.due_date::date = (current_date + 1) AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 3 AND t.due_date::date > (current_date + 1) AND t.finish_date is null) OR $5::integer = -1) ' +
      '  ) ' +
      '  AND (t.appointment_id = $6::integer OR $6::integer IS NULL) ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  users_login u, ' +
      '  TASKS t ' +
      '    LEFT JOIN PEOPLE pe1 ON t.PERSON_ID = pe1.ID ' +
      '    LEFT JOIN PEOPLE pe2 ON t.OWNER_ID = pe2.ID ' +
      'WHERE ' +
      '  (UPPER(t.SUBJECT) LIKE \'%\' || $1::varchar || \'%\' ' +
      '   OR ' +
      '  $1::varchar IS NULL) ' +
      '  AND u.login_token = $2::varchar ' +
      '  AND ((t.owner_id = u.people_id AND $3::integer > -1) OR ($3::integer = -1)) ' +
      '  AND ( ' +
      '    (($3::integer = 0 AND t.due_date::date < current_date AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 1 AND t.due_date::date = current_date AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 2 AND t.due_date::date = (current_date + 1) AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 3 AND t.due_date::date > (current_date + 1) AND t.finish_date is null) OR $3::integer = -1) ' +
      '  ) ' +
      '  AND (t.appointment_id = $4::integer OR $4::integer IS NULL)';
    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr, loginToken, type, appointment], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr, loginToken, type, appointment], req).then(
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
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name userCount
 * @description tasks for user - count
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.userCount = function (req, res) {
  var sql, loginToken, obj;
  try {
    loginToken = req.signedCookies.auth_token;
    sql =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  tasks t, ' +
      '  users_login u ' +
      'WHERE ' +
      '  t.owner_id = u.people_id ' +
      '  and u.login_token = $1 ' +
      '  and t.finish_date is null';

    postgres.select(sql, [loginToken], req).then(
      function (result) {
        obj = constants.OK;
        obj.count = parseInt(tools.getSingleResult(result).count, 10);
        tools.sendResponseSuccess(obj, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name userListOld
 * @description tasks for user - old
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.userListOld = function (req, res) {
  var sql, sqlCount, loginToken, obj = {};
  try {
    loginToken = req.signedCookies.auth_token;

    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.project_id as "projectId", ' +
      '  t.subject, ' +
      '  t.description, ' +
      '  t.start_date as "startDate", ' +
      '  t.due_date as "dueDate", ' +
      '  t.timezone_name as "timezoneName", ' +
      '  t.finish_date as "finishDate", ' +
      '  t.priority, ' +
      '  t.owner_id as "ownerId", ' +
      '  t.private, ' +
      '  t.company_id as "companyId", ' +
      '  t.person_id as "personId", ' +
      '  t.sales_pipeline_id as "salesPipelineId", ' +
      '  t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '  t.preceding_task_id as "precedingTaskId", ' +
      '  t.reminder_seconds as "reminderSeconds" ' +
      'FROM ' +
      '  tasks t, ' +
      '  users_login u ' +
      'WHERE ' +
      '  t.owner_id = u.people_id ' +
      '  and u.login_token = $1 ' +
      '  and t.due_date::date < current_date ' +
      '  and t.finish_date is null ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    // add sort, limit
    sql =
      sql +
      'ORDER BY t.due_date ' +
      'LIMIT $2';

    postgres.select(sql, [loginToken, req.params.limit], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [loginToken], req);
      }
    ).then(
      function (result) {
        obj.count = parseInt(tools.getSingleResult(result).count, 10);
        tools.sendResponseSuccess(obj, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name userListToday
 * @description tasks for user - today
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.userListToday = function (req, res) {
  var sql, sqlCount, loginToken, obj = {};
  try {
    loginToken = req.signedCookies.auth_token;

    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.project_id as "projectId", ' +
      '  t.subject, ' +
      '  t.description, ' +
      '  t.start_date as "startDate", ' +
      '  t.due_date as "dueDate", ' +
      '  t.timezone_name as "timezoneName", ' +
      '  t.finish_date as "finishDate", ' +
      '  t.priority, ' +
      '  t.owner_id as "ownerId", ' +
      '  t.private, ' +
      '  t.company_id as "companyId", ' +
      '  t.person_id as "personId", ' +
      '  t.sales_pipeline_id as "salesPipelineId", ' +
      '  t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '  t.preceding_task_id as "precedingTaskId", ' +
      '  t.reminder_seconds as "reminderSeconds" ' +
      'FROM ' +
      '  tasks t, ' +
      '  users_login u ' +
      'WHERE ' +
      '  t.owner_id = u.people_id ' +
      '  and u.login_token = $1 ' +
      '  and t.due_date::date = current_date ' +
      '  and t.finish_date is null ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    // add sort, limit
    sql =
      sql +
      'LIMIT $2';

    postgres.select(sql, [loginToken, req.params.limit], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [loginToken], req);
      }
    ).then(
      function (result) {
        obj.count = parseInt(tools.getSingleResult(result).count, 10);
        tools.sendResponseSuccess(obj, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name userListTomorrow
 * @description tasks for user - tomorrow
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.userListTomorrow = function (req, res) {
  var sql, sqlCount, loginToken, obj = {};
  try {
    loginToken = req.signedCookies.auth_token;

    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.project_id as "projectId", ' +
      '  t.subject, ' +
      '  t.description, ' +
      '  t.start_date as "startDate", ' +
      '  t.due_date as "dueDate", ' +
      '  t.timezone_name as "timezoneName", ' +
      '  t.finish_date as "finishDate", ' +
      '  t.priority, ' +
      '  t.owner_id as "ownerId", ' +
      '  t.private, ' +
      '  t.company_id as "companyId", ' +
      '  t.person_id as "personId", ' +
      '  t.sales_pipeline_id as "salesPipelineId", ' +
      '  t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '  t.preceding_task_id as "precedingTaskId", ' +
      '  t.reminder_seconds as "reminderSeconds" ' +
      'FROM ' +
      '  tasks t, ' +
      '  users_login u ' +
      'WHERE ' +
      '  t.owner_id = u.people_id ' +
      '  and u.login_token = $1 ' +
      '  and t.due_date::date = (current_date + 1) ' +
      '  and t.finish_date is null ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    // add sort, limit
    sql =
      sql +
      'ORDER BY t.due_date ' +
      'LIMIT $2';

    postgres.select(sql, [loginToken, req.params.limit], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [loginToken], req);
      }
    ).then(
      function (result) {
        obj.count = parseInt(tools.getSingleResult(result).count, 10);
        tools.sendResponseSuccess(obj, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name userListNew
 * @description tasks for user - new
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.userListNew = function (req, res) {
  var sql, sqlCount, loginToken, obj = {};
  try {
    loginToken = req.signedCookies.auth_token;

    sql =
      'SELECT ' +
      '  t.id, ' +
      '  t.project_id as "projectId", ' +
      '  t.subject, ' +
      '  t.description, ' +
      '  t.start_date as "startDate", ' +
      '  t.due_date as "dueDate", ' +
      '  t.timezone_name as "timezoneName", ' +
      '  t.finish_date as "finishDate", ' +
      '  t.priority, ' +
      '  t.owner_id as "ownerId", ' +
      '  t.private, ' +
      '  t.company_id as "companyId", ' +
      '  t.person_id as "personId", ' +
      '  t.sales_pipeline_id as "salesPipelineId", ' +
      '  t.sales_pipeline_stage_id as "salesPipelineStageId", ' +
      '  t.preceding_task_id as "precedingTaskId", ' +
      '  t.reminder_seconds as "reminderSeconds" ' +
      'FROM ' +
      '  tasks t, ' +
      '  users_login u ' +
      'WHERE ' +
      '  t.owner_id = u.people_id ' +
      '  and u.login_token = $1 ' +
      '  and t.due_date::date > (current_date + 1) ' +
      '  and t.finish_date is null ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    // add sort, limit
    sql =
      sql +
      'ORDER BY t.due_date ' +
      'LIMIT $2';

    postgres.select(sql, [loginToken, req.params.limit], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [loginToken], req);
      }
    ).then(
      function (result) {
        obj.count = parseInt(tools.getSingleResult(result).count, 10);
        tools.sendResponseSuccess(obj, res, false);
      },
      function () {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Tasks
 * @method
 * @name listForAppointment
 * @description list of tasks for appointment
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listForAppointment = function (req, res) {
  try {
    var obj = {rows: [], count: req.query.count},
      page = req.query.page || 1,
      amount = req.query.amount || 10,
      type = req.query.type || -1,
      appointment = req.params.id,
      offset = (page * amount) - amount,
      loadCount = parseInt(req.query.loadCount, 10),
      searchStr = req.query.searchStr ? req.query.searchStr.toUpperCase() : '',
      sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
      sqlCount,
      loginToken,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      sql;

    loginToken = req.signedCookies.auth_token;

    accessColumnOrder = ['DEADLINE', 'SUBJECT', 'TEAMMEMBER', 'OWNER', 'OWNERSORT'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' SUBJECT ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    // default
    sql =
      'SELECT ' +
      '  t.ID, ' +
      '  t.SUBJECT, ' +
      '  t.DUE_DATE as "deadline", ' +
      '  pe1.FIRST_NAME||\' \'||pe1.LAST_NAME AS "teammember", ' +
      '  pe2.FIRST_NAME||\' \'||pe2.LAST_NAME AS "owner", ' +
      '  pe2.LAST_NAME||\' \'||pe2.FIRST_NAME AS "ownersort" ' +
      'FROM ' +
      '  users_login u, ' +
      '  TASKS t ' +
      '    LEFT JOIN PEOPLE pe1 ON t.PERSON_ID = pe1.ID ' +
      '    LEFT JOIN PEOPLE pe2 ON t.OWNER_ID = pe2.ID ' +
      'WHERE ' +
      '  (UPPER(t.SUBJECT) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      '  AND u.login_token = $4::varchar ' +
      '  AND ((t.owner_id = u.people_id AND $5::integer > -1) OR ($5::integer = -1)) ' +
      '  AND ( ' +
      '    (($5::integer = 0 AND t.due_date::date < current_date AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 1 AND t.due_date::date = current_date AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 2 AND t.due_date::date = (current_date + 1) AND t.finish_date is null) OR $5::integer = -1) ' +
      '    OR (($5::integer = 3 AND t.due_date::date > (current_date + 1) AND t.finish_date is null) OR $5::integer = -1) ' +
      '  ) ' +
      '  AND (t.appointment_id = $6::integer) ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  users_login u, ' +
      '  TASKS t ' +
      '    LEFT JOIN PEOPLE pe1 ON t.PERSON_ID = pe1.ID ' +
      '    LEFT JOIN PEOPLE pe2 ON t.OWNER_ID = pe2.ID ' +
      'WHERE ' +
      '  (UPPER(t.SUBJECT) LIKE \'%\' || $1::varchar || \'%\' ' +
      '   OR ' +
      '  $1::varchar IS NULL) ' +
      '  AND u.login_token = $2::varchar ' +
      '  AND ((t.owner_id = u.people_id AND $3::integer > -1) OR ($3::integer = -1)) ' +
      '  AND ( ' +
      '    (($3::integer = 0 AND t.due_date::date < current_date AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 1 AND t.due_date::date = current_date AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 2 AND t.due_date::date = (current_date + 1) AND t.finish_date is null) OR $3::integer = -1) ' +
      '    OR (($3::integer = 3 AND t.due_date::date > (current_date + 1) AND t.finish_date is null) OR $3::integer = -1) ' +
      '  ) ' +
      '  AND t.appointment_id = $4::integer';
    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr, loginToken, type, appointment], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr, loginToken, type, appointment], req).then(
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
