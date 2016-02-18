/*jslint node: true, unparam: true */
'use strict';

/**
 * @file opportunities
 * @fileOverview __Server_REST_API_Opportunities
 */

/**
 * @namespace __Server_REST_API_Opportunities
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  companies = require('./companies'),
  people = require('./people'),
  products = require('./products'),
  units = require('./units'),
  opportunities = require('./opportunities'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name get
 * @description get of opportunity from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.get = function (req, res) {
  var sql, errors, obj, sqlTags;
  req.assert('id', 'ID row not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sql =
      'SELECT ' +
      '  sp.ID, ' +
      '  sp.company_id as "companyId", ' +
      '  sp.subject, ' +
      '  sp.owner_id as "ownerId", ' +
      '  sp.description, ' +
      '  sp.stage_id as "salesPipelineStageId", ' +
      '  sp.chance, ' +
      '  sp.person_id as "personId", ' +
      '  sp.closing_date as "closingDate",' +
      '  sp.status,' +
      '  sp.success,' +
      '  sp.contract_id as "contractId",' +
      '  c.company_name as "companyName", ' +
      '  COALESCE(p.first_name, \'\') || CASE WHEN p.first_name IS NOT NULL THEN \' \' ELSE \'\' END || p.last_name as "personName", ' +
      '  (SELECT MAX(date_event) FROM logging l WHERE table_name = \'SALES_PIPELINE\' AND method = \'POST\' AND pk = $1::varchar) as "created", ' +
      '  (SELECT MAX(date_event) FROM logging l WHERE table_name = \'SALES_PIPELINE\' AND method = \'PUT\' AND pk = $1::varchar) as "updated" ' +
      'FROM ' +
      '  SALES_PIPELINE sp ' +
      '    LEFT JOIN COMPANIES c ON sp.COMPANY_ID = c.ID ' +
      '    LEFT JOIN PEOPLE p ON sp.PERSON_ID = p.ID ' +
      'WHERE sp.ID = $1::integer ';

    sqlTags =
      'SELECT t.* ' +
      'FROM ' +
      '  sales_pipeline_salpipe_tags tv, ' +
      '  sales_pipeline_tags t ' +
      'WHERE ' +
      '  tv.sales_pipeline_id = $1 and ' +
      '  tv.sales_pipeline_tag_id = t.id';

    postgres.select(sql, [req.params.id], req).then(
      function (result) {
        obj = tools.getSingleResult(result);
        // company
        obj.company = obj.companyId ? [{id: obj.companyId, name: obj.companyName}] : [];
        // person
        obj.person = obj.personId ? [{id: obj.personId, name: obj.personName}] : [];
        return postgres.select(sqlTags, [req.params.id], req);
      }
    ).then(
      function (result) {
        obj.opportunityTags = tools.getMultiResult(result);
      }
    ).then(
      function () {
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name put
 * @description put opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  try {
    var vals, sql, errors, sqlProperties,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    // validations
    req.checkBody('id', 'Id not found.').notEmpty();
    req.checkBody('subject', 'Subject not found.').notEmpty();
    req.checkBody('company', 'Company not found.').notEmpty();
    if (req.body.id) {
      req.checkBody('id', tools.getValidationMessage('id', message_valid_number, 0, 100)).isInt();
    }
    if (req.body.subject) {
      req.checkBody('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.company[0] && !req.body.company[0].id) {
      req.checkBody('company', 'Company not found.').notEmpty();
    }
    if (parseInt(req.body.status, 10) > 0) {
      req.checkBody('id', 'Row is not at state Open.').throw();
    }
    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql =
      'UPDATE sales_pipeline set ' +
      '  company_id = $2, ' +
      '  subject = $3, ' +
      //'  owner_id = , ' +
      '  description = $4, ' +
      '  stage_id = $5, ' +
      '  chance = $6, ' +
      '  person_id = $7 ' +
      'WHERE ' +
      '  id = $1';

    sqlProperties = postgres.createTransaction(req);

    vals = [req.body.id, null, req.body.subject, req.body.description, req.body.salesPipelineStageId, req.body.chance, null];
    //console.log('krok 1');
    // create sequence
    companies.smartInsert(req, res, Object.create(req.body), sqlProperties).then(
      function (result) {
        vals[1] = tools.getSingleResult(result).id; // set company id
        //console.log('krok 2');
        // insert person
        return people.smartInsert(req, res, Object.create(req.body), sqlProperties);
      }
    ).then(
      function (result) {
        vals[6] = tools.getSingleResult(result).id; // set person id
        //console.log('krok 3');
        // insert opportunity
        return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
      }
    ).then(
      function (result) {
        //console.log('krok 4');
        // insert person
        return opportunities.saveTags(req, res, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 5');
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
        //tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};


/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name post
 * @description post opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  try {
    var vals, sql, errors, sqlSeq, loginToken, sqlProperties,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH;
    loginToken = req.signedCookies.auth_token;

    // validations
    req.assert('subject', 'Subject not found.').notEmpty();
    req.assert('company', 'Company not found.').notEmpty();
    if (req.body.subject) {
      req.assert('subject', tools.getValidationMessage('subject', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.company[0] && !req.body.company[0].id) {
      req.assert('company', 'Company not found.').notEmpty();
    }
    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sqlSeq = 'SELECT nextval(\'seq_sales_pipeline_id\') AS id, people_id as "ownerId" FROM users_login ul WHERE login_token = $1';
    sql =
      'INSERT INTO sales_pipeline(id, company_id, subject, owner_id, description, stage_id, chance, person_id) ' +
      '  VALUES($1, $2, $3, $4, $5, $6, $7, $8)';

    sqlProperties = postgres.createTransaction(req);

    vals = [null, null, req.body.subject, null, req.body.description, req.body.salesPipelineStageId, req.body.chance, null];
    //console.log('krok 1');
    // create sequence
    postgres.select(sqlSeq, [loginToken], req).then(
      function (result) {
        vals[0] = tools.getSingleResult(result).id;
        req.body.id = vals[0];
        vals[3] = tools.getSingleResult(result).ownerId;
        //console.log('krok 2');
        // insert company
        return companies.smartInsert(req, res, req.body, sqlProperties);
      }
    ).then(
      function (result) {
        vals[1] = tools.getSingleResult(result).id; // set company id
        //console.log('krok 3');
        // insert person
        return people.smartInsert(req, res, req.body, sqlProperties);
      }
    ).then(
      function (result) {
        vals[7] = tools.getSingleResult(result).id; // set person id
        //console.log('krok 4');
        // insert opportunity
        return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
      }
    ).then(
      function (result) {
        //console.log('krok 5');
        // insert person
        return opportunities.saveTags(req, res, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 6');
        tools.sendResponseSuccess({id: vals[0]}, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
        //tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name del
 * @description del opportunity from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.del = function (req, res) {
  var sql, sqlProperties, sqldb, sqlItems, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

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
    sql = 'DELETE FROM sales_pipeline WHERE id = $1::int';
    sqlItems = 'DELETE FROM sales_pipeline_products WHERE sales_pipeline_id = $1::int';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    opportunities.deleteTasksTags(req, res, {id: req.params.id}, sqlProperties).then(
      function () {
        return postgres.executeSQL(req, res, sqlItems, [req.params.id], null, sqlProperties);
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name putItem
 * @description put item of opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.putItem = function (req, res) {
  try {
    var vals, sql, errors, sqlProperties, sqlExist, findId, obj,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    // validations
    req.assert('id', 'Id opportunity not found.').notEmpty();
    if (req.body.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }
    if (!req.body.item || (req.body.item && req.body.item.product[0] && !req.body.item.product[0].id)) {
      req.assert('id', 'Product not found.').isNull();
    }
    if (!req.body.item || (req.body.item && !req.body.item.price)) {
      req.assert('id', 'Price unit not found.').isNull();
    }
    if (!req.body.item || (req.body.item && !req.body.item.amount)) {
      req.assert('id', 'Amount not found.').isNull();
    }
    if (!req.body.item || (req.body.item && req.body.item.product[0] && !tools.isNumber(req.body.item.product[0].id) && !req.body.item.product[0].unit)) {
      req.assert('id', 'Unit not found.').isNull();
    }
    if (!req.body.item || (req.body.item && !req.body.item.number)) {
      req.assert('id', 'Number not found.').isNull();
    }
    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sqlExist = 'SELECT id FROM products p WHERE id = $1';
    sql =
      'UPDATE sales_pipeline_products set ' +
      '  products_id = $3, ' +
      '  price = $4, ' +
      '  amount = $5 ' +
      'WHERE ' +
      '  sales_pipeline_id = $1 ' +
      '  AND number = $2';

    sqlProperties = postgres.createTransaction(req);

    vals = [req.body.id, req.body.item.number, req.body.item.product[0].id, req.body.item.price, req.body.item.amount];
    //console.log('krok 1');
    findId = tools.isNumber(req.body.item.product[0].id) ? req.body.item.product[0].id : -1;
    postgres.select(sqlExist, [findId], req).then(
      function (result) {
        req.body.item.product[0].id = tools.getSingleResult(result).id;
        //console.log('krok 2');
        return tools.isNumber(req.body.item.product[0].id) ? {id: req.body.item.product[0].id} : products.smartInsert(req, res, req.body.item, sqlProperties);
      }
    ).then(
      function () {
        return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 2');
        obj = constants.OK;
        obj.id = vals[0];
        tools.sendResponseSuccess(obj, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
        //tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name postItem
 * @description post item of opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.postItem = function (req, res) {
  try {
    var vals, sql, errors, obj, sqlProperties, sqlExist, findId, codeUnit,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    // validations
    req.assert('id', 'Id opportunity not found.').notEmpty();
    if (req.body.id) {
      req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }
    if (!req.body.item || (req.body.item && req.body.item.product[0] && !req.body.item.product[0].id)) {
      req.assert('id', 'Product not found.').isNull();
    }
    if (!req.body.item || (req.body.item && !req.body.item.price)) {
      req.assert('id', 'Price unit not found.').isNull();
    }
    if (!req.body.item || (req.body.item && !req.body.item.amount)) {
      req.assert('id', 'Amount not found.').isNull();
    }
    if (!req.body.item || (req.body.item && req.body.item.product[0] && !tools.isNumber(req.body.item.product[0].id) && !req.body.item.product[0].unit)) {
      req.assert('id', 'Unit not found.').isNull();
    }
    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sql =
      'INSERT INTO sales_pipeline_products(sales_pipeline_id, number, products_id, price, amount) ' +
      ' VALUES($1, COALESCE((SELECT MAX(NUMBER) FROM sales_pipeline_products spp WHERE sales_pipeline_id = $1), 0) + 1, $2, $3, $4)';
    sqlExist = 'SELECT id FROM products p WHERE id = $1';

    sqlProperties = postgres.createTransaction(req);

    vals = [req.body.id, req.body.item.product[0].id, req.body.item.price, req.body.item.amount];
    //console.log('krok 1');
    findId = tools.isNumber(req.body.item.product[0].id) ? req.body.item.product[0].id : -1;
    postgres.select(sqlExist, [findId], req).then(
      function (result) {
        req.body.item.product[0].id = tools.getSingleResult(result).id;
        //console.log('krok 2');
        codeUnit = req.body.item && req.body.item.product && req.body.item.product[0] && req.body.item.product[0].unit;
        return units.save(req, res, {code: codeUnit}, sqlProperties);
      }
    ).then(
      function (result) {
        //console.log('krok 3');
        return tools.isNumber(req.body.item.product[0].id) ? {id: req.body.item.product[0].id} : products.smartInsert(req, res, req.body.item, sqlProperties);
      }
    ).then(
      function (result) {
        //console.log('krok 4');
        vals[1] = tools.getSingleResult(result).id;
        return postgres.executeSQL(req, res, sql, vals, null, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        // Success, close request
        //console.log('krok 5');
        obj = constants.OK;
        obj.id = vals[0];
        tools.sendResponseSuccess(obj, res, false);
      },
      function (result) {
        tools.sendResponseError(result, res, false);
        //tools.sendResponseError(constants.E500, res, false);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name delItem
 * @description delete item of opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.delItem = function (req, res) {
  var sql, sqlProperties, sqldb, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  req.assert('number', 'Number not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  if (req.params.number) {
    req.assert('number', tools.getValidationMessage('number', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    sql = 'DELETE FROM sales_pipeline_products WHERE sales_pipeline_id = $1::int AND number = $2::int';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    postgres.executeSQL(req, res, sql, [req.params.id, req.params.number], null, sqlProperties).then(
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name listItems
 * @description list items of opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.listItems = function (req, res) {
  try {
    var obj = {rows: [], count: req.query.count},
      page = req.query.page || 1,
      amount = req.query.amount || 10,
      offset = (page * amount) - amount,
      loadCount = parseInt(req.query.loadCount, 10),
      //searchStr = req.query.searchStr ? req.query.searchStr.toUpperCase() : '',
      sortDirection = req.query.sortDirection ? req.query.sortDirection.toUpperCase() : '',
      sortField = req.query.sortField ? req.query.sortField.toUpperCase() : '',
      sql,
      sqlCount,
      accessColumnOrder,
      accessColumnOrderDirection,
      sqlOrderBy,
      sqlOrderByField,
      sqlOrderByDirection;

    // validations
    //req.checkParams('id', 'Id opportunity not found.').notEmpty();
    if (!req.params.id || req.params.id === 'undefined') {
      tools.sendResponseSuccess({count: 0, pageCount: 0}, res, false);
      return;
      //req.checkParams('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
    }

    accessColumnOrder = ['NAME'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' ID ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  p.id, ' +
      '  p.name, ' +
      '  p.unit, ' +
      '  spp.sales_pipeline_id as "salesPipelineId", ' +
      '  spp.number, ' +
      '  spp.products_id as "productId", ' +
      '  spp.price, ' +
      '  spp.amount, ' +
      '  p.short_description as "description" ' +
      'FROM ' +
      '  sales_pipeline_products spp ' +
      '    LEFT JOIN products p ON spp.products_id = p.id ' +
      'WHERE ' +
      '  spp.sales_pipeline_id = $3 ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  sales_pipeline_products spp ' +
      '    LEFT JOIN products p ON spp.products_id = p.id ' +
      'WHERE ' +
      '  spp.sales_pipeline_id = $1 ';

    if (loadCount === 1) {
      postgres.select(sqlCount, [req.params.id], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          tools.sendResponseSuccess(obj, res, false);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, req.params.id], req).then(
        function (result) {
          tools.sendResponseSuccess(tools.getMultiResult(result), res, false);
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name saveTags
 * @description save opportunity tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.saveTags = function (req, res, obj) {
  return new Promise(function (resolve, reject) {
    try {
      var i, l, sql, sqlNewTags, sqlSeq, callbackInsertTag, promiseCount, callbackEmptyEndPromise, sqlExists,
        callbackTagId, sqlExistsAppTag, callbackEmptyEndPromiseError, tmpId;
      sql = 'INSERT INTO sales_pipeline_salpipe_tags(sales_pipeline_id, sales_pipeline_tag_id) VALUES($1, $2)';
      sqlExistsAppTag = 'SELECT 1 AS exist FROM sales_pipeline_salpipe_tags spst WHERE sales_pipeline_id = $1 AND sales_pipeline_tag_id = $2';
      sqlNewTags = 'INSERT INTO sales_pipeline_tags(id, name) VALUES($1, $2)';
      sqlSeq = 'SELECT nextval(\'seq_sales_pipeline_tags_id\') AS id';
      sqlExists = 'SELECT id FROM sales_pipeline_tags spt WHERE name = $1';
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
          return tools.getSingleResult(result).id || postgres.select(sqlSeq, [], req)
            .then(
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
      promiseCount = req.body.opportunityTags ? req.body.opportunityTags.length : 0;
      // exit
      if (!req.body.opportunityTags || (req.body.opportunityTags && req.body.opportunityTags.length === 0)) {
        resolve();
        return;
      }
      for (i = 0, l = req.body.opportunityTags.length; i < l; i += 1) {
        if (!tools.isNumber(req.body.opportunityTags[i].id)) {
          postgres.select(sqlExists, [req.body.opportunityTags[i].name], req)
            .then(callbackTagId(req.body.opportunityTags[i]), callbackEmptyEndPromiseError)
            .then(callbackInsertTag, callbackEmptyEndPromiseError);
        } else {
          // if error then reject
          if (!req.body.opportunityTags[i].id) {
            reject();
          }
          // save tag
          callbackInsertTag(req.body.opportunityTags[i].id);
        }
      }
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name tags
 * @description types of opportunity events
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
    sql = 'SELECT * FROM sales_pipeline_tags spt ORDER BY name ';
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name deleteTasksTags
 * @description delete opportunity tags
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with rows
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.deleteTasksTags = function (req, res, obj, conn) {
  var sql = 'DELETE FROM sales_pipeline_salpipe_tags WHERE sales_pipeline_id = $1::int';
  try {
    return postgres.executeSQL(req, res, sql, [obj.id], null, conn);
  } catch (e) {
    return constants.E500;
  }
};

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name delItem
 * @description del opportunity item from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.delItem = function (req, res) {
  var sql, sqlProperties, sqldb, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

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
    sql = 'DELETE FROM sales_pipeline_products WHERE sales_pipeline_id = $1::int AND number = $2';

    sqldb = postgres.createTransaction(req);
    sqlProperties = {tx: sqldb.tx, client: sqldb.client};
    postgres.executeSQL(req, res, sql, [req.params.id, req.params.number], null, sqlProperties).then(
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name history
 * @description history of opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.history = function (req, res) {
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
    sql = 'SELECT * FROM logging l WHERE table_name = \'SALES_PIPELINE\' AND pk = $1 ORDER BY date_event desc';
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name searchGlobal
 * @description search opportunity global
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
      '  sales_pipeline p ' +
      '  LEFT JOIN companies c ON p.company_id = c.id ' +
      '  LEFT JOIN people pe ON p.person_id = pe.id ' +
      'WHERE ' +
      '  upper(p.subject) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.description) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.company_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR EXISTS (select 1 from sales_pipeline_salpipe_tags sps, sales_pipeline_tags spt where spt.id = sps.sales_pipeline_tag_id and sps.sales_pipeline_id = p.id and upper(spt.name) LIKE \'%\' || upper($1::varchar) || \'%\') ' +
      '  OR EXISTS (select 1 from sales_pipeline_products spp, products pr where spp.products_id = pr.id and spp.sales_pipeline_id = p.id and (upper(pr.name) LIKE \'%\' || upper($1::varchar) || \'%\' OR upper(pr.code) LIKE \'%\' || upper($1::varchar) || \'%\')) ' +
      '  OR upper(pe.email) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.email2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.skype) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.other_im) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.linkedin) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.twitter) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.facebook) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.business_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.assistant_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.home_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.mobile_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.other_phone) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(pe.fax) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
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

/**
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name list
 * @description list of opportunities
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
      owner = req.query.owner || -1,
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

    accessColumnOrder = ['subject', 'price', 'chance', 'companyName', 'ownerName'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : 'subject';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' "' + sqlOrderByField + '" ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  sp.id,sp.subject,c.company_name AS "companyName",p.first_name||\' \'||p.last_name AS "ownerName", sp.chance, ' +
      '  (SELECT SUM(price) FROM sales_pipeline_products spp WHERE sales_pipeline_id = sp.id) AS price ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      ' ( UPPER(sp.subject) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL) ' +
      '  AND ( (($4::integer = 1 AND sp.status = 0) OR $4::integer = -1) ' +
      '  OR (($4::integer = 2 AND sp.status = 1) OR $4::integer = -1) ' +
      '  OR (($4::integer = 3 AND sp.status = 2) OR $4::integer = -1) ' +
      ' ) ' +
      ' AND (sp.owner_id = $5::integer OR $5::integer = -1) ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  sales_pipeline sp, ' +
      '  companies c, ' +
      '  people p ' +
      'WHERE ' +
      '  sp.company_id = c.id AND ' +
      '  sp.owner_id = p.id AND ' +
      '  ( UPPER(sp.subject) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   $1::varchar IS NULL) ' +
      '  AND ( (($2::integer = 1 AND sp.status = 0) OR $2::integer = -1) ' +
      '  OR (($2::integer = 2 AND sp.status = 1) OR $2::integer = -1) ' +
      '  OR (($2::integer = 3 AND sp.status = 2) OR $2::integer = -1) ' +
      ' ) ' +
      ' AND (sp.owner_id = $3::integer OR $3::integer = -1)';

    if (loadCount === 1) {
      postgres.select(sqlCount, [searchStr, type, owner], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset, searchStr, type, owner], req).then(
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name success
 * @description success opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.success = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  req.assert('date', 'Date not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    sql = 'UPDATE sales_pipeline sp SET status = $3::int, success = 1, closing_date = $2::date WHERE id = $1::int AND (status = $4::int OR status IS NULL)';

    postgres.executeSQL(req, res, sql, [req.params.id, req.body.date, constants.OPPORTUNITY_STATUS.SUCCESS, constants.OPPORTUNITY_STATUS.OPEN], null, null).then(
      function (result) {
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name failed
 * @description failed opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.failed = function (req, res) {
  var sql, errors, message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

  req.assert('id', 'Id not found.').notEmpty();
  if (req.params.id) {
    req.assert('id', tools.getValidationMessage('id', message_valid_number, null, null)).isInt();
  }
  req.assert('date', 'Date not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }
  try {
    sql = 'UPDATE sales_pipeline sp SET status = $3::int, success = 0, closing_date = $2::date WHERE id = $1::int AND (status = $4::int OR status IS NULL)';

    postgres.executeSQL(req, res, sql, [req.params.id, req.body.date, constants.OPPORTUNITY_STATUS.FAILED, constants.OPPORTUNITY_STATUS.OPEN], null, null).then(
      function (result) {
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
 * @memberof __Server_REST_API_Opportunities
 * @method
 * @name open
 * @description open opportunity
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.open = function (req, res) {
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
    sql = 'UPDATE sales_pipeline sp SET status = $2::int, success = 0 WHERE id = $1::int AND status <> $2::int';

    postgres.executeSQL(req, res, sql, [req.params.id, constants.OPPORTUNITY_STATUS.OPEN], null, null).then(
      function (result) {
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

