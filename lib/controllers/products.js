/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 27.04.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file products
 * @fileOverview __Server_REST_API_Products
 */

/**
 * @namespace __Server_REST_API_Products
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  Promise = require('promise'),
  units = require('./units'),
  attachments = require('./attachments');

/**
 * @memberof __Server_REST_API_Products
 * @method
 * @name search
 * @description search in products
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.search = function (req, res) {
  var sql =
    'SELECT ' +
    '  p.id, ' +
    '  p.code,  ' +
    '  p.name, ' +
    '  p.unit, ' +
    '  p.price_1 as price1 ' +
    'FROM ' +
    '  products p ' +
    'WHERE ' +
    '  UPPER(name) LIKE $1::varchar ' +
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
 * @memberof __Server_REST_API_Products
 * @method
 * @name smartInsert
 * @description smart insert Products (name)
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param obj {Object} object with properties
 * @param conn {Object} object with connection
 * @returns Promise
 */
exports.smartInsert = function (req, res, obj, conn) {
  return new Promise(function (resolve, reject) {
    var sql, sqlSeq, row;
    sqlSeq = 'SELECT nextval(\'seq_product_id\') AS id';
    sql = 'INSERT INTO products(id, name, price_1, unit, short_description) VALUES($1, $2, $3, $4, $5)';
    try {
      obj.product = obj.product || [];
      if (!obj.product[0] || (obj.product[0] && tools.isNumber(obj.product[0].id))) {
        resolve({id: (obj.product[0] ? obj.product[0].id : null)});
        return;
      }

      postgres.select(sqlSeq, [], req).then(
        function (result) {
          row = tools.getSingleResult(result);
          postgres.executeSQL(req, res, sql, [row.id, obj.product[0].name, obj.product[0].price, obj.product[0].unit, obj.product[0].shortDescription], null, conn).then(
            function () {
              obj.id = row.id;
              resolve(obj);
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
 * @memberof __Server_REST_API_Products
 * @method
 * @name list
 * @description list of products
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

    accessColumnOrder = ['CODE', 'NAME'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' NAME ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  p.code, p.name, p.id, p.rrp||\' \'||p.currency_rrp AS "rrpCurr" ' +
      'FROM ' +
      '  PRODUCTS p ' +
      'WHERE ' +
      '  UPPER(p.CODE) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  UPPER(p.NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '   OR ' +
      '  $3::varchar IS NULL ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  PRODUCTS p ' +
      'WHERE ' +
      '   UPPER(p.CODE) LIKE \'%\' || $1::varchar || \'%\' ' +
      '    OR ' +
      '   UPPER(p.NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
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
 * @memberof __Server_REST_API_Products
 * @method
 * @name delete
 * @description delete from PRODUCTS
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  var errors, sql = 'DELETE FROM PRODUCTS WHERE ID = $1',
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
      function () {
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
 * @memberof __Server_REST_API_Products
 * @method
 * @name get
 * @description get product from DB
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
      'p.id, ' +
      'p.code, ' +
      'p.name, ' +
      'p.short_description as "shortDescription", ' +
      'p.full_description as "fullDescription", ' +
      'p.unit, ' +
      'p.rrp as "priceRrp", ' +
      'p.picture, ' +
      'p.price_1 as "price1", ' +
      'p.price_2 as "price2", ' +
      'p.price_3 as "price3", ' +
      'p.price_4 as "price4", ' +
      'p.price_5 as "price5", ' +
      'p.currency_rrp as "currencyRrp", ' +
      'p.currency_1 as "currency1", ' +
      'p.currency_2 as "currency2", ' +
      'p.currency_3 as "currency3", ' +
      'p.currency_4 as "currency4", ' +
      'p.currency_5 as "currency5", ' +
      '(SELECT MAX(attachment_id) FROM attachments_tables at WHERE table_id=$1::integer AND table_name=\'' + constants.ATTACHMENTS_TYPES.PRODUCT + '\') AS "pictureId" ' +
      'FROM PRODUCTS p ' +
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
 * @memberof __Server_REST_API_Products
 * @method
 * @name post
 * @description post product to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.post = function (req, res) {
  try {
    var sql, sqlSeq, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('code', 'CODE not found.').notEmpty();
    if (req.body.code) {
      req.assert('code', tools.getValidationMessage('code', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.name) {
      req.assert('name', tools.getValidationMessage('name', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.shortDescription) {
      req.assert('shortDescription', tools.getValidationMessage('shortDescription', message_valid_length, 0, 255)).len(0, 255);
    }
    if (req.body.priceRrp) {
      req.assert('priceRrp', tools.getValidationMessage('priceRrp', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price1) {
      req.assert('price1', tools.getValidationMessage('price1', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price2) {
      req.assert('price2', tools.getValidationMessage('price2', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price3) {
      req.assert('price3', tools.getValidationMessage('price3', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price4) {
      req.assert('price4', tools.getValidationMessage('price4', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price5) {
      req.assert('price5', tools.getValidationMessage('price5', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.unit) {
      req.assert('unit', tools.getValidationMessage('unit', message_valid_length, 0, 10)).len(0, 10);
    }
    if (req.body.currencyRrp) {
      req.assert('currencyRrp', tools.getValidationMessage('currencyRrp', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency1) {
      req.assert('currency1', tools.getValidationMessage('currency1', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency2) {
      req.assert('currency2', tools.getValidationMessage('currency2', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency3) {
      req.assert('currency3', tools.getValidationMessage('currency3', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency4) {
      req.assert('currency4', tools.getValidationMessage('currency4', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency5) {
      req.assert('currency5', tools.getValidationMessage('currency5', message_valid_length, 0, 3)).len(0, 3);
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }

    sqlSeq = 'SELECT nextval(\'seq_product_id\') AS id';
    sql =
      'INSERT INTO PRODUCTS (' +
      'ID, CODE, NAME, SHORT_DESCRIPTION, RRP, PRICE_1, PRICE_2, PRICE_3, PRICE_4, PRICE_5, UNIT, ' +
      'CURRENCY_RRP, CURRENCY_1, CURRENCY_2, CURRENCY_3, CURRENCY_4, CURRENCY_5) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)';
    /*FULL_DESCRIPTION, PICTURE*/
    sqldb = postgres.createTransaction(req);

    vals = [null, req.body.code, req.body.name, req.body.shortDescription, req.body.priceRrp,
      req.body.price1, req.body.price2, req.body.price3, req.body.price4, req.body.price5, req.body.unit,
      req.body.currencyRrp, req.body.currency1, req.body.currency2, req.body.currency3, req.body.currency4, req.body.currency5];

    units.save(req, res, null, null).then(
      function () {
        postgres.select(sqlSeq, [], req).then(
          function (result) {
            vals[0] = tools.getSingleResult(result).id;
            return postgres.executeSQL(req, res, sql, vals, null, sqldb);
          }
        ).then(
          function () {
            sqldb.tx.commit();
            sqldb.client.end();
            tools.sendResponseSuccess({id: vals[0]}, res, false);
          },
          function () {
            tools.sendResponseError(constants.E500, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Products
 * @method
 * @name put
 * @description put product to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  try {
    var sql, sqldb, vals, errors,
      message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
      message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;

    req.assert('id', 'ID not found.').notEmpty();
    req.assert('id', 'ID must be integer').isInt();
    req.assert('code', 'CODE not found.').notEmpty();
    if (req.body.code) {
      req.assert('code', tools.getValidationMessage('code', message_valid_length, 0, 40)).len(0, 40);
    }
    if (req.body.name) {
      req.assert('name', tools.getValidationMessage('name', message_valid_length, 0, 100)).len(0, 100);
    }
    if (req.body.shortDescription) {
      req.assert('shortDescription', tools.getValidationMessage('shortDescription', message_valid_length, 0, 255)).len(0, 255);
    }
    if (req.body.priceRrp) {
      req.assert('priceRrp', tools.getValidationMessage('priceRrp', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price1) {
      req.assert('price1', tools.getValidationMessage('price1', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price2) {
      req.assert('price2', tools.getValidationMessage('price2', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price3) {
      req.assert('price3', tools.getValidationMessage('price3', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price4) {
      req.assert('price4', tools.getValidationMessage('price4', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.price5) {
      req.assert('price5', tools.getValidationMessage('price5', message_valid_number, 0, 100)).isFloat();
    }
    if (req.body.unit) {
      req.assert('unit', tools.getValidationMessage('unit', message_valid_length, 0, 10)).len(0, 10);
    }
    if (req.body.currencyRrp) {
      req.assert('currencyRrp', tools.getValidationMessage('currencyRrp', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency1) {
      req.assert('currency1', tools.getValidationMessage('currency1', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency2) {
      req.assert('currency2', tools.getValidationMessage('currency2', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency3) {
      req.assert('currency3', tools.getValidationMessage('currency3', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency4) {
      req.assert('currency4', tools.getValidationMessage('currency4', message_valid_length, 0, 3)).len(0, 3);
    }
    if (req.body.currency5) {
      req.assert('currency5', tools.getValidationMessage('currency5', message_valid_length, 0, 3)).len(0, 3);
    }

    errors = req.validationErrors();
    if (errors) {
      res.json(errors);
      return;
    }
    sql = // ?? updatovat CODE ??
      'UPDATE PRODUCTS SET ' +
      '  CODE = $2, ' +
      '  NAME = $3, ' +
      '  SHORT_DESCRIPTION = $4, ' +
      '  RRP = $5, ' +
      '  PRICE_1 = $6, ' +
      '  PRICE_2 = $7, ' +
      '  PRICE_3 = $8, ' +
      '  PRICE_4 = $9, ' +
      '  PRICE_5 = $10, ' +
      '  UNIT = $11, ' +
      '  CURRENCY_RRP = $12, ' +
      '  CURRENCY_1 = $13, ' +
      '  CURRENCY_2 = $14, ' +
      '  CURRENCY_3 = $15, ' +
      '  CURRENCY_4 = $16, ' +
      '  CURRENCY_5 = $17 ' +
      'WHERE ' +
      '  ID = $1';

    sqldb = postgres.createTransaction(req);

    vals = [req.body.id, req.body.code, req.body.name, req.body.shortDescription, req.body.priceRrp,
      req.body.price1, req.body.price2, req.body.price3, req.body.price4, req.body.price5, req.body.unit,
      req.body.currencyRrp, req.body.currency1, req.body.currency2, req.body.currency3, req.body.currency4, req.body.currency5];

    units.save(req, res).then(
      function () {
        postgres.executeSQL(req, res, sql, vals, null, sqldb).then(
          function () {
            sqldb.tx.commit();
            sqldb.client.end();
            tools.sendResponseSuccess({id: vals[0]}, res, false);
          },
          function () {
            tools.sendResponseError(constants.E500, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Products
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
