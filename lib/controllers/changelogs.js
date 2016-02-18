/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 17.09.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file changelogs
 * @fileOverview __Server_REST_API_Changelogs
 */

/**
 * @namespace __Server_REST_API_Changelogs
 * @author Martin Boháč
 */
var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise'),
  parseHistory;

/**
 * @memberof __Server_REST_API_Changelogs
 * @method
 * @name parseHistory
 * @description parse history for list
 * @param result {Object} result
 * @returns Object
 */
parseHistory = function (result) {
  var objPom = tools.getMultiResult(result), newObj, key, tmp, i, l;
  for (i = 0, l = objPom.length; i < l; i += 1) {
    objPom[i].history = [];
    newObj = JSON.parse(objPom[i].content);
    if (newObj.method === 'POST') {
      for (key in newObj.new) {
        if (newObj.new.hasOwnProperty(key) && typeof newObj.old[key] !== 'object' && typeof newObj.new[key] !== 'object') {
          tmp = JSON.parse('{"name":"' + key + '","old":' + (newObj.old[key] ? '"' + newObj.old[key] + '"' : 'null') + ',"new":' + (newObj.new[key] ? '"' + newObj.new[key] + '"' : 'null') + '}');
          objPom[i].history.push(tmp);
        }
      }
    } else {
      for (key in newObj.old) {
        if (newObj.old.hasOwnProperty(key) && typeof newObj.old[key] !== 'object' && typeof newObj.new[key] !== 'object') {
          tmp = JSON.parse('{"name":"' + key + '","old":' + (newObj.old[key] ? '"' + newObj.old[key] + '"' : 'null') + ',"new":' + (newObj.new[key] ? '"' + newObj.new[key] + '"' : 'null') + '}');
          objPom[i].history.push(tmp);
        }
      }
    }
  }
  return objPom;
};

/**
 * @memberof __Server_REST_API_Changelogs
 * @method
 * @name list
 * @description list of changelogs
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

    accessColumnOrder = ['TABLE_NAME'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' TABLE_NAME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  * ' +
      'FROM ' +
      '  logging l ' +
      'WHERE ' +
      '  UPPER(l.TABLE_NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  logging l ' +
      'WHERE ' +
      '   UPPER(l.TABLE_NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
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
          var objPom = parseHistory(result);
          res.json(objPom);
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
