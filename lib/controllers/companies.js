/*jslint node: true, unparam: true */
'use strict';

/**
 * @file companies
 * @fileOverview __Server_REST_API_Companies
 */

/**
 * @namespace __Server_REST_API_Companies
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  fs = require('fs'),
  constants = require('./constants'),
  exportsFactory = require('./exports_factory'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_Companies
 * @method
 * @name list
 * @description list of companies from DB
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

    accessColumnOrder = ['COMPANY_NAME', 'RATING'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' ID ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT c.ID, c.COMPANY_NAME AS companyname ' +
      'FROM ' +
      '  companies c ' +
      'WHERE ' +
      ' (UPPER(c.COMPANY_NAME) LIKE \'%\' || $3::varchar || \'%\' ' +
      '  OR $3::varchar IS NULL)' +
      ' and (exists (select 1 from sales_pipeline s where c.id=s.company_id and s.status=0) ' +
      '  OR $4::integer = -1) ' +
      ' ORDER BY ' +
      sqlOrderBy +
      ' LIMIT $1::integer ' +
      ' OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  companies c ' +
      'WHERE ' +
      '  (UPPER(c.COMPANY_NAME) LIKE \'%\' || $1::varchar || \'%\' ' +
      '  OR $1::varchar IS NULL) ' +
      ' and (exists (select 1 from sales_pipeline s where c.id=s.company_id and s.status=0) ' +
      '  OR $2::integer = -1) ';

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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name get
 * @description get company from DB
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
    sql = 'SELECT ' +
      '  c.*,con.iso AS country_1_name ' +
      'FROM ' +
      '  companies AS c ' +
      '  LEFT JOIN countries AS con ON con.id = c.address_country_1 ' +
      'WHERE ' +
      '  c.id = $1::integer ';

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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name post
 * @description post company to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param noCloseReq {Boolean} no request
 * @returns Promise
 */
exports.post = function (req, res, noCloseReq) {
  var vals, sql, sqlSeq, errors, loginToken,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;
  loginToken = req.signedCookies.auth_token;
  // validations
  req.assert('company_name', 'Name of company not found.').notEmpty();
  req.assert('reg_id', tools.getValidationMessage('reg_id', message_valid_length, 0, 20)).len(0, 20);
  req.assert('vat_id', tools.getValidationMessage('vat_id', message_valid_length, 0, 20)).len(0, 20);
  req.assert('company_name', tools.getValidationMessage('company_name', message_valid_length, 0, 255)).len(0, 255);
  if (req.body.company_group) {
    req.assert('company_group', tools.getValidationMessage('company_group', message_valid_number, null, null)).isInt();
  }
  req.assert('address_tag_1', tools.getValidationMessage('address_tag_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_1', tools.getValidationMessage('address_street_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_1', tools.getValidationMessage('address_city_1', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_1) && req.body.address_zip_1) {
    req.assert('address_zip_1', tools.getValidationMessage('address_zip_1', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_1', tools.getValidationMessage('address_zip_1', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_1', tools.getValidationMessage('address_region_1', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_1) && req.body.phone_1_1) {
    req.assert('phone_1_1', tools.getValidationMessage('phone_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_1', tools.getValidationMessage('phone_1_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_1_tag', tools.getValidationMessage('phone_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_2) && req.body.phone_1_2) {
    req.assert('phone_1_2', tools.getValidationMessage('phone_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_2', tools.getValidationMessage('phone_1_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_2_tag', tools.getValidationMessage('phone_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_3) && req.body.phone_1_3) {
    req.assert('phone_1_3', tools.getValidationMessage('phone_1_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_3', tools.getValidationMessage('phone_1_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_3_tag', tools.getValidationMessage('phone_1_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_1) && req.body.email_1_1) {
    req.assert('email_1_1', tools.getValidationMessage('email_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_1', tools.getValidationMessage('email_1_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_1_tag', tools.getValidationMessage('email_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_2) && req.body.email_1_2) {
    req.assert('email_1_2', tools.getValidationMessage('email_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_2', tools.getValidationMessage('email_1_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_2_tag', tools.getValidationMessage('email_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_3) && req.body.email_1_3) {
    req.assert('email_1_3', tools.getValidationMessage('email_1_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_3', tools.getValidationMessage('email_1_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_3_tag', tools.getValidationMessage('email_1_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_1_1) && req.body.fax_1_1) {
    req.assert('fax_1_1', tools.getValidationMessage('fax_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_1_1', tools.getValidationMessage('fax_1_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_1_1_tag', tools.getValidationMessage('fax_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_1_2) && req.body.fax_1_2) {
    req.assert('fax_1_2', tools.getValidationMessage('fax_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_1_2', tools.getValidationMessage('fax_1_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_1_2_tag', tools.getValidationMessage('fax_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_tag_2', tools.getValidationMessage('address_tag_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_2', tools.getValidationMessage('address_street_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_2', tools.getValidationMessage('address_city_2', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_2) && req.body.address_zip_2) {
    req.assert('address_zip_2', tools.getValidationMessage('address_zip_2', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_2', tools.getValidationMessage('address_zip_2', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_2', tools.getValidationMessage('address_region_2', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_1) && req.body.phone_2_1) {
    req.assert('phone_2_1', tools.getValidationMessage('phone_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_1', tools.getValidationMessage('phone_2_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_1_tag', tools.getValidationMessage('phone_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_2) && req.body.phone_2_2) {
    req.assert('phone_2_2', tools.getValidationMessage('phone_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_2', tools.getValidationMessage('phone_2_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_2_tag', tools.getValidationMessage('phone_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_3) && req.body.phone_2_3) {
    req.assert('phone_2_3', tools.getValidationMessage('phone_2_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_3', tools.getValidationMessage('phone_2_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_3_tag', tools.getValidationMessage('phone_2_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_1) && req.body.email_2_1) {
    req.assert('email_2_1', tools.getValidationMessage('email_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_1', tools.getValidationMessage('email_2_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_1_tag', tools.getValidationMessage('email_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_2) && req.body.email_2_2) {
    req.assert('email_2_2', tools.getValidationMessage('email_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_2', tools.getValidationMessage('email_2_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_2_tag', tools.getValidationMessage('email_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_3) && req.body.email_2_3) {
    req.assert('email_2_3', tools.getValidationMessage('email_2_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_3', tools.getValidationMessage('email_2_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_3_tag', tools.getValidationMessage('email_2_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_2_1) && req.body.fax_2_1) {
    req.assert('fax_2_1', tools.getValidationMessage('fax_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_2_1', tools.getValidationMessage('fax_2_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_2_1_tag', tools.getValidationMessage('fax_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_2_2) && req.body.fax_2_2) {
    req.assert('fax_2_2', tools.getValidationMessage('fax_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_2_2', tools.getValidationMessage('fax_2_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_2_2_tag', tools.getValidationMessage('fax_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_tag_3', tools.getValidationMessage('address_tag_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_3', tools.getValidationMessage('address_street_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_3', tools.getValidationMessage('address_city_3', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_3) && req.body.address_zip_3) {
    req.assert('address_zip_3', tools.getValidationMessage('address_zip_3', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_3', tools.getValidationMessage('address_zip_3', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_3', tools.getValidationMessage('address_region_3', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_1) && req.body.phone_3_1) {
    req.assert('phone_3_1', tools.getValidationMessage('phone_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_1', tools.getValidationMessage('phone_3_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_1_tag', tools.getValidationMessage('phone_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_2) && req.body.phone_3_2) {
    req.assert('phone_3_2', tools.getValidationMessage('phone_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_2', tools.getValidationMessage('phone_3_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_2_tag', tools.getValidationMessage('phone_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_3) && req.body.phone_3_3) {
    req.assert('phone_3_3', tools.getValidationMessage('phone_3_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_3', tools.getValidationMessage('phone_3_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_3_tag', tools.getValidationMessage('phone_3_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_1) && req.body.email_3_1) {
    req.assert('email_3_1', tools.getValidationMessage('email_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_1', tools.getValidationMessage('email_3_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_1_tag', tools.getValidationMessage('email_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_2) && req.body.email_3_2) {
    req.assert('email_3_2', tools.getValidationMessage('email_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_2', tools.getValidationMessage('email_3_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_2_tag', tools.getValidationMessage('email_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_3) && req.body.email_3_3) {
    req.assert('email_3_3', tools.getValidationMessage('email_3_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_3', tools.getValidationMessage('email_3_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_3_tag', tools.getValidationMessage('email_3_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_3_1) && req.body.fax_3_1) {
    req.assert('fax_3_1', tools.getValidationMessage('fax_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_3_1', tools.getValidationMessage('fax_3_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_3_1_tag', tools.getValidationMessage('fax_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_3_2) && req.body.fax_3_2) {
    req.assert('fax_3_2', tools.getValidationMessage('fax_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_3_2', tools.getValidationMessage('fax_3_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_3_2_tag', tools.getValidationMessage('fax_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_1', tools.getValidationMessage('website_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_2', tools.getValidationMessage('website_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_3', tools.getValidationMessage('website_3', message_valid_length, 0, 100)).len(0, 100);

  req.assert('facebook_1', tools.getValidationMessage('facebook_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook_2', tools.getValidationMessage('facebook_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook_3', tools.getValidationMessage('facebook_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_1', tools.getValidationMessage('google_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_2', tools.getValidationMessage('google_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_3', tools.getValidationMessage('google_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_1', tools.getValidationMessage('twitter_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_2', tools.getValidationMessage('twitter_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_3', tools.getValidationMessage('twitter_3', message_valid_length, 0, 100)).len(0, 100);

  if (req.body.category) {
    req.assert('category', tools.getValidationMessage('category', message_valid_number, null, null)).isInt();
  }
  if (req.body.subcategory) {
    req.assert('subcategory', tools.getValidationMessage('subcategory', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_1) {
    req.assert('address_country_1', tools.getValidationMessage('address_country_1', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_2) {
    req.assert('address_country_2', tools.getValidationMessage('address_country_2', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_3) {
    req.assert('address_country_3', tools.getValidationMessage('address_country_3', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return null;
  }
  tools.setNullForEmpty(req.body);

  sqlSeq =
    'SELECT ' +
    (req.body.id ? 'null' : 'nextval(\'seq_companies_id\')') + ' AS id, ' +
    '  current_timestamp as "currentTimestamp", ' +
    '  (SELECT login_name FROM users_login ul WHERE login_token = $1) as "currentUser", ' +
    '  (SELECT people_id FROM users_login ul WHERE login_token = $1) as "ownerId" ';

  sql =
    'INSERT INTO COMPANIES ' +
    '  (id, reg_id, vat_id, company_name, company_group, address_tag_1, address_street_1, address_city_1, address_zip_1, address_region_1, ' +
    '  phone_1_1, phone_1_1_tag, phone_1_2, phone_1_2_tag, phone_1_3, phone_1_3_tag, email_1_1, email_1_1_tag, email_1_2, email_1_2_tag, ' +
    '  email_1_3, email_1_3_tag, fax_1_1, fax_1_1_tag, fax_1_2, fax_1_2_tag, address_tag_2, address_street_2, address_city_2, address_zip_2, ' +
    '  address_region_2, phone_2_1, phone_2_1_tag, phone_2_2, phone_2_2_tag, phone_2_3, phone_2_3_tag, email_2_1, email_2_1_tag, email_2_2, ' +
    '  email_2_2_tag, email_2_3, email_2_3_tag, fax_2_1, fax_2_1_tag, fax_2_2, fax_2_2_tag, address_tag_3, address_street_3, address_city_3, ' +
    '  address_zip_3, address_region_3, phone_3_1, phone_3_1_tag, phone_3_2, phone_3_2_tag, phone_3_3, phone_3_3_tag, email_3_1, email_3_1_tag, ' +
    '  email_3_2, email_3_2_tag, email_3_3, email_3_3_tag, fax_3_1, fax_3_1_tag, fax_3_2, fax_3_2_tag, website_1, website_2, ' +
    '  website_3, facebook_1, google_1, twitter_1, category, subcategory, address_country_1, address_country_2, address_country_3, facebook_2, ' +
    '  google_2, twitter_2, facebook_3, google_3, twitter_3, rating, last_date, last_user, owner_id) ' +
    'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,' +
    '  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,' +
    '  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,' +
    '  $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,' +
    '  $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,' +
    '  $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,' +
    '  $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,' +
    '  $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,' +
    '  $81, $82, $83, $84, $85, $86, $87, $88, $89)';

  try {
    vals = [null, req.body.reg_id, req.body.vat_id, req.body.company_name, req.body.company_group, req.body.address_tag_1, req.body.address_street_1, req.body.address_city_1, req.body.address_zip_1, req.body.address_region_1,
      req.body.phone_1_1, req.body.phone_1_1_tag, req.body.phone_1_2, req.body.phone_1_2_tag, req.body.phone_1_3, req.body.phone_1_3_tag, req.body.email_1_1, req.body.email_1_1_tag, req.body.email_1_2, req.body.email_1_2_tag,
      req.body.email_1_3, req.body.email_1_3_tag, req.body.fax_1_1, req.body.fax_1_1_tag, req.body.fax_1_2, req.body.fax_1_2_tag, req.body.address_tag_2, req.body.address_street_2, req.body.address_city_2, req.body.address_zip_2,
      req.body.address_region_2, req.body.phone_2_1, req.body.phone_2_1_tag, req.body.phone_2_2, req.body.phone_2_2_tag, req.body.phone_2_3, req.body.phone_2_3_tag, req.body.email_2_1, req.body.email_2_1_tag, req.body.email_2_2, req.body.email_2_2_tag,
      req.body.email_2_3, req.body.email_2_3_tag, req.body.fax_2_1, req.body.fax_2_1_tag, req.body.fax_2_2, req.body.fax_2_2_tag, req.body.address_tag_3, req.body.address_street_3, req.body.address_city_3, req.body.address_zip_3,
      req.body.address_region_3, req.body.phone_3_1, req.body.phone_3_1_tag, req.body.phone_3_2, req.body.phone_3_2_tag, req.body.phone_3_3, req.body.phone_3_3_tag, req.body.email_3_1, req.body.email_3_1_tag, req.body.email_3_2,
      req.body.email_3_2_tag, req.body.email_3_3, req.body.email_3_3_tag, req.body.fax_3_1, req.body.fax_3_1_tag, req.body.fax_3_2, req.body.fax_3_2_tag, req.body.website_1, req.body.website_2, req.body.website_3,
      req.body.facebook_1, req.body.google_1, req.body.twitter_1, req.body.category, req.body.subcategory, req.body.address_country_1, req.body.address_country_2, req.body.address_country_3, req.body.facebook_2,
      req.body.google_2, req.body.twitter_2, req.body.facebook_3, req.body.google_3, req.body.twitter_3, req.body.rating, null, null, null];

    return postgres.select(sqlSeq, [loginToken], req).then(
      function (result) {
        vals[0] = tools.getSingleResult(result).id || req.body.id;
        vals[86] = tools.getSingleResult(result).currentTimestamp;
        vals[87] = tools.getSingleResult(result).currentUser;
        vals[88] = tools.getSingleResult(result).ownerId;
        return postgres.executeSQL(req, res, sql, vals);
      },
      function (result) {
        tools.sendResponseError(result, res, noCloseReq);
      }
    ).then(
      function () {
        return tools.sendResponseSuccess({id: vals[0]}, res, noCloseReq);
      },
      function (result) {
        tools.sendResponseError(result, res, noCloseReq);
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, noCloseReq);
  }
};

/**
 * @memberof __Server_REST_API_Companies
 * @method
 * @name put
 * @description put company to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.put = function (req, res) {
  var vals, sql, errors,
    message_valid_length = constants.MESSAGE_VALIDATION_LENGTH,
    message_valid_format = constants.MESSAGE_VALIDATION_FORMAT,
    message_valid_number = constants.MESSAGE_VALIDATION_NUMBER;
  // validations
  req.assert('id', 'ID row not found.').notEmpty();
  req.assert('id', 'ID must be integer').isInt();
  req.assert('reg_id', tools.getValidationMessage('reg_id', message_valid_length, 0, 20)).len(0, 20);
  req.assert('vat_id', tools.getValidationMessage('vat_id', message_valid_length, 0, 20)).len(0, 20);
  req.assert('company_name', tools.getValidationMessage('company_name', message_valid_length, 0, 255)).len(0, 255);
  if (req.body.company_group) {
    req.assert('company_group', tools.getValidationMessage('company_group', message_valid_number, null, null)).isInt();
  }
  req.assert('address_tag_1', tools.getValidationMessage('address_tag_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_1', tools.getValidationMessage('address_street_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_1', tools.getValidationMessage('address_city_1', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_1) && req.body.address_zip_1) {
    req.assert('address_zip_1', tools.getValidationMessage('address_zip_1', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_1', tools.getValidationMessage('address_zip_1', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_1', tools.getValidationMessage('address_region_1', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_1) && req.body.phone_1_1) {
    req.assert('phone_1_1', tools.getValidationMessage('phone_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_1', tools.getValidationMessage('phone_1_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_1_tag', tools.getValidationMessage('phone_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_2) && req.body.phone_1_2) {
    req.assert('phone_1_2', tools.getValidationMessage('phone_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_2', tools.getValidationMessage('phone_1_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_2_tag', tools.getValidationMessage('phone_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_1_3) && req.body.phone_1_3) {
    req.assert('phone_1_3', tools.getValidationMessage('phone_1_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_1_3', tools.getValidationMessage('phone_1_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_1_3_tag', tools.getValidationMessage('phone_1_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_1) && req.body.email_1_1) {
    req.assert('email_1_1', tools.getValidationMessage('email_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_1', tools.getValidationMessage('email_1_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_1_tag', tools.getValidationMessage('email_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_2) && req.body.email_1_2) {
    req.assert('email_1_2', tools.getValidationMessage('email_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_2', tools.getValidationMessage('email_1_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_2_tag', tools.getValidationMessage('email_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_1_3) && req.body.email_1_3) {
    req.assert('email_1_3', tools.getValidationMessage('email_1_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_1_3', tools.getValidationMessage('email_1_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_1_3_tag', tools.getValidationMessage('email_1_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_1_1) && req.body.fax_1_1) {
    req.assert('fax_1_1', tools.getValidationMessage('fax_1_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_1_1', tools.getValidationMessage('fax_1_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_1_1_tag', tools.getValidationMessage('fax_1_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_1_2) && req.body.fax_1_2) {
    req.assert('fax_1_2', tools.getValidationMessage('fax_1_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_1_2', tools.getValidationMessage('fax_1_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_1_2_tag', tools.getValidationMessage('fax_1_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_tag_2', tools.getValidationMessage('address_tag_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_2', tools.getValidationMessage('address_street_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_2', tools.getValidationMessage('address_city_2', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_2) && req.body.address_zip_2) {
    req.assert('address_zip_2', tools.getValidationMessage('address_zip_2', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_2', tools.getValidationMessage('address_zip_2', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_2', tools.getValidationMessage('address_region_2', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_1) && req.body.phone_2_1) {
    req.assert('phone_2_1', tools.getValidationMessage('phone_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_1', tools.getValidationMessage('phone_2_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_1_tag', tools.getValidationMessage('phone_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_2) && req.body.phone_2_2) {
    req.assert('phone_2_2', tools.getValidationMessage('phone_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_2', tools.getValidationMessage('phone_2_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_2_tag', tools.getValidationMessage('phone_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_2_3) && req.body.phone_2_3) {
    req.assert('phone_2_3', tools.getValidationMessage('phone_2_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_2_3', tools.getValidationMessage('phone_2_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_2_3_tag', tools.getValidationMessage('phone_2_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_1) && req.body.email_2_1) {
    req.assert('email_2_1', tools.getValidationMessage('email_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_1', tools.getValidationMessage('email_2_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_1_tag', tools.getValidationMessage('email_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_2) && req.body.email_2_2) {
    req.assert('email_2_2', tools.getValidationMessage('email_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_2', tools.getValidationMessage('email_2_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_2_tag', tools.getValidationMessage('email_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_2_3) && req.body.email_2_3) {
    req.assert('email_2_3', tools.getValidationMessage('email_2_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_2_3', tools.getValidationMessage('email_2_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_2_3_tag', tools.getValidationMessage('email_2_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_2_1) && req.body.fax_2_1) {
    req.assert('fax_2_1', tools.getValidationMessage('fax_2_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_2_1', tools.getValidationMessage('fax_2_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_2_1_tag', tools.getValidationMessage('fax_2_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_2_2) && req.body.fax_2_2) {
    req.assert('fax_2_2', tools.getValidationMessage('fax_2_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_2_2', tools.getValidationMessage('fax_2_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_2_2_tag', tools.getValidationMessage('fax_2_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_tag_3', tools.getValidationMessage('address_tag_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_street_3', tools.getValidationMessage('address_street_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('address_city_3', tools.getValidationMessage('address_city_3', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateZip(req.body.address_zip_3) && req.body.address_zip_3) {
    req.assert('address_zip_3', tools.getValidationMessage('address_zip_3', message_valid_format, null, null)).isNull();
  }
  req.assert('address_zip_3', tools.getValidationMessage('address_zip_3', message_valid_length, 0, 20)).len(0, 20);
  req.assert('address_region_3', tools.getValidationMessage('address_region_3', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_1) && req.body.phone_3_1) {
    req.assert('phone_3_1', tools.getValidationMessage('phone_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_1', tools.getValidationMessage('phone_3_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_1_tag', tools.getValidationMessage('phone_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_2) && req.body.phone_3_2) {
    req.assert('phone_3_2', tools.getValidationMessage('phone_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_2', tools.getValidationMessage('phone_3_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_2_tag', tools.getValidationMessage('phone_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.phone_3_3) && req.body.phone_3_3) {
    req.assert('phone_3_3', tools.getValidationMessage('phone_3_3', message_valid_format, null, null)).isNull();
  }
  req.assert('phone_3_3', tools.getValidationMessage('phone_3_3', message_valid_length, 0, 30)).len(0, 30);
  req.assert('phone_3_3_tag', tools.getValidationMessage('phone_3_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_1) && req.body.email_3_1) {
    req.assert('email_3_1', tools.getValidationMessage('email_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_1', tools.getValidationMessage('email_3_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_1_tag', tools.getValidationMessage('email_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_2) && req.body.email_3_2) {
    req.assert('email_3_2', tools.getValidationMessage('email_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_2', tools.getValidationMessage('email_3_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_2_tag', tools.getValidationMessage('email_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validateEmail(req.body.email_3_3) && req.body.email_3_3) {
    req.assert('email_3_3', tools.getValidationMessage('email_3_3', message_valid_format, null, null)).isNull();
  }
  req.assert('email_3_3', tools.getValidationMessage('email_3_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('email_3_3_tag', tools.getValidationMessage('email_3_3_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_3_1) && req.body.fax_3_1) {
    req.assert('fax_3_1', tools.getValidationMessage('fax_3_1', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_3_1', tools.getValidationMessage('fax_3_1', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_3_1_tag', tools.getValidationMessage('fax_3_1_tag', message_valid_length, 0, 100)).len(0, 100);
  if (!tools.validatePhone(req.body.fax_3_2) && req.body.fax_3_2) {
    req.assert('fax_3_2', tools.getValidationMessage('fax_3_2', message_valid_format, null, null)).isNull();
  }
  req.assert('fax_3_2', tools.getValidationMessage('fax_3_2', message_valid_length, 0, 30)).len(0, 30);
  req.assert('fax_3_2_tag', tools.getValidationMessage('fax_3_2_tag', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_1', tools.getValidationMessage('website_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_2', tools.getValidationMessage('website_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('website_3', tools.getValidationMessage('website_3', message_valid_length, 0, 100)).len(0, 100);

  req.assert('facebook_1', tools.getValidationMessage('facebook_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook_2', tools.getValidationMessage('facebook_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('facebook_3', tools.getValidationMessage('facebook_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_1', tools.getValidationMessage('google_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_2', tools.getValidationMessage('google_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('google_3', tools.getValidationMessage('google_3', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_1', tools.getValidationMessage('twitter_1', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_2', tools.getValidationMessage('twitter_2', message_valid_length, 0, 100)).len(0, 100);
  req.assert('twitter_3', tools.getValidationMessage('twitter_3', message_valid_length, 0, 100)).len(0, 100);

  if (req.body.category) {
    req.assert('category', tools.getValidationMessage('category', message_valid_number, null, null)).isInt();
  }
  if (req.body.subcategory) {
    req.assert('subcategory', tools.getValidationMessage('subcategory', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_1) {
    req.assert('address_country_1', tools.getValidationMessage('address_country_1', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_2) {
    req.assert('address_country_2', tools.getValidationMessage('address_country_2', message_valid_number, null, null)).isInt();
  }
  if (req.body.address_country_3) {
    req.assert('address_country_3', tools.getValidationMessage('address_country_3', message_valid_number, null, null)).isInt();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  tools.setNullForEmpty(req.body);
  sql =
    'UPDATE COMPANIES SET ' +
//      '  id = $1 ' +
    '  reg_id = $2, vat_id = $3, company_name = $4, company_group = $5, address_tag_1 = $6, address_street_1 = $7, address_city_1 = $8, address_zip_1 = $9, address_region_1 = $10, ' +
    '  phone_1_1 = $11, phone_1_1_tag = $12, phone_1_2 = $13, phone_1_2_tag = $14, phone_1_3 = $15, phone_1_3_tag = $16, email_1_1 = $17, email_1_1_tag = $18, email_1_2 = $19, email_1_2_tag = $20, ' +
    '  email_1_3 = $21, email_1_3_tag = $22, fax_1_1 = $23, fax_1_1_tag = $24, fax_1_2 = $25, fax_1_2_tag = $26, address_tag_2 = $27, address_street_2 = $28, address_city_2 = $29, address_zip_2 = $30, ' +
    '  address_region_2 = $31, phone_2_1 = $32, phone_2_1_tag = $33, phone_2_2 = $34, phone_2_2_tag = $35, phone_2_3 = $36, phone_2_3_tag = $37, email_2_1 = $38, email_2_1_tag = $39, email_2_2 = $40, ' +
    '  email_2_2_tag = $41, email_2_3 = $42, email_2_3_tag = $43, fax_2_1 = $44, fax_2_1_tag = $45, fax_2_2 = $46, fax_2_2_tag = $47, address_tag_3 = $48, address_street_3 = $49, address_city_3 = $50, ' +
    '  address_zip_3 = $51, address_region_3 = $52, phone_3_1 = $53, phone_3_1_tag = $54, phone_3_2 = $55, phone_3_2_tag = $56, phone_3_3 = $57, phone_3_3_tag = $58, email_3_1 = $59, email_3_1_tag = $60, ' +
    '  email_3_2 = $61, email_3_2_tag = $62, email_3_3 = $63, email_3_3_tag = $64, fax_3_1 = $65, fax_3_1_tag = $66, fax_3_2 = $67, fax_3_2_tag = $68, website_1 = $69, website_2 = $70, ' +
    '  website_3 = $71, facebook_1 = $72, google_1 = $73, twitter_1 = $74, category = $75, subcategory = $76, address_country_1 = $77, address_country_2 = $78, address_country_3 = $79, facebook_2 = $80, ' +
    '  google_2 = $81, twitter_2 = $82, facebook_3 = $83, google_3 = $84, twitter_3 = $85, rating = $86 ' +
    'WHERE ID = $1';

  try {
    vals = [req.body.id, req.body.reg_id, req.body.vat_id, req.body.company_name, req.body.company_group, req.body.address_tag_1, req.body.address_street_1, req.body.address_city_1, req.body.address_zip_1, req.body.address_region_1,
      req.body.phone_1_1, req.body.phone_1_1_tag, req.body.phone_1_2, req.body.phone_1_2_tag, req.body.phone_1_3, req.body.phone_1_3_tag, req.body.email_1_1, req.body.email_1_1_tag, req.body.email_1_2, req.body.email_1_2_tag,
      req.body.email_1_3, req.body.email_1_3_tag, req.body.fax_1_1, req.body.fax_1_1_tag, req.body.fax_1_2, req.body.fax_1_2_tag, req.body.address_tag_2, req.body.address_street_2, req.body.address_city_2, req.body.address_zip_2,
      req.body.address_region_2, req.body.phone_2_1, req.body.phone_2_1_tag, req.body.phone_2_2, req.body.phone_2_2_tag, req.body.phone_2_3, req.body.phone_2_3_tag, req.body.email_2_1, req.body.email_2_1_tag, req.body.email_2_2, req.body.email_2_2_tag,
      req.body.email_2_3, req.body.email_2_3_tag, req.body.fax_2_1, req.body.fax_2_1_tag, req.body.fax_2_2, req.body.fax_2_2_tag, req.body.address_tag_3, req.body.address_street_3, req.body.address_city_3, req.body.address_zip_3,
      req.body.address_region_3, req.body.phone_3_1, req.body.phone_3_1_tag, req.body.phone_3_2, req.body.phone_3_2_tag, req.body.phone_3_3, req.body.phone_3_3_tag, req.body.email_3_1, req.body.email_3_1_tag, req.body.email_3_2,
      req.body.email_3_2_tag, req.body.email_3_3, req.body.email_3_3_tag, req.body.fax_3_1, req.body.fax_3_1_tag, req.body.fax_3_2, req.body.fax_3_2_tag, req.body.website_1, req.body.website_2, req.body.website_3,
      req.body.facebook_1, req.body.google_1, req.body.twitter_1, req.body.category, req.body.subcategory, req.body.address_country_1, req.body.address_country_2, req.body.address_country_3, req.body.facebook_2,
      req.body.google_2, req.body.twitter_2, req.body.facebook_3, req.body.google_3, req.body.twitter_3, req.body.rating];

    postgres.executeSQL(req, res, sql, vals).then(
      function (result) {
        res.json(constants.OK);
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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name delete
 * @description delete company from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.delete = function (req, res) {
  var sql2 = 'DELETE FROM COMPANIES WHERE id = $1',
    sql = 'DELETE FROM PEOPLE_COMPANIES WHERE COMPANIES_ID = $1',
    errors,
    sqlProperties;
  req.assert('id', 'ID row not found.').notEmpty();

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    sqlProperties = postgres.createTransaction(req);
    postgres.executeSQL(req, res, sql, [req.params.id], null, sqlProperties).then(
      function () {
        return postgres.executeSQL(req, res, sql2, [req.params.id], null, sqlProperties);
      }
    ).then(
      function () {
        sqlProperties.tx.commit();
        sqlProperties.client.end();
        tools.sendResponseSuccess(constants.OK, res, false);
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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name exists
 * @description search ID company according to name
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.exists = function (req, res) {
  var sql, newObj;
  sql = 'SELECT ID FROM COMPANIES c WHERE COMPANY_NAME = $1';
  return postgres.select(sql, [req.body.company_name], req).then(
    function (result) {
      newObj = tools.getSingleResult(result);
      return {exists: newObj.id > 0, id: newObj.id};
    },
    function () {
      return {};
    }
  );
};

/**
 * @memberof __Server_REST_API_Companies
 * @method
 * @name search
 * @description search all companies for angucomplete
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
    '  id, company_name as name, 1 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  company_name LIKE $1::varchar || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER, ACCENTS, CASE SENSITIVE
  sql2 =
    'SELECT ' +
    '  id, company_name as name, 2 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  company_name LIKE \'%\' || $1::varchar || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // LEFT SIDE WITHOUT ACCENTS, CASE INSENSITIVE
  sql3 =
    'SELECT ' +
    '  id, company_name as name, 3 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(COMPANY_NAME), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER, WITHOUT ACCENTS, CASE INSENSITIVE
  sql4 =
    'SELECT ' +
    '  id, company_name as name, 4 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(COMPANY_NAME), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING LEFT SIDE WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
  sql5 =
    'SELECT ' +
    '  id, company_name as name, 5 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(REPLACE(COMPANY_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
    'ORDER BY ' +
    '  id ';

  // STRING INNER WITHOUT SPACE, WITHOUT ACCENTS, CASE INSENSITIVE
  sql6 =
    'SELECT ' +
    '  id, company_name as name, 6 AS type ' +
    'FROM ' +
    '  companies c ' +
    'WHERE ' +
    '  to_ascii(convert_to(UPPER(REPLACE(COMPANY_NAME, \' \', \'\')), \'latin2\'),\'latin2\') LIKE \'%\' || to_ascii(convert_to(UPPER($1::varchar), \'latin2\'),\'latin2\') || \'%\' ' +
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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name salesPipeline
 * @description list of sales pipelines for company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesPipeline = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  sp.id,sp.subject as name,sp.stage_id as "stageId" ' +
      'FROM ' +
      '  sales_pipeline sp ' +
      'WHERE ' +
      '  sp.company_id = $1 ' +
      'ORDER BY ' +
      '  sp.subject ' +
      'LIMIT 50';

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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name exportExcel
 * @description export
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.exportExcel = function (req, res) {
  try {
    var excelContent;

    /*sql =
      'SELECT ' +
      '  ID as "Id", COMPANY_NAME AS "companyName" ' +
      'FROM ' +
      '  companies ' +
      'WHERE ' +
      '  id in ($1::int) ';

    range = req.body.items ? req.body.items.join(',') : '';*/
    /*postgres.select(sql, [range], req).then(
      function (result) {*/
    excelContent = exportsFactory.getContent(null);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "ReportNotia.xlsx");
    res.end(excelContent, 'binary');
        //res.json(tools.getMultiResult(result));
      /*},
      function (result) {
        tools.sendResponseError(constants.E500, res, false);
      }
    ); */
  } catch (e) {
    tools.sendResponseError(constants.E500, res, false);
  }
};

/**
 * @memberof __Server_REST_API_Companies
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
      var sql, sqlSeq, row, loginToken;
      loginToken = req.signedCookies.auth_token;
      sql = 'INSERT INTO companies(id, company_name, owner_id) VALUES($1, $2, $3)';
      sqlSeq = 'SELECT nextval(\'seq_companies_id\') AS id, ' +
        '  (SELECT people_id FROM users_login ul WHERE login_token = $1) as "ownerId" ';
      obj.company = obj.company || [];
      if (!obj.company[0] || (obj.company[0] && tools.isNumber(obj.company[0].id))) {
        resolve({id: (obj.company[0] ? obj.company[0].id : null)});
        return;
      }
      //console.log('krok 1');
      postgres.select(sqlSeq, [loginToken], req).then(
        function (result) {
          row = tools.getSingleResult(result);
          //console.log('krok 2');
          postgres.executeSQL(req, res, sql, [row.id, obj.company[0].name, tools.getSingleResult(result).ownerId], null, conn).then(
            function () {
              resolve({id: row.id});
            }
          );
        },
        function (result) {
          reject(result);
          //reject(constants.E500);
        }
      );
    } catch (e) {
      reject(constants.E500);
    }
  });
};

/**
 * @memberof __Server_REST_API_Companies
 * @method
 * @name searchGlobal
 * @description search company global
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.searchGlobal = function (req, res) {
  try {
    var sql;

    sql =
      'SELECT ' +
      '  c.id,c.company_name as name ' +
      'FROM ' +
      '  companies c ' +
      '  LEFT JOIN company_groups cg ON c.company_group = cg.id ' +
      '  LEFT JOIN countries co1 ON c.address_country_1 = co1.id ' +
      '  LEFT JOIN countries co2 ON c.address_country_2 = co2.id ' +
      '  LEFT JOIN countries co3 ON c.address_country_3 = co3.id ' +
      '  LEFT JOIN people_companies pc ON c.id = pc.companies_id ' +
      '  LEFT JOIN people p ON pc.people_id = p.id ' +
      'WHERE ' +
      '  upper(c.company_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.reg_id) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.vat_id) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(cg.name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_street_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_city_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_zip_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_region_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co1.name_cz||\'@\'||co1.name_sk||\'@\'||co1.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_street_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_city_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_zip_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_region_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co2.name_cz||\'@\'||co2.name_sk||\'@\'||co2.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_street_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_city_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_zip_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.address_region_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(co3.name_cz||\'@\'||co3.name_sk||\'@\'||co3.name_eng) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_1_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_1_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_1_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_2_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_2_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_2_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_3_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_3_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.email_3_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_1_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_1_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_1_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_2_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_2_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_2_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_3_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_3_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.phone_3_3) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_1_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_1_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_2_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_2_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_3_1) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(c.fax_3_2) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      '  OR upper(p.first_name||\' \'||p.last_name) LIKE \'%\' || upper($1::varchar) || \'%\' ' +
      'ORDER BY ' +
      '  c.company_name ' +
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
 * @memberof __Server_REST_API_Companies
 * @method
 * @name companyOpportunities
 * @description list of opportunities for company from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companyOpportunities = function (req, res) {
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

    accessColumnOrder = ['CREATED', 'STAGE', 'CHANCE', 'PRICE'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' CREATED ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  sp.id, ' +
      '  sp.subject, ' +
      '  sp.chance, ' +
      '  s.name as "stage", ' +
      '  log.date_event as created, ' +
      '  SUM(spp.price) as price ' +
      'FROM ' +
      '  sales_pipeline sp ' +
      '    LEFT JOIN sales_pipeline_stages s ON sp.stage_id = s.ID ' +
      '    LEFT JOIN sales_pipeline_products spp ON sp.id = spp.sales_pipeline_id ' +
      '    LEFT JOIN logging log ON to_char(sp.id, \'FM999999999\') = log.pk ' +
      '      AND log.id = ( ' +
      '        SELECT MAX(id) FROM logging l ' +
      '          WHERE date_event = ( ' +
      '            SELECT MAX(date_event) FROM logging l ' +
      '              WHERE table_name = \'SALES_PIPELINE\' AND method = \'POST\' AND pk = to_char(sp.id, \'FM999999999\') ' +
      '          ) ' +
      '      )' +
      'WHERE ' +
      '  sp.company_id = $3::integer ' +
      'GROUP BY ' +
      '  sp.id, ' +
      '  sp.subject, ' +
      '  sp.chance, ' +
      '  s.name, ' +
      '  log.date_event ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT count(*) AS rowscount ' +
      'FROM ' +
      '  sales_pipeline sp ' +
      'WHERE ' +
      '  sp.company_id = $1::integer ';

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
