/*jslint node: true, unparam: true */
'use strict';

/**
 * @file projects
 * @fileOverview __Server_REST_API_Projects
 */

/**
 * @namespace __Server_REST_API_Projects
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise'),
  projects = require('./projects');

/**
 * @memberof __Server_REST_API_Projects
 * @method
 * @name search
 * @description search all projects
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.search = function (req, res) {
  var sql1, sql2, sql3, sql4, sql5, sql6, sql,
    limit = req.query.limit || 10,
    offset = req.query.offset || 0;

// STRING LEFT SIDE, ACCENTS, CASE SENSITIVE
  sql1 =
    'SELECT ' +
    '  id, subject as name, 1 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  subject LIKE $1::varchar || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER, ACCENTS, CASE SENSITIVE
  sql2 =
    'SELECT ' +
    '  id, subject as name, 2 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  subject LIKE \'%\' || $1::varchar || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // LEFT SIDE WITHOUT ACCENTS, CASE INSENSITIVE
  sql3 =
    'SELECT ' +
    '  id, subject as name, 3 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(subject), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER, WITHOUT ACCENTS, CASE INSENSITIVE
  sql4 =
    'SELECT ' +
    '  id, subject as name, 4 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(subject), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING LEFT SIDE WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
  sql5 =
    'SELECT ' +
    '  id, subject as name, 5 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(REPLACE(subject, \' \', \'\')), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
  sql6 =
    'SELECT ' +
    '  id, subject as name, 6 AS type ' +
    'FROM ' +
    '  projects p ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(REPLACE(subject, \' \', \'\')), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  sql =
    'SELECT ' +
    '  ID, NAME, MIN(TYPE) AS TYPE ' +
    'FROM ' +
    '  ( ' +
    '     (' + sql1 + ')' +
    '   UNION ' +
    '     (' + sql2 + ')' +
    '   UNION ' +
    '     (' + sql3 + ')' +
    '   UNION ' +
    '     (' + sql4 + ')' +
    '   UNION ' +
    '     (' + sql5 + ')' +
    '   UNION ' +
    '     (' + sql6 + ')' +
    '  ) S1 ' +
    'GROUP BY ' +
    '  ID, NAME ' +
    'ORDER BY ' +
    '  TYPE, ID ' +
    'LIMIT $3::int ' +
    'OFFSET $2::int ';

  try {
    return postgres.select(sql, [req.params.search, parseInt(offset, 10), parseInt(limit, 10)], req).then(
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name smartInsert
 * @description insert company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.smartInsert = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    try {
      var sql, sqlSeq, loginToken, row;
      loginToken = req.signedCookies.auth_token;

      sql = 'INSERT INTO projects(id, subject, start_date, owner_id) VALUES($1, $2, $3, $4)';
      sqlSeq = 'SELECT nextval(\'seq_projects_id\') AS id, people_id as "ownerId" FROM users_login WHERE login_token = $1';
      obj.project = obj.project || [];
      if (!obj.project[0] || (obj.project[0] && tools.isNumber(obj.project[0].id))) {
        resolve({id: (obj.project[0] ? obj.project[0].id : null)});
        return;
      }
      postgres.select(sqlSeq, [loginToken], req).then(
        function (result) {
          row = tools.getSingleResult(result);
          postgres.executeSQL(req, res, sql, [req.body.testId || row.id, obj.project[0].name, obj.project[0].startDate, row.ownerId], null, conn).then(
            function () {
              resolve({id: row.id});
            }
          );
        },
        function () {
          reject(constants.E500);
        }
      );
    } catch (e) {
      reject(constants.E500);
    }
  });
};

/**
 * @memberof __Server_REST_API_Projects
 * @method
 * @name list
 * @description list of projects
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
      sortField = req.query.sortField,
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection;

    accessColumnOrder = ['subject', 'startDate', 'endDate', 'companyName', 'ownerName'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : 'subject';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' "' + sqlOrderByField + '" ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      'p.id, ' +
      'p.subject, ' +
      'p.start_date as "startDate", ' +
      'p.end_date as "endDate", ' +
      'c.company_name as "companyName", ' +
      'pe.first_name||\' \'||pe.last_name as "ownerName" ' +
      'FROM ' +
      '  PROJECTS p ' +
      '    LEFT JOIN COMPANIES c ON p.COMPANY_ID = c.ID ' +
      '    LEFT JOIN PEOPLE pe ON p.OWNER_ID = pe.ID ' +
      'WHERE ' +
      '  UPPER(p.SUBJECT) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  PROJECTS p ' +
      'WHERE ' +
      '   UPPER(p.SUBJECT) LIKE \'%\' || $1::varchar || \'%\' ' +
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name delete
 * @description delete from PROJECTS
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  var errors, sql = 'DELETE FROM PROJECTS WHERE ID = $1',
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
    postgres.executeSQL(req, res, sql, [req.params.id]).then(
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name get
 * @description get project from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  var sql, errors, obj;
  req.assert('id', 'ID row not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      'p.id, ' +
      'p.description, ' +
      'p.company_id as "companyId", ' +
      'p.owner_id as "ownerId", ' +
      'p.person_id as "personId", ' +
      'p.subject, ' +
      'p.start_date as "startDate", ' +
      'p.end_date as "endDate", ' +
      'c.company_name as "companyName", ' +
      'pe.first_name||\' \'||pe.last_name as "ownerName" ' +
      'FROM ' +
      '  PROJECTS p ' +
      '    LEFT JOIN COMPANIES c ON p.COMPANY_ID = c.ID ' +
      '    LEFT JOIN PEOPLE pe ON p.OWNER_ID = pe.ID ' +
      'WHERE p.ID = $1::integer ';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        obj = tools.getSingleResult(result);
        if (obj.companyId) {
          obj.company = [{id: obj.companyId, name: obj.companyName}];
        } else {
          obj.company = [];
        }
        tools.sendResponseSuccess(obj, res, false);
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name post
 * @description post project to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  try {
    var sql, sqlSeq, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE,
      loginToken = req.signedCookies.auth_token;

    req.assert('subject', 'subject not found.').notEmpty();
    if (req.body.subject) {
      req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.description) {
      req.assert('description', tools.getValidationMessage('description', message_valid_length, 0, 255)).len(0, 255);
    }
    if (req.body.companyId) {
      req.assert('companyId', tools.getValidationMessage('companyId', message_valid_number, 0, 100)).isInt();
    }
    if (req.body.startDate && !tools.validateIsoDate(req.body.startDate)) {
      req.assert('startDate', tools.getValidationMessage('startDate', message_valid_format)).isNull();
    }
    if (req.body.endDate && !tools.validateIsoDate(req.body.endDate)) {
      req.assert('endDate', tools.getValidationMessage('endDate', message_valid_format)).isNull();
    }
    if (req.body.startDate && req.body.endDate && new Date(req.body.endDate) < new Date(req.body.startDate)) {
      req.assert('startDate', tools.getValidationMessage('startDate and endDate', message_valid_date_range, null, null)).isNull();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sqlSeq = 'SELECT nextval(\'seq_projects_id\') AS id,people_id as owner_id FROM users_login ul WHERE login_token = $1';
    sql =
      'INSERT INTO PROJECTS (ID, SUBJECT, DESCRIPTION, OWNER_ID, COMPANY_ID, START_DATE, END_DATE) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)';

    sqldb = postgres.createTransaction(req);

    vals = [null, req.body.subject, req.body.description, null, req.body.companyId, req.body.startDate, req.body.endDate];

    postgres.select(sqlSeq, [loginToken], req).then(
      function (result) {
        vals[0] = tools.getSingleResult(result).id;
        req.body.id = vals[0];
        vals[3] = tools.getSingleResult(result).owner_id;
        return postgres.executeSQL(req, res, sql, vals, null, sqldb);
      }
    ).then(
      function () {
        return projects.saveCompany(req, res, sqldb);
      }
    ).then(
      function () {
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Projects
 * @method
 * @name put
 * @description put project to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  try {
    var sql, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER,
      message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
      message_valid_date_range = constants.MESSAGE_VALIDATION_DATE_RANGE;

    req.assert('id', 'ID not found.').notEmpty();
    req.assert('id', 'ID must be integer').isInt();
    req.assert('subject', 'SUBJECT not found.').notEmpty();
    if (req.body.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, 0, 100)).isInt();
    }
    if (req.body.subject) {
      req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.description) {
      req.assert('description', tools.getValidationMessage('description', message_valid_length, 0, 255)).len(0, 255);
    }
    if (req.body.companyId) {
      req.assert('companyId', tools.getValidationMessage('companyId', message_valid_number, 0, 100)).isInt();
    }
    if (req.body.startDate && !tools.validateIsoDate(req.body.startDate)) {
      req.assert('startDate', tools.getValidationMessage('startDate', message_valid_format)).isNull();
    }
    if (req.body.endDate && !tools.validateIsoDate(req.body.endDate)) {
      req.assert('endDate', tools.getValidationMessage('endDate', message_valid_format)).isNull();
    }
    if (req.body.startDate && req.body.endDate && new Date(req.body.endDate) < new Date(req.body.startDate)) {
      req.assert('startDate', tools.getValidationMessage('startDate and endDate', message_valid_date_range, null, null)).isNull();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }
    sql =
      'UPDATE PROJECTS SET ' +
      '  SUBJECT = $2, ' +
      '  COMPANY_ID = $3, ' +
      '  DESCRIPTION = $4, ' +
      '  START_DATE = $5, ' +
      '  END_DATE = $6 ' +
      'WHERE ' +
      '  ID = $1';

    sqldb = postgres.createTransaction(req);

    vals = [req.body.id, req.body.subject, req.body.companyId, req.body.description, req.body.startDate, req.body.endDate];

    postgres.executeSQL(req, res, sql, vals, null, sqldb).then(
      function () {
        return projects.saveCompany(req, res, sqldb);
      }
    ).then(
      function () {
        sqldb.tx.commit();
        sqldb.client.end();
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    );

  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Projects
 * @method
 * @name saveCompany
 * @description save company for Project
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveCompany = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var sqlNewCompany, sqlSeq, sqlUpdateProject, loginToken;
      loginToken = req.signedCookies.auth_token;
      sqlNewCompany = 'INSERT INTO companies(id, company_name, owner_id) VALUES($1, $2, $3)';
      sqlSeq = 'SELECT nextval(\'seq_companies_id\') AS id, ' +
        '  (SELECT people_id FROM users_login ul WHERE login_token = $1) as "ownerId" ';
      sqlUpdateProject = 'UPDATE projects SET company_id = $2 WHERE id = $1';

      if (req.body.company && req.body.company[0] && !tools.isNumber(req.body.company[0].id)) {
        postgres.select(sqlSeq, [loginToken], req).then(
          function (result) {
            req.body.companyId = tools.getSingleResult(result).id;
            return postgres.executeSQL(req, res, sqlNewCompany, [req.body.companyId, req.body.company[0].name, tools.getSingleResult(result).ownerId], null, obj).then(
              function () {
                return req.body.companyId;
              }
            );
          }
        ).then(
          function () {
            return postgres.executeSQL(req, res, sqlUpdateProject, [req.body.id, req.body.companyId], null, obj);
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
          req.body.companyId = req.body.company[0].id;
        } else {
          req.body.companyId = null;
        }
        postgres.executeSQL(req, res, sqlUpdateProject, [req.body.id, req.body.companyId], null, obj).then(
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name history
 * @description history of project
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.history = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;
  req.checkParams('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
  }

  try {
    sql = 'SELECT * FROM logging l WHERE table_name = \'PROJECTS\' AND pk = $1 ORDER BY date_event desc';
    postgres.select(sql, [req.params.id], req).then(
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
 * @memberof __Server_REST_API_Projects
 * @method
 * @name searchGlobal
 * @description search projects global
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.searchGlobal = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  p.id,p.subject as name ' +
      'FROM ' +
      '  projects p ' +
      'WHERE ' +
      '  upper(p.subject) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      'ORDER BY ' +
      '  p.subject ' +
      'LIMIT 100';

    if (req.params.str.length < 2) {
      res.send(constants.E500);
      return;
    }

    postgres.select(sql, [decodeURIComponent(req.params.str)], req).then(
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
