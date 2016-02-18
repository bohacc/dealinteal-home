/*jslint node: true, unparam: true */
'use strict';

/**
 * @file people
 * @fileOverview __Server_REST_API_People
 */

/**
 * @namespace __Server_REST_API_People
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  people_companies = require('./people_companies'),
  fs = require('fs'),
  attachments = require('./attachments'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_People
 * @method
 * @name list
 * @description list of people
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

    accessColumnOrder = ['COMPANY_NAME', 'LAST_NAME'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' LAST_NAME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  p.ID, p.FIRST_NAME, p.LAST_NAME, c.COMPANY_NAME, po.NAME AS POSITION, r.NAME AS ROLE ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  (UPPER(c.COMPANY_NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      '  AND ( ($4::integer = 0 ' +
      '   and (to_char(p.anniversary, \'MM-DD\') >= to_char(current_date, \'MM-DD\') ' +
      '        and to_char(p.anniversary, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\'))' +
      '    or (to_char(p.birthday, \'MM-DD\') >= to_char(current_date, \'MM-DD\') ' +
      '        and to_char(p.birthday, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\'))' +
      '   ) OR $4::integer = -1' +
      '  ) ' +
      ' ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  (UPPER(c.COMPANY_NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   $1::varchar IS NULL) ' +
      '  AND ( ($2::integer = 0 ' +
      '   and (to_char(p.anniversary, \'MM-DD\') >= to_char(current_date, \'MM-DD\') ' +
      '        and to_char(p.anniversary, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\'))' +
      '    or (to_char(p.birthday, \'MM-DD\') >= to_char(current_date, \'MM-DD\') ' +
      '        and to_char(p.birthday, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\'))' +
      '  ) OR $2::integer = -1' +
      '  ) ';

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
 * @memberof __Server_REST_API_People
 * @method
 * @name listSearch
 * @description list of people for search
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listSearch = function (req, res) {
  try {
    var limit = req.query.limit || 10,
      offset = req.query.offset || 0,
      searchStr = req.query.searchStr || req.params.search,
      sql,
      sql1,
      sql2,
      sql3,
      sql4,
      sql5,
      sql6;

    // STRING LEFT SIDE, ACCENTS, CASE SENSITIVE
    sql1 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  1 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  p.LAST_NAME||\' \'||p.FIRST_NAME LIKE $1::varchar || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER, ACCENTS, CASE SENSITIVE
    sql2 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  2 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  p.LAST_NAME||\' \'||p.FIRST_NAME LIKE \'%\' || $1::varchar || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    // LEFT SIDE WITHOUT ACCENTS, CASE INSENSITIVE
    sql3 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  3 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  to_ascii(convert_to(UPPER(p.LAST_NAME||\' \'||p.FIRST_NAME), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER, WITHOUT ACCENTS, CASE INSENSITIVE
    sql4 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  4 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  to_ascii(convert_to(UPPER(p.LAST_NAME||\' \'||p.FIRST_NAME), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    // STRING LEFT SIDE WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
    sql5 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  5 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  to_ascii(convert_to(UPPER(REPLACE(p.LAST_NAME||p.FIRST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
    sql6 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  p.email, ' +
      '  p.email2, ' +
      '  6 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  to_ascii(convert_to(UPPER(REPLACE(p.LAST_NAME||p.FIRST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      'ORDER BY ' +
      '  ID ';

    sql =
      'SELECT ' +
      '  ID, NAME, NAME2, MIN(TYPE) AS TYPE, EMAIL, EMAIL2 ' +
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
      '  ID, NAME, NAME2, EMAIL, EMAIL2 ' +
      'ORDER BY ' +
      '  TYPE, ID ' +
      'LIMIT $3::int ' +
      'OFFSET $2::int ';

    postgres.select(sql, [searchStr, parseInt(offset, 10), parseInt(limit, 10)], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name listWithoutTeam
 * @description list of people without team members
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listWithoutTeam = function (req, res) {
  try {
    var limit = req.query.limit || 10,
      offset = req.query.offset || 0,
      searchStr = req.query.searchStr || req.params.search,
      sql,
      sql1,
      sql2,
      sql3,
      sql4,
      sql5,
      sql6;

    // STRING LEFT SIDE, ACCENTS, CASE SENSITIVE
    sql1 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  1 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (p.LAST_NAME||\' \'||p.FIRST_NAME LIKE $1::varchar || \'%\' ' +
      '     OR ' +
      '   p.FIRST_NAME||\' \'||p.LAST_NAME LIKE $1::varchar || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER, ACCENTS, CASE SENSITIVE
    sql2 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  2 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (p.LAST_NAME||\' \'||p.FIRST_NAME LIKE \'%\' || $1::varchar || \'%\' ' +
      '     OR ' +
      '   p.FIRST_NAME||\' \'||p.LAST_NAME LIKE \'%\' || $1::varchar || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    // LEFT SIDE WITHOUT ACCENTS, CASE INSENSITIVE
    sql3 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  3 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (to_ascii(convert_to(UPPER(p.LAST_NAME||\' \'||p.FIRST_NAME), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      '     OR ' +
      '   to_ascii(convert_to(UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER, WITHOUT ACCENTS, CASE INSENSITIVE
    sql4 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  4 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (to_ascii(convert_to(UPPER(p.LAST_NAME||\' \'||p.FIRST_NAME), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      '     OR ' +
      '   to_ascii(convert_to(UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    // STRING LEFT SIDE WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
    sql5 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  5 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (to_ascii(convert_to(UPPER(REPLACE(p.LAST_NAME||p.FIRST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      '     OR ' +
      '   to_ascii(convert_to(UPPER(REPLACE(p.FIRST_NAME||p.LAST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    // STRING INNER WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
    sql6 =
      'SELECT ' +
      '  p.ID, ' +
      '  p.last_name||\' \'||p.first_name As name2, ' +
      '  p.first_name||\' \'||p.last_name||CASE WHEN c.company_name IS NULL THEN \'\' ELSE \', \' || c.company_name END as name, ' +
      '  6 AS type ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  NOT EXISTS (SELECT 1 FROM users_login u WHERE u.people_id = p.id) AND ' +
      '  (to_ascii(convert_to(UPPER(REPLACE(p.LAST_NAME||p.FIRST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
      '     OR ' +
      '   to_ascii(convert_to(UPPER(REPLACE(p.FIRST_NAME||p.LAST_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\') ' +
      'ORDER BY ' +
      '  ID ';

    sql =
      'SELECT ' +
      '  ID, NAME, NAME2, MIN(TYPE) AS TYPE ' +
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
      '  ID, NAME, NAME2 ' +
      'ORDER BY ' +
      '  TYPE, ID ' +
      'LIMIT $3::int ' +
      'OFFSET $2::int ';

    postgres.select(sql, [searchStr, parseInt(offset, 10), parseInt(limit, 10)], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name searchStr
 * @description search in people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.searchStr = function (req, res, next) {
  var sql = 'SELECT id,first_name||\' \'||last_name AS name FROM people p WHERE UPPER(first_name||\' \'||last_name) LIKE $1::varchar LIMIT 10';
  try {
    postgres.select(sql, ['%' + req.params.str.toUpperCase() + '%'], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name get
 * @description get people from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  var sql, errors;
  req.assert('id', 'ID row not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      ' p.*, pc.*,c.COMPANY_NAME, po.NAME AS POSITION, r.NAME AS ROLE, ' +
      ' CASE WHEN u.people_id IS NULL THEN 0 ELSE 1 END AS is_team_member, ' +
      ' (SELECT MAX(attachment_id) FROM attachments_tables at WHERE table_id=$1::integer AND table_name=\'' + constants.ATTACHMENTS_TYPES.PEOPLE + '\') AS "pictureId" ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON c.ID = pc.COMPANIES_ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      '    LEFT JOIN USERS_LOGIN u ON p.id = u.people_id ' +
      'WHERE p.ID = $1::integer ';

    postgres.select(sql, [req.params.id], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name put
 * @description people put to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  var sql, vals, errors,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT;

  req.assert('id', 'Není zadáno ID kontaktu.').notEmpty();
  req.assert('id', 'ID must be integer').isInt();
  req.assert('first_name', 'Jméno musí být vyplněno.').notEmpty();
  req.assert('last_name', 'Příjmení musí být vyplněno.').notEmpty();
  req.assert('title', tools.getValidationMessage('title', message_valid_length, 0, 100)).len(0, 100);
  req.assert('first_name', tools.getValidationMessage('first_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('middle_name', tools.getValidationMessage('middle_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('last_name', tools.getValidationMessage('last_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('suffix', tools.getValidationMessage('suffix', message_valid_length, 0, 40)).len(0, 40);
  req.assert('nickname', tools.getValidationMessage('nickname', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email) && req.body.email) {
    req.assert('email', tools.getValidationMessage('email', message_valid_format)).isNull();
  }
  req.assert('email', tools.getValidationMessage('email', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.mobile_phone) && req.body.mobile_phone) {
    req.assert('mobile_phone', tools.getValidationMessage('mobile_phone', message_valid_format)).isNull();
  }
  req.assert('mobile_phone', tools.getValidationMessage('mobile_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.business_phone) && req.body.business_phone) {
    req.assert('business_phone', tools.getValidationMessage('business_phone', message_valid_format)).isNull();
  }
  req.assert('business_phone', tools.getValidationMessage('business_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.home_phone) && req.body.home_phone) {
    req.assert('home_phone', tools.getValidationMessage('home_phone', message_valid_format)).isNull();
  }
  req.assert('home_phone', tools.getValidationMessage('home_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.assistant_phone) && req.body.assistant_phone) {
    req.assert('assistant_phone', tools.getValidationMessage('assistant_phone', message_valid_format)).isNull();
  }
  req.assert('assistant_phone', tools.getValidationMessage('assistant_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.other_phone) && req.body.other_phone) {
    req.assert('other_phone', tools.getValidationMessage('other_phone', message_valid_format)).isNull();
  }
  req.assert('other_phone', tools.getValidationMessage('other_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax) && req.body.fax) {
    req.assert('fax', tools.getValidationMessage('fax', message_valid_format)).isNull();
  }
  req.assert('fax', tools.getValidationMessage('fax', message_valid_length, 0, 100)).len(0, 100);
  req.assert('gender', tools.getValidationMessage('gender', message_valid_length, 0, 10)).len(0, 10);
  if (req.body.birthday && !tools.validateIsoDate(req.body.birthday)) {
    req.assert('birthday', tools.getValidationMessage('birthday', message_valid_format)).isNull();
  }
  if (req.body.anniversary && !tools.validateIsoDate(req.body.anniversary)) {
    req.assert('anniversary', tools.getValidationMessage('anniversary', message_valid_format)).isNull();
  }
  if (req.body.work_since && !tools.validateIsoDate(req.body.work_since)) {
    req.assert('work_since', tools.getValidationMessage('work_since', message_valid_format)).isNull();
  }
  req.assert('anniversary_name', tools.getValidationMessage('anniversary_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('spouse', tools.getValidationMessage('spouse', message_valid_length, 0, 100)).len(0, 100);
  req.assert('children', tools.getValidationMessage('children', message_valid_length, 0, 100)).len(0, 100);
  req.assert('hobbies', tools.getValidationMessage('hobbies', message_valid_length, 0, 100)).len(0, 100);
  req.assert('manager_name', tools.getValidationMessage('manager_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('assistant_name', tools.getValidationMessage('assistant_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('skype', tools.getValidationMessage('skype', message_valid_length, 0, 100)).len(0, 100);
  req.assert('other_im', tools.getValidationMessage('other_im', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter', tools.getValidationMessage('twitter', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook', tools.getValidationMessage('facebook', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email2) && req.body.email2) {
    req.assert('email2', tools.getValidationMessage('email2', message_valid_format)).isNull();
  }
  req.assert('email2', tools.getValidationMessage('email2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_plus', tools.getValidationMessage('google_plus', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_street', tools.getValidationMessage('home_addr_street', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_city', tools.getValidationMessage('home_addr_city', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_region', tools.getValidationMessage('home_addr_region', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.home_addr_zip) && req.body.home_addr_zip) {
    req.assert('home_addr_zip', tools.getValidationMessage('home_addr_zip', message_valid_format)).isNull();
  }
  req.assert('home_addr_zip', tools.getValidationMessage('home_addr_zip', message_valid_length, 0, 20)).len(0, 20);
  req.assert('home_addr_country', tools.getValidationMessage('home_addr_country', message_valid_length, 0, 100)).len(0, 100);
  req.assert('linkedin', tools.getValidationMessage('linkedin', message_valid_length, 0, 100)).len(0, 100);

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }
  tools.setNullForEmpty(req.body);
  sql =
    'UPDATE PEOPLE SET TITLE = $2, FIRST_NAME = $3, MIDDLE_NAME = $4, LAST_NAME = $5, SUFFIX = $6, NICKNAME = $7, ' +
    'EMAIL = $8, MOBILE_PHONE = $9, BUSINESS_PHONE = $10, HOME_PHONE = $11, ASSISTANT_PHONE = $12, OTHER_PHONE = $13, FAX = $14, ' +
    'GENDER = $15, BIRTHDAY = $16::timestamp, ANNIVERSARY = $17::timestamp, ANNIVERSARY_NAME = $18, SPOUSE = $19, CHILDREN = $20, HOBBIES = $21, ' +
    'MANAGER_NAME = $22, ASSISTANT_NAME = $23, SKYPE = $24, OTHER_IM = $25, TWITTER = $26, FACEBOOK = $27, EMAIL2 = $28, ' +
    'GOOGLE_PLUS = $29, HOME_ADDR_STREET = $30, HOME_ADDR_CITY = $31, HOME_ADDR_REGION = $32, HOME_ADDR_ZIP = $33, HOME_ADDR_COUNTRY = $34, ' +
    'LINKEDIN = $35 ' +
    'WHERE ID = $1';
  try {
    vals = [req.params.id, req.body.title, req.body.first_name, req.body.middle_name, req.body.last_name, req.body.suffix,
      req.body.nickname, req.body.email, req.body.mobile_phone, req.body.business_phone, req.body.home_phone, req.body.assistant_phone,
      req.body.other_phone, req.body.fax, req.body.gender, req.body.birthday, req.body.anniversary, req.body.anniversary_name, req.body.spouse,
      req.body.children, req.body.hobbies, req.body.manager_name, req.body.assistant_name,
      req.body.skype, req.body.other_im, req.body.twitter, req.body.facebook, req.body.email2, req.body.google_plus,
      req.body.home_addr_street, req.body.home_addr_city, req.body.home_addr_region, req.body.home_addr_zip, req.body.home_addr_country,
      req.body.linkedin];

    //req.body.people_id = req.params.id;
    req.body = {
      people_id: req.params.id,
      companies_id: req.body.companies_id,
      company_name: req.body.company_name,
      work_since: req.body.work_since,
      work_to: req.body.work_to,
      position: req.body.position,
      position_id: req.body.position_id,
      role: req.body.role,
      role_id: req.body.role_id,
      company: req.body.company,
      positionBox: req.body.positionBox,
      roleBox: req.body.roleBox
    };

    postgres.executeSQL(req, res, sql, vals).then(
      function () {
        return people_companies.updateAll(req, res, true);
      }
    ).then(
      function (result) {
        var tmp = tools.getSingleResult(result);
        return tools.sendResponseSuccess({
          companies_id: tmp.companies_id,
          position_id: tmp.position_id,
          role_id: tmp.role_id
        }, res, false);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name post
 * @description people post to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  var sql, sqlSeq, vals, errors,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT;

  req.assert('first_name', 'Jméno musí být vyplněno.').notEmpty();
  req.assert('last_name', 'Příjmení musí být vyplněno.').notEmpty();
  req.assert('title', tools.getValidationMessage('title', message_valid_length, 0, 100)).len(0, 100);
  req.assert('first_name', tools.getValidationMessage('first_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('middle_name', tools.getValidationMessage('middle_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('last_name', tools.getValidationMessage('last_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('suffix', tools.getValidationMessage('suffix', message_valid_length, 0, 40)).len(0, 40);
  req.assert('nickname', tools.getValidationMessage('nickname', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email) && req.body.email) {
    req.assert('email', tools.getValidationMessage('email', message_valid_format)).isNull();
  }
  req.assert('email', tools.getValidationMessage('email', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.mobile_phone) && req.body.mobile_phone) {
    req.assert('mobile_phone', tools.getValidationMessage('mobile_phone', message_valid_format)).isNull();
  }
  req.assert('mobile_phone', tools.getValidationMessage('mobile_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.business_phone) && req.body.business_phone) {
    req.assert('business_phone', tools.getValidationMessage('business_phone', message_valid_format)).isNull();
  }
  req.assert('business_phone', tools.getValidationMessage('business_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.home_phone) && req.body.home_phone) {
    req.assert('home_phone', tools.getValidationMessage('home_phone', message_valid_format)).isNull();
  }
  req.assert('home_phone', tools.getValidationMessage('home_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.assistant_phone) && req.body.assistant_phone) {
    req.assert('assistant_phone', tools.getValidationMessage('assistant_phone', message_valid_format)).isNull();
  }
  req.assert('assistant_phone', tools.getValidationMessage('assistant_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.other_phone) && req.body.other_phone) {
    req.assert('other_phone', tools.getValidationMessage('other_phone', message_valid_format)).isNull();
  }
  req.assert('other_phone', tools.getValidationMessage('other_phone', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax) && req.body.fax) {
    req.assert('fax', tools.getValidationMessage('fax', message_valid_format)).isNull();
  }
  req.assert('fax', tools.getValidationMessage('fax', message_valid_length, 0, 100)).len(0, 100);
  req.assert('gender', tools.getValidationMessage('gender', message_valid_length, 0, 10)).len(0, 10);
  if (req.body.birthday && !tools.validateIsoDate(req.body.birthday)) {
    req.assert('birthday', tools.getValidationMessage('birthday', message_valid_format)).isNull();
  }
  if (req.body.anniversary && !tools.validateIsoDate(req.body.anniversary)) {
    req.assert('anniversary', tools.getValidationMessage('anniversary', message_valid_format)).isNull();
  }
  if (req.body.work_since && !tools.validateIsoDate(req.body.work_since)) {
    req.assert('work_since', tools.getValidationMessage('work_since', message_valid_format)).isNull();
  }
  req.assert('anniversary_name', tools.getValidationMessage('anniversary_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('spouse', tools.getValidationMessage('spouse', message_valid_length, 0, 100)).len(0, 100);
  req.assert('children', tools.getValidationMessage('children', message_valid_length, 0, 100)).len(0, 100);
  req.assert('hobbies', tools.getValidationMessage('hobbies', message_valid_length, 0, 100)).len(0, 100);
  req.assert('manager_name', tools.getValidationMessage('manager_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('assistant_name', tools.getValidationMessage('assistant_name', message_valid_length, 0, 100)).len(0, 100);
  req.assert('skype', tools.getValidationMessage('skype', message_valid_length, 0, 100)).len(0, 100);
  req.assert('other_im', tools.getValidationMessage('other_im', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter', tools.getValidationMessage('twitter', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook', tools.getValidationMessage('facebook', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email2) && req.body.email2) {
    req.assert('email2', tools.getValidationMessage('email2', message_valid_format)).isNull();
  }
  req.assert('email2', tools.getValidationMessage('email2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_plus', tools.getValidationMessage('google_plus', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_street', tools.getValidationMessage('home_addr_street', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_city', tools.getValidationMessage('home_addr_city', message_valid_length, 0, 100)).len(0, 100);
  req.assert('home_addr_region', tools.getValidationMessage('home_addr_region', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.home_addr_zip) && req.body.home_addr_zip) {
    req.assert('home_addr_zip', tools.getValidationMessage('home_addr_zip', message_valid_format)).isNull();
  }
  req.assert('home_addr_zip', tools.getValidationMessage('home_addr_zip', message_valid_length, 0, 20)).len(0, 20);
  req.assert('home_addr_country', tools.getValidationMessage('home_addr_country', message_valid_length, 0, 100)).len(0, 100);
  req.assert('linkedin', tools.getValidationMessage('linkedin', message_valid_length, 0, 100)).len(0, 100);

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  tools.setNullForEmpty(req.body);
  sql =
    'INSERT INTO PEOPLE (' +
    'ID, TITLE, FIRST_NAME, MIDDLE_NAME, LAST_NAME, SUFFIX, NICKNAME, EMAIL, MOBILE_PHONE, BUSINESS_PHONE, HOME_PHONE, ASSISTANT_PHONE, OTHER_PHONE, FAX, ' +
    'GENDER, BIRTHDAY, ANNIVERSARY, ANNIVERSARY_NAME, SPOUSE, CHILDREN, HOBBIES, MANAGER_NAME, ASSISTANT_NAME, SKYPE, OTHER_IM, TWITTER, FACEBOOK, EMAIL2, ' +
    'GOOGLE_PLUS, HOME_ADDR_STREET, HOME_ADDR_CITY, HOME_ADDR_REGION, HOME_ADDR_ZIP, HOME_ADDR_COUNTRY, LINKEDIN, TEAM_MEMBER) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::date, $17::date, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, ' +
    '$29, $30, $31, $32, $33, $34, $35, $36)';

  sqlSeq = 'SELECT nextval(\'seq_people_id\') AS ID';

  try {
    vals = [null, req.body.title, req.body.first_name, req.body.middle_name, req.body.last_name, req.body.suffix, req.body.nickname,
      req.body.email, req.body.mobile_phone, req.body.business_phone, req.body.home_phone, req.body.assistant_phone, req.body.other_phone, req.body.fax,
      req.body.gender, req.body.birthday, req.body.anniversary, req.body.anniversary_name, req.body.spouse,
      req.body.children, req.body.hobbies, req.body.manager_name, req.body.assistant_name,
      req.body.skype, req.body.other_im, req.body.twitter, req.body.facebook, req.body.email2, req.body.google_plus,
      req.body.home_addr_street, req.body.home_addr_city, req.body.home_addr_region, req.body.home_addr_zip, req.body.home_addr_country,
      req.body.linkedin, req.body.teamMember];

    return postgres.select(sqlSeq, [], req).then(
      function (result) {
        vals[0] = tools.getSingleResult(result).id;
        return postgres.executeSQL(req, res, sql, vals);
      }
    ).then(
      function () {
        req.body = {
          people_id: vals[0],
          companies_id: req.body.companies_id,
          company_name: req.body.company_name,
          work_since: req.body.work_since,
          work_to: req.body.work_to,
          position: req.body.position,
          position_id: req.body.position_id,
          role: req.body.role,
          role_id: req.body.role_id,
          company: req.body.company,
          positionBox: req.body.positionBox,
          roleBox: req.body.roleBox
        };
        return people_companies.updateAll(req, res, true);
      }
    ).then(
      function () {
        return tools.sendResponseSuccess({id: vals[0]}, res, false);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name delete
 * @description people delete from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.delete = function (req, res) {
  req.assert('id', 'Není zadáno ID kontaktu.').notEmpty();
  var errors = req.validationErrors(),
    obj = {type: 'success', msg: 'Kontakt byl smazán.'},
    sql_comp = 'DELETE FROM PEOPLE_COMPANIES WHERE PEOPLE_ID = $1::integer',
    sql_tags = 'DELETE FROM PEOPLE_PEOPLE_TAGS WHERE PEOPLE_ID = $1::integer',
    sql_users = 'DELETE FROM USERS_LOGIN WHERE PEOPLE_ID = $1::integer',
    sql_sales = 'DELETE FROM SALES_PIPELINE WHERE OWNER_ID = $1::integer',
    sql_people = 'DELETE FROM PEOPLE WHERE ID = $1::integer';
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    postgres.executeSQL(req, res, sql_comp, [req.params.id]).then(
      function () {
        return postgres.executeSQL(req, res, sql_tags, [req.params.id]);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sql_users, [req.params.id]);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sql_sales, [req.params.id]);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sql_people, [req.params.id]);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    ).then(
      function () {
        res.json(obj);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name companyPeople
 * @description list people of company from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companyPeople = function (req, res) {
  try {
    var obj = {rows: [], count: req.query.count},
      page = req.query.page || 1,
      amount = req.query.amount || 10,
      offset = (page * amount) - amount,
      loadCount = parseInt(req.query.loadCount, 10),
      sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection,
      errors,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('id', 'ID row not found.').notEmpty();
    req.assert('id', tools.getValidationMessage('id', message_valid_number)).isInt();

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    accessColumnOrder = ['LAST_NAME', 'POSITION_ID', 'ROLE_ID'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' ID ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  p.id, ' +
      '  p.first_name||\' \'||p.last_name AS name, ' +
      '  pc.position_id, ' +
      '  po.name as "position", ' +
      '  pc.role_id, ' +
      '  r.name as "role", ' +
      '  p.business_phone as "businessPhone", ' +
      '  p.assistant_phone as "assistantPhone", ' +
      '  p.home_phone as "homePhone", ' +
      '  p.mobile_phone as "mobilePhone", ' +
      '  p.other_phone as "otherPhone", ' +
      '  p.email,' +
      '  p.email2 ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE ' +
      '  pc.companies_id = $3::integer ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  people p, ' +
      '  people_companies pc ' +
      'WHERE ' +
      '  p.id = pc.people_id AND ' +
      '  pc.companies_id = $1::integer ';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.query.id], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, req.query.id], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name homeAddress
 * @description get home address
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.homeAddress = function (req, res, next) {
  var loginToken, sql;
  loginToken = req.signedCookies.auth_token;
  sql =
    'SELECT ' +
    '  p.id, ' +
    '  home_addr_street, ' +
    '  home_addr_city, ' +
    '  home_addr_zip, ' +
    '  CASE WHEN u.language = \'cs-cz\' THEN c.name_cz ' +
    '     WHEN u.language = \'sk-sk\' THEN c.name_sk ' +
    '     WHEN u.language = \'en-us\' THEN c.name_eng ' +
    '  ELSE c.name_eng END AS home_addr_country ' +
    'FROM ' +
    '  people p ' +
    '    INNER JOIN users_login u ON u.people_id = p.id ' +
    '    LEFT JOIN countries c ON c.ID = p.home_addr_country ' +
    'WHERE ' +
    '  u.login_token = $1';
  try {
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
 * @memberof __Server_REST_API_People
 * @method
 * @name businessAddress
 * @description get bussiness address
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.businessAddress = function (req, res, next) {
  var loginToken, sql;
  loginToken = req.signedCookies.auth_token;
  sql =
    'SELECT ' +
    '  p.id, ' +
    '  business_addr_street, ' +
    '  business_addr_city, ' +
    '  business_addr_zip, ' +
    '  CASE WHEN u.language = \'cs-cz\' THEN c.name_cz ' +
    '     WHEN u.language = \'sk-sk\' THEN c.name_sk ' +
    '     WHEN u.language = \'en-us\' THEN c.name_eng ' +
    '  ELSE c.name_eng END AS business_addr_country ' +
    'FROM ' +
    '  people p ' +
    '    INNER JOIN users_login u ON u.people_id = p.id ' +
    '    LEFT JOIN countries c ON c.ID = p.business_addr_country ' +
    'WHERE ' +
    '  u.login_token = $1';
  try {
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
 * @memberof __Server_REST_API_People
 * @method
 * @name latestAddress
 * @description get bussiness address
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.latestAddress = function (req, res, next) {
  var sql, loginToken;
  sql =
    'SELECT ' +
    '  ap.id, ap.location as name ' +
    'FROM ' +
    '  appointments ap, ' +
    '  users_login u ' +
    'WHERE ' +
    '  u.login_token = $1::varchar and ' +
    '  ap.owner_id = u.people_id and ' +
    '  ap.location is not null ' +
    'ORDER BY ' +
    '  ap.id desc ' +
    'LIMIT 10';
  try {
    loginToken = req.signedCookies.auth_token;
    postgres.select(sql, [loginToken], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name search
 * @description search in people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param next {Object} next reference object
 * @returns void
 */
exports.search = function (req, res, next) {
  var sql =
    'SELECT ' +
    '  p.id,p.first_name||\' \'||p.last_name as name ' +
    'FROM ' +
    '  people p ' +
    '    LEFT JOIN people_companies pc ON pc.people_id = p.id ' +
    '    LEFT JOIN companies c ON c.id = pc.companies_id ' +
    'WHERE ' +
    '  UPPER(first_name||\' \'||last_name) LIKE $1::varchar ' +
    'LIMIT 50';
  try {
    postgres.select(sql, ['%' + req.params.search.toUpperCase() + '%'], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name smartInsert
 * @description smart insert People (name)
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.smartInsert = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    var sql, sqlSeq, firstName, lastName, tmpA, tmpB, row, sqlCompany;
    sql = 'INSERT INTO people(id, first_name, last_name) VALUES($1, $2, $3)';
    sqlCompany = 'INSERT INTO people_companies(people_id, companies_id) VALUES($1, $2)';
    sqlSeq = 'SELECT nextval(\'seq_people_id\') AS ID';
    try {
      obj.person = obj.person || [];
      if (!obj.person[0] || (obj.person[0] && tools.isNumber(obj.person[0].id))) {
        resolve({id: (obj.person[0] ? obj.person[0].id : null)});
        return;
      }

      postgres.select(sqlSeq, [], req).then(
        function (result) {
          tmpA = tools.getStringFromArray(obj.person[0].name, 1, ' ');
          tmpB = tools.getStringFromArray(obj.person[0].name, 2, ' ');
          firstName = tmpB ? tmpA : null;
          lastName = tmpB || tmpA;
          row = tools.getSingleResult(result);
          postgres.executeSQL(req, res, sql, [req.body.testId || row.id, firstName, lastName], null, conn).then(
            function () {
              obj.id = row.id;
              // save person/company
              if (obj.companyId && tools.isNumber(obj.companyId)) {
                postgres.executeSQL(req, res, sqlCompany, [row.id, req.body.testCompanyId || obj.companyId], null, conn).then(
                  function () {
                    resolve(obj);
                  }
                );
              } else {
                resolve(obj);
              }
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
 * @memberof __Server_REST_API_People
 * @method
 * @name loginUser
 * @description login user data from people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.loginUser = function (req, res) {
  var sql, errors, loginToken;
  loginToken = req.signedCookies.auth_token;

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  p.* ' +
      'FROM ' +
      '  PEOPLE p, ' +
      '  USERS_LOGIN u ' +
      'WHERE ' +
      '  p.ID = u.people_id AND ' +
      '  u.login_token = $1::varchar ';

    postgres.select(sql, [loginToken], req).then(
      function (result) {
        tools.sendResponseSuccess(tools.getSingleResult(result), res, false);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name loginUserEmails
 * @description login user emails from people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.loginUserEmails = function (req, res) {
  var sql, errors, loginToken;
  loginToken = req.signedCookies.auth_token;

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  p.email, p.email2 ' +
      'FROM ' +
      '  PEOPLE p, ' +
      '  USERS_LOGIN u ' +
      'WHERE ' +
      '  p.ID = u.people_id AND ' +
      '  u.login_token = $1::varchar ';

    postgres.select(sql, [loginToken], req).then(
      function (result) {
        tools.sendResponseSuccess(tools.getSingleResult(result), res, false);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name teamMembersList
 * @description list of team members
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.teamMembersList = function (req, res) {
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

    accessColumnOrder = ['LAST_NAME'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' LAST_NAME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  p.ID, p.FIRST_NAME, p.LAST_NAME, c.COMPANY_NAME, po.NAME AS POSITION, r.NAME AS ROLE ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE p.TEAM_MEMBER=1 AND (' +
      '  UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  PEOPLE p ' +
      '    LEFT JOIN PEOPLE_COMPANIES pc ON p.ID = pc.PEOPLE_ID ' +
      '    LEFT JOIN COMPANIES c ON pc.COMPANIES_ID = c.ID ' +
      '    LEFT JOIN POSITIONS po ON pc.POSITION_ID = po.ID ' +
      '    LEFT JOIN ROLES r ON pc.ROLE_ID = r.ID ' +
      'WHERE p.TEAM_MEMBER=1 AND (' +
      '   UPPER(p.FIRST_NAME||\' \'||p.LAST_NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   $1::varchar IS NULL)';

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
 * @memberof __Server_REST_API_People
 * @method
 * @name searchGlobal
 * @description search people global
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.searchGlobal = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  p.id,p.last_name || \' \' || p.first_name as name ' +
      'FROM ' +
      '  people p ' +
      '  LEFT JOIN countries co1 ON p.business_addr_country = co1.id ' +
      '  LEFT JOIN countries co2 ON p.home_addr_country = co2.id ' +
      '  LEFT JOIN countries co3 ON p.other_addr_country = co3.id ' +
      'WHERE ' +
      '  upper(p.first_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.middle_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.last_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.nickname) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.manager_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.assistant_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.anniversary_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.children) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.spouse) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.gender) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.email) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.email2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.skype) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_im) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.linkedin) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.twitter) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.facebook) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.assistant_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.mobile_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.fax) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co1.name_cz||\'@\'||co1.name_sk||\'@\'||co1.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co2.name_cz||\'@\'||co2.name_sk||\'@\'||co2.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co3.name_cz||\'@\'||co3.name_sk||\'@\'||co3.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.google_plus) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR EXISTS (select 1 from people_people_tags ppt, people_tags pt where pt.id = ppt.people_tags_id and ppt.people_id = p.id and upper(pt.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, companies c where pc.companies_id = c.id and pc.people_id = p.id and upper(c.company_name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, positions ps where pc.position_id = ps.id and pc.people_id = p.id and upper(ps.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, roles r where pc.role_id = r.id and pc.people_id = p.id and upper(r.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      'ORDER BY ' +
      '  p.last_name || \' \' || p.first_name ' +
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

/**
 * @memberof __Server_REST_API_People
 * @method
 * @name searchGlobalTeam
 * @description search people global team
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.searchGlobalTeam = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  p.id,p.last_name || \' \' || p.first_name as name ' +
      'FROM ' +
      '  people p ' +
      '  LEFT JOIN countries co1 ON p.business_addr_country = co1.id ' +
      '  LEFT JOIN countries co2 ON p.home_addr_country = co2.id ' +
      '  LEFT JOIN countries co3 ON p.other_addr_country = co3.id ' +
      'WHERE ' +
      '  (' +
      '  upper(p.first_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.middle_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.last_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.nickname) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.manager_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.assistant_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.anniversary_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.children) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.spouse) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.gender) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_street) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_city) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_zip) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_addr_region) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.email) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.email2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.skype) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_im) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.linkedin) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.twitter) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.facebook) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.business_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.assistant_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.home_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.mobile_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.other_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.fax) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co1.name_cz||\'@\'||co1.name_sk||\'@\'||co1.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co2.name_cz||\'@\'||co2.name_sk||\'@\'||co2.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co3.name_cz||\'@\'||co3.name_sk||\'@\'||co3.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.google_plus) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR EXISTS (select 1 from people_people_tags ppt, people_tags pt where pt.id = ppt.people_tags_id and ppt.people_id = p.id and upper(pt.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, companies c where pc.companies_id = c.id and pc.people_id = p.id and upper(c.company_name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, positions ps where pc.position_id = ps.id and pc.people_id = p.id and upper(ps.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from people_companies pc, roles r where pc.role_id = r.id and pc.people_id = p.id and upper(r.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  ) AND team_member = 1 ' +
      'ORDER BY ' +
      '  p.last_name || \' \' || p.first_name ' +
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

/**
 * @memberof __Server_REST_API_People
 * @method
 * @name uploadPicture
 * @description upload picture
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.uploadPicture = function (req, res) {
  try {
    attachments.del(req).then(
      function () {
        return attachments.post(req, res);
      }
    ).then(
      function (result) {
        tools.sendResponseSuccess({id: result.id}, res, false);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name anniversaryCount
 * @description people with anniversary - count
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.anniversaryCount = function (req, res) {
  var sql, obj;
  try {
    sql =
      'SELECT sum(count) as count FROM ( ' +
      '(SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  people p ' +
      'WHERE ' +
      ' to_char(birthday, \'MM-DD\') >= to_char(current_date, \'MM-DD\') and ' +
      ' to_char(birthday, \'MM-DD\') < to_char(current_date+31, \'MM-DD\'))' +
      'UNION ' +
      '(SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  people p ' +
      'WHERE ' +
      ' to_char(anniversary, \'MM-DD\') >= to_char(current_date, \'MM-DD\') and ' +
      ' to_char(anniversary, \'MM-DD\') < to_char(current_date+31, \'MM-DD\'))' +
      ') a';

    postgres.select(sql, [], req).then(
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
 * @memberof __Server_REST_API_People
 * @method
 * @name anniversaryToday
 * @description people with anniversary - today
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.anniversaryToday = function (req, res) {
  var sql, sqlCount, obj = {};
  try {
    sql =
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' \'narozeniny (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.birthday))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.birthday, \'MM-DD\') = to_char(current_date, \'MM-DD\') ' +
      'UNION ' +
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' coalesce(p.anniversary_name,\'výročí\')||\' (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.anniversary))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.anniversary, \'MM-DD\') = to_char(current_date, \'MM-DD\') ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    postgres.select(sql, [], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [], req);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name anniversaryTomorrow
 * @description people with anniversary - tomorrow
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.anniversaryTomorrow = function (req, res) {
  var sql, sqlCount, obj = {};
  try {
    sql =
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' \'narozeniny (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.birthday))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.birthday, \'MM-DD\') = to_char(current_date + 1, \'MM-DD\') ' +
      'UNION ' +
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' coalesce(p.anniversary_name,\'výročí\')||\' (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.anniversary))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.anniversary, \'MM-DD\') = to_char(current_date + 1, \'MM-DD\') ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    postgres.select(sql, [], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [], req);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name anniversaryAfterTomorrow
 * @description people with anniversary - after tomorrow
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.anniversaryAfterTomorrow = function (req, res) {
  var sql, sqlCount, obj = {};
  try {
    sql =
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' \'narozeniny (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.birthday))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.birthday, \'MM-DD\') = to_char(current_date + 2, \'MM-DD\') ' +
      'UNION ' +
      'SELECT ' +
      ' p.id, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' coalesce(p.anniversary_name,\'výročí\')||\' (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.anniversary))||\')\' as text ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.anniversary, \'MM-DD\') = to_char(current_date + 2, \'MM-DD\') ';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    postgres.select(sql, [], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [], req);
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
 * @memberof __Server_REST_API_People
 * @method
 * @name anniversaryNextDays
 * @description people with anniversary - next days
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.anniversaryNextDays = function (req, res) {
  var sql, sqlCount, obj = {};
  try {
    sql =
      'SELECT * FROM ( ' +
      'SELECT' +
      ' p.id, ' +
      ' p.birthday as day, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' \'narozeniny (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.birthday))||\')\' as text, ' +
      ' to_date(to_char(p.birthday, \'DD-MM-2000\'), \'DD-MM-YYYY\') as orderDay ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.birthday, \'MM-DD\') > to_char(current_date + 2, \'MM-DD\') and ' +
      ' to_char(p.birthday, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\') ' +
      'UNION ' +
      'SELECT ' +
      ' p.id, ' +
      ' p.anniversary as day, ' +
      ' p.first_name ||\' \'||p.last_name as name, ' +
      ' c.company_name as "companyName", ' +
      ' coalesce(p.anniversary_name,\'výročí\')||\' (\'||(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM p.anniversary))||\')\' as text,' +
      ' to_date(to_char(p.anniversary, \'DD-MM-2000\'), \'DD-MM-YYYY\') as orderDay ' +
      'FROM ' +
      ' people p ' +
      ' LEFT JOIN people_companies pc ON p.id = pc.people_id ' +
      ' LEFT JOIN companies c ON pc.companies_id = c.id ' +
      'WHERE ' +
      ' to_char(p.anniversary, \'MM-DD\') > to_char(current_date + 2, \'MM-DD\') and ' +
      ' to_char(p.anniversary, \'MM-DD\') < to_char(current_date + 31, \'MM-DD\') ' +
      ')a ORDER BY orderDay';

    sqlCount =
      'SELECT ' +
      '  count(*) as count ' +
      'FROM ' +
      '  (' + sql + ') s';

    postgres.select(sql, [], req).then(
      function (result) {
        obj.records = tools.getMultiResult(result);
        return postgres.select(sqlCount, [], req);
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
