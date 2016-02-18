/*jslint node: true, unparam: true */
'use strict';

/**
 * @file attachments
 * @fileOverview __Server_REST_API_Attachments
 */

/**
 * @namespace __Server_REST_API_Attachments
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  attachments = require('./attachments'),
  Promise = require('promise'),
  fs = require('fs');

/**
 * @memberof __Server_REST_API_Attachments
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
      table = req.query.table === constants.ATTACHMENTS_TYPES.ANY ? null : req.query.table,
      tableId = req.query.tableId,
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection;

    accessColumnOrder = ['description', 'file', 'insertDate'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : 'description';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' "' + sqlOrderByField + '" ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      'a.id, ' +
      'a.file, ' +
      'a.description, ' +
      'a.insert_date as "insertDate", ' +
      't.name as "type" ' +
      'FROM ' +
      '  attachments a ' +
      '    LEFT JOIN attachment_types t ON a.type_id = t.id ' +
      '    LEFT JOIN attachments_tables ta ON a.id = ta.attachment_id ' +
      'WHERE ' +
      '  (' +
      '  UPPER(a.file) LIKE \'%\' || $3::varchar || \'%\' ' +
      '    OR ' +
      '  UPPER(a.description) LIKE \'%\' || $3::varchar || \'%\' ' +
      '    OR ' +
      '  $3::varchar IS NULL ' +
      '  ) ' +
      '  AND (ta.table_name = $4 OR $4 IS NULL) ' +
      '  AND ta.table_id = $5 ' + //  OR $5 IS NULL, add to another function for call all
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  attachments a ' +
      '    LEFT JOIN attachments_tables ta ON a.id = ta.attachment_id ' +
      'WHERE ' +
      '  ( ' +
      '  UPPER(a.file) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '  UPPER(a.description) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '  $1::varchar IS NULL ' +
      '  ) ' +
      '  AND (ta.table_name = $2 OR $2 IS NULL) ' +
      '  AND ta.table_id = $3 '; //  OR $3 IS NULL, add to another function for call all

    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr, table, tableId], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr, table, tableId], req).then(
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
 * @memberof __Server_REST_API_Attachments
 * @method
 * @name uploadFile
 * @description upload any file
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.uploadFile = function (req, res) {
  try {
    attachments.post(req).then(
      function () {
        tools.sendResponseSuccess({success: true}, res, false);
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
 * @memberof __Server_REST_API_Attachments
 * @method
 * @name post
 * @description post any file
 * @param req {Object} request reference object
 * @returns Promise
 */
exports.post = function (req) {
  return new Promise(function (resolve, reject) {
    var sql, sqlSeq, vals, sqlProperties, sqlLob, sqlTables, table, tableId, formData;
    try {
      fs.readFile(req.files.file.path, null, function (err, imgData) {
        sqlSeq = 'SELECT nextval(\'seq_attachments_id\') AS id';
        sql =
          'INSERT INTO attachments(id, file, description, native_size, type_id, charset, mime_type, compressed, parent_attachment_id, insert_date) ' +
          '  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
        sqlLob = 'INSERT INTO attachments_lobs(id, attachment) VALUES($1, $2)';
        sqlTables = 'INSERT INTO attachments_tables(table_name, table_id, attachment_id) VALUES($1, $2, $3)';

        sqlProperties = postgres.createTransaction(req);
        vals = [null, req.files.file.originalFilename, req.files.file.path, req.files.file.size, null, null, req.files.file.type, 0, null, (new Date()).toJSON()];
        formData = req.body.data ? JSON.parse(req.body.data) : {};
        table = req.params.table || formData.table;
        tableId = req.params.tableId || formData.tableId;
        postgres.select(sqlSeq, [], req).then(
          function (result) {
            vals[0] = tools.getSingleResult(result).id;
            return postgres.executeSQL(req, null, sql, vals, null, sqlProperties);
          }
        ).then(
          function () {
            return postgres.executeSQL(req, null, sqlLob, [vals[0], imgData], null, sqlProperties);
          }
        ).then(
          function () {
            return postgres.executeSQL(req, null, sqlTables, [table, tableId, vals[0]], null, sqlProperties);
          }
        ).then(
          function () {
            sqlProperties.tx.commit();
            sqlProperties.client.end();
            //console.log('step 1');
            resolve({id: vals[0]});
          },
          function (result) {
            //console.log('step 2');
            reject(result);
          }
        );
      });
    } catch (e) {
      //console.log('step 3');
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Attachments
 * @method
 * @name deleteFile
 * @description delete any file
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.deleteFile = function (req, res) {
  try {
    attachments.del(req).then(
      function () {
        tools.sendResponseSuccess({success: true}, res, false);
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
 * @memberof __Server_REST_API_Attachments
 * @method
 * @name del
 * @description delete any file
 * @param req {Object} request reference object
 * @returns Promise
 */
exports.del = function (req) {
  return new Promise(function (resolve, reject) {
    try {
      var sql, sqlProperties, sqlLob, sqlTables, id, formData;
      sql = 'DELETE FROM attachments WHERE id = $1';
      sqlLob = 'DELETE FROM attachments_lobs WHERE id = $1';
      sqlTables = 'DELETE FROM attachments_tables WHERE attachment_id = $1';

      sqlProperties = postgres.createTransaction(req);
      formData = req.body.data ? JSON.parse(req.body.data) : {};
      id = req.params.id || formData.id;
      return postgres.executeSQL(req, null, sqlTables, [id], null, sqlProperties).then(
        function () {
          return postgres.executeSQL(req, null, sqlLob, [id], null, sqlProperties);
        }
      ).then(
        function () {
          return postgres.executeSQL(req, null, sql, [id], null, sqlProperties);
        }
      ).then(
        function () {
          sqlProperties.tx.commit();
          sqlProperties.client.end();
          resolve();
        },
        function (result) {
          reject(result);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Attachments
 * @method
 * @name get
 * @description download any file
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  try {
    var sql, obj;
    sql =
      'SELECT ' +
      ' l.attachment,' +
      ' a.file,' +
      ' a.mime_type ' +
      ' FROM ' +
      ' attachments_lobs l ' +
      ' LEFT JOIN attachments a ON a.id = l.id ' +
      ' WHERE ' +
      ' l.id = $1';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        obj = tools.getSingleResult(result);
        fs.writeFile(obj.file, obj.attachment);
        res.status(200);
        res.type(obj.mime_type);
        res.send(obj.attachment);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
      }
    );
  } catch (e) {
    console.log(e);
  }
};
