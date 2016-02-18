/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file permission
 * @fileOverview __Server_Permission
 */

/**
 * @namespace __Server_Permission
 * @author Martin Boháč
 */

var
  constants = require('./constants'),
  permission = require('./permission'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  getPermission,
  getIdFromSqlAndVals,
  existsPermission,
  isAmbiguous,
  checkPermission,
  replaceWithPermission;

// db tables for permission
exports.DB_TABLES = [
  {CODE: 'APPOINTMENTS'},
  {CODE: 'COMPANIES'},
  {CODE: 'REMINDER'},
  {CODE: 'SALES_PIPELINE'},
  {CODE: 'TASKS'}
];

exports.SQL_PERMISSION =
  'SELECT ' +
  '  r.id, ' +
  '  UPPER(r.object) as object, ' +
  '  r.res_type as "resType",' +
  '  r.operation, ' +
  '  r.restriction, ' +
  '  ur.owner_id as "appUserId" ' +
  'FROM ' +
  '   restrictions r, ' +
  '   users_restrictions ur ' +
  'WHERE ' +
  '  r.id = ur.restriction_id ' +
  '  AND ur.owner_id = $1 ' +
  '  AND r.operation = $2 ';

/**
 * @memberof __Server_Permission
 * @method
 * @name prepare
 * @description list of opportunities for company from DB
 * @param sql {String} sql
 * @param arr {Array} arr
 * @param connection {Object} connection
 * @param vals {Array} vals
 * @param method {String} method
 * @returns Object
 */
exports.prepare = function (sql, arr, connection, vals, method) {
  var sqlPermission, err = false, params;

  // for internal call
  if (connection && connection.internalToken === constants.INTERNAL_TOKEN) {
    sqlPermission = sql;
  // for external call
  } else {
    params = {
      appUserId: connection.appUserId,
      id: getIdFromSqlAndVals(sql, vals, method)
    };
    sqlPermission = replaceWithPermission(sql, arr, method, params);

    // Errors
    err = checkPermission(sql, arr, method, params);
    if (err) {
      sqlPermission = null;
    }
  }

  return {sql: sqlPermission, err: err};
};

/**
 * @memberof __Server_Permission
 * @method
 * @name replaceWithPermission
 * @description replace sql with permission
 * @param sql {String} sql
 * @param arr {Array} arr
 * @param method {String} method
 * @param params {Object} params
 * @returns String
 */
replaceWithPermission = function (sql, arr, method, params) {
  var sqlUpper,
    perm,
    sqlPermission = sql;
  try {
    sqlUpper = sql.toUpperCase();
    arr.map(function (el) {
      if (sqlUpper.indexOf(el.object) > -1) {
        perm = getPermission(method, el);
        if (perm && el.resType > 0) {
          sqlPermission = sqlPermission.replace(new RegExp('\\b' + el.object + '\\b', 'gi'), perm);
        }
      }
    });
    // replace login user
    sqlPermission = sqlPermission.replace(new RegExp(':owner_id', 'gi'), params.appUserId);
    // replace id for UPDATE, DELETE
    if (params.id) {
      sqlPermission = sqlPermission.replace(new RegExp(':id', 'gi'), params.id);
    }
  } catch (e) {
    console.log(e);
  }
  return sqlPermission;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name getPermission
 * @description get permission from object
 * @param method {String} method
 * @param permission {Object} permission
 * @returns String
 */
getPermission = function (method, permission) {
  var str, addBracket;
  addBracket = function (sql) {
    if (method === constants.DML_METHODS.SELECT.DB_CODE) {
      sql = '(' + sql + ')';
    }
    return sql;
  };
  str = addBracket(permission.restriction);
  return str;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name getMethodFromSql
 * @description get method from sql
 * @param sql {String} sql
 * @returns String
 */
exports.getMethodFromSql = function (sql) {
  var str = '',
    sqlUpper = sql.toUpperCase();
  if (sqlUpper.indexOf('INSERT INTO') > -1) {
    str = constants.DML_METHODS.POST.DB_CODE;
  }
  if (sqlUpper.indexOf('DELETE FROM') > -1) {
    str = constants.DML_METHODS.DELETE.DB_CODE;
  }
  if (sqlUpper.indexOf('UPDATE') > -1) {
    str = constants.DML_METHODS.UPDATE.DB_CODE;
  }
  if (sqlUpper.indexOf('SELECT') > -1) {
    str = constants.DML_METHODS.SELECT.DB_CODE;
  }
  return str;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name getIdFromSqlAndVals
 * @description get id from sql and vals
 * @param sql {String} sql
 * @param vals {Array} vals
 * @param method {String} method
 * @returns String
 */
getIdFromSqlAndVals = function (sql, vals, method) {
  var id = '', tmp, fromComm, comm = '$', abc = ['0123456789'], i, l;
  if ([constants.DML_METHODS.DELETE.DB_CODE, constants.DML_METHODS.UPDATE.DB_CODE].indexOf(method) > -1) {
    tmp = sql.substr(sql.toUpperCase().indexOf('WHERE'));
    fromComm = tmp.substr(tmp.indexOf(comm));
    for (i = 1, l = fromComm.length; i < l; i += 1) {
      if (abc.indexOf(fromComm[i]) === -1) {
        break;
      }
      id += fromComm[i];
    }
  }
  return id;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name existsPermission
 * @description check exists permission for table
 * @param sql {String} sql
 * @param arr {Array} arr
 * @returns Boolean
 */
existsPermission = function (sql, arr) {
  var i, l, row, exist = true, existTable, existPermission;
  existTable = function (sql, row) {
    return sql.toUpperCase().search(new RegExp('\\b' + row.CODE.toUpperCase() + '\\b')) > -1;
  };
  existPermission = function (row, perm) {
    var result = false, e, j;
    for (e = 0, j = perm.length; e < j; e += 1) {
      if (perm[e].object.toUpperCase() === row.CODE && (String(perm[e].restriction).length > 0 || perm[e].res_type === 0)) {
        result = true;
        break;
      }
    }
    return result;
  };

  // for all db tables find any permission
  for (i = 0, l = permission.DB_TABLES.length; i < l; i += 1) {
    row = permission.DB_TABLES[i];
    if (existTable(sql, row)) {
      if (!existPermission(row, arr)) {
        exist = false;
        break;
      }
    }
  }
  return exist;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name checkPermission
 * @description check permission
 * @param sql {String} sql
 * @param arr {Array} arr
 * @param method {String} method
 * @param params {Object} params
 * @returns Boolean
 */
checkPermission = function (sql, arr, method, params) {
  var err = false;
  // exists any permission
  err = !err && arr.length === 0 ? true : err;
  //exist permission for all table of current sql
  err = !err && !existsPermission(sql, arr) ? true : err;
  // ambiguous permission
  err = !err && isAmbiguous(sql, arr) ? true : err;
  return err;
};

/**
 * @memberof __Server_Permission
 * @method
 * @name createRestrictions
 * @description create permission
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.createRestrictions = function (req, res) {
  var sql, restOwnerSelect;
  try {
    sql =
      'insert into restrictions ' +
      '  select ' +
      '    nextval(\'seq_restrictions_id\'), $1::varchar, $2::integer, $3::varchar, $4::varchar ' +
      '  where ' +
      '    not exists(select 1 from restrictions r ' +
      '               where ' +
      '                 object = $1::varchar ' +
      '                 AND res_type = $2::integer ' +
      '                 AND operation = $3::varchar ' +
      '               )';

    permission.DB_TABLES.map(function (el) {
      // permission for all
      postgres.executeSQL(req, res, sql, [el.CODE, 0, 'S', null], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 0, 'I', null], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 0, 'U', null], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 0, 'D', null], null, null);
      // permission for owner
      restOwnerSelect = 'select * from ' + el.CODE.toLowerCase() + ' where owner_id = :owner_id';
      postgres.executeSQL(req, res, sql, [el.CODE, 1, 'S', 'select * from ' + el.CODE.toLowerCase() + ' where owner_id = :owner_id'], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 1, 'I', el.CODE.toLowerCase()], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 1, 'U', ' AND EXISTS(select 1 from (' + restOwnerSelect + ') x where id = :id)'], null, null);
      postgres.executeSQL(req, res, sql, [el.CODE, 1, 'D', ' AND EXISTS(select 1 from (' + restOwnerSelect + ') x where id = :id)'], null, null);
    });
    res.end();
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_Permission
 * @method
 * @name createRestrictionsForUser
 * @description create permission for user
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.createRestrictionsForUser = function (req, res) {
  var sql, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER, errors, loginToken;
  try {
    loginToken = req.signedCookies.auth_token;
    sql =
      'insert into users_restrictions ' +
      '  select ' +
      '    $1, r.id' +
      '  from ' +
      '    restrictions r ' +
      '  where ' +
      '    res_type = $2 ' +
      '    AND not exists (select 1 from users_restrictions ur where ur.restriction_id = r.id and ur.owner_id = $1) ' +
      '    AND exists (select 1 from users_login ul where login_token = $3 AND administrator = 1)' +
      '    AND not exists (select 1 from users_restrictions ur where owner_id = $1)';

    req.assert('id', 'Id not found.').notEmpty();
    if (req.body.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }
    req.assert('resType', 'resType not found.').notEmpty();
    if (req.body.res_type) {
      req.assert('resType', tools.getValidationMessage('res_type', message_valid_number, null, null)).isInt();
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    postgres.executeSQL(req, res, sql, [req.body.id, req.body.resType || 0, loginToken], null, null).then(
      function () {
        res.end();
      }
    );
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_Permission
 * @method
 * @name isAmbiguous
 * @description permission is ambiguous
 * @param sql {String} sql
 * @param arr {Array} arr
 * @returns Boolean
 */
isAmbiguous = function (sql, arr) {
  var amb = false, obj = {}, i, l;
  for (i = 0, l = arr.length; i < l; i += 1) {
    obj[arr[i].object + '_' + arr[i].operation] = (obj[arr[i].object + '_' + arr[i].operation] || 0) + 1;
    if (obj[arr[i].object + '_' + arr[i].operation] > 1 && sql.toUpperCase().search(new RegExp('\\b' + arr[i].object.toUpperCase() + '\\b')) > -1) {
      amb = true;
      break;
    }
  }
  return amb;
};
