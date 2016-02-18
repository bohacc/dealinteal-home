/*jslint node: true, unparam: true */
'use strict';

/**
 * @file texts
 * @fileOverview __Server_REST_API_Texts
 */

/**
 * @namespace __Server_REST_API_Texts
 * @author Pavel Kolomazník
 */

var
  Promise = require('promise'),
  postgres = require('./api_pg'),
  tools = require('./tools'),
  texts = require('./texts'),
  constants = require('./constants');

/**
 * @memberof __Server_REST_API_Texts
 * @method
 * @name saveText
 * @description save text
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveText = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var sqlSeq, sqlTextsNew, sqlTextsUpdate, sqlTextsTables, newId, newText;
      sqlSeq = 'SELECT nextval(\'seq_texts_id\') AS id';
      sqlTextsNew = 'INSERT INTO texts(id, text) VALUES($1, $2)';
      sqlTextsTables = 'INSERT INTO texts_tables(table_name, table_id, text_id) VALUES($1, $2, $3)';
      sqlTextsUpdate = 'UPDATE texts SET text = $2 WHERE id = $1';

      if ((!obj.texts || !obj.texts.tableName || !obj.texts.tableId || !req.body.text) || (req.body.text && !req.body.text.text && !req.body.text.id)) {
        //console.log('saveText - krok 1');
        resolve();
        return;
      }
      if (req.body.text.text && !req.body.text.id) {
        //console.log('saveText - krok 2');
        postgres.select(sqlSeq, [], req).then(
          function (result) {
            //console.log('saveText - krok 3');
            newId = tools.getSingleResult(result).id;
            return postgres.executeSQL(req, res, sqlTextsNew, [newId, req.body.text.text], null, obj);
          }
        ).then(
          function () {
            //console.log('saveText - krok 4');
            return postgres.executeSQL(req, res, sqlTextsTables, [obj.texts.tableName, obj.texts.tableId, newId], null, obj);
          }
        ).then(
          function () {
            //console.log('saveText - krok 5');
            resolve({textId: newId});
          },
          function () {
            //console.log('saveText - krok 6');
            reject();
          }
        );
      } else {
        if (req.body.text.text) {
          newText = req.body.text.text;
        } else {
          newText = null;
        }
        //console.log('saveText - krok 7');
        postgres.executeSQL(req, res, sqlTextsUpdate, [req.body.text.id, newText], null, obj).then(
          function () {
            //console.log('saveText - krok 8');
            resolve({textId: req.body.text.id});
          },
          function () {
            //console.log('saveText - krok 9');
            reject();
          }
        );
      }
    } catch (e) {
      //console.log('saveText - krok 10');
      console.log(e);
      reject();
    }
  });
};

/**
 * @memberof __Server_REST_API_Texts
 * @method
 * @name del
 * @description delete text from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.del = function (req, res) {
  return new Promise(function (resolve, reject) {
    try {
      var sqlTexts, sqlTextsTables, sqlProperties;
      sqlTexts = 'DELETE FROM texts WHERE id = $1';
      sqlTextsTables = 'DELETE FROM texts_tables WHERE text_id = $1';

      sqlProperties = postgres.createTransaction(req);

      postgres.executeSQL(req, null, sqlTextsTables, [req.params.id], null, sqlProperties).then(
        function (result) {
          return postgres.executeSQL(req, null, sqlTexts, [req.params.id], null, sqlProperties);
        }
      ).then(
        function () {
          sqlProperties.tx.commit();
          sqlProperties.client.end();
          resolve(constants.OK);
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
 * @memberof __Server_REST_API_Texts
 * @method
 * @name delete
 * @description delete text
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  try {
    texts.del(req).then(
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
