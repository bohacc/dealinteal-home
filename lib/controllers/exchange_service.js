/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file exchange_service
 * @fileOverview __Server_REST_API_ExchangeService
 */

/**
 * @namespace __Server_REST_API_ExchangeService
 * @author Martin Boháč
 */
var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  conn = require('./connections'),
  Promise = require('promise');

// !!!   MUST EXISTS user IN USERS_LOGIN for IMPORT/EXPORT with login_token (for test 6e495f39b2a39f794c5e949bb2750955)
// !!!   WHERE LOGIN_TOKEN IS hash from body request

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schema
 * @description list of schemas
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schema = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/",
    "id": constants.APP_URL + "/api/exchange/schema/",
    "type": "object",
    "title": "Root schema.",
    "description": "An explanation about the puropose of this instance described by this schema.",
    "name": "/",
    "properties": {
      "countries": {
        "id": constants.APP_URL + "/api/exchange/schema/countries",
        "type": "object",
        "title": "Countries schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "countries"
      },
      "companies": {
        "id": constants.APP_URL + "/api/exchange/schema/companies",
        "type": "object",
        "title": "Companies schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "companies"
      },
      "people": {
        "id": constants.APP_URL + "/api/exchange/schema/people",
        "type": "object",
        "title": "People schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "people"
      },
      "peopleCompanies": {
        "id": constants.APP_URL + "/api/exchange/schema/people-companies",
        "type": "object",
        "title": "People - Companies schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "peopleCompanies"
      },
      "products": {
        "id": constants.APP_URL + "/api/exchange/schema/products",
        "type": "object",
        "title": "Products schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "products"
      },
      "balance": {
        "id": constants.APP_URL + "/api/exchange/schema/balance",
        "type": "object",
        "title": "Balance schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "balance"
      },
      "sales": {
        "id": constants.APP_URL + "/api/exchange/schema/sales",
        "type": "object",
        "title": "Sales schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "sales"
      },
      "currency": {
        "id": constants.APP_URL + "/api/exchange/schema/currency",
        "type": "object",
        "title": "Currency schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "currency"
      },
      "units": {
        "id": constants.APP_URL + "/api/exchange/schema/units",
        "type": "object",
        "title": "Units schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "units"
      },
      "companyGroups": {
        "id": constants.APP_URL + "/api/exchange/schema/company-groups",
        "type": "object",
        "title": "Company-Groups schema.",
        "description": "An explanation about the puropose of this instance described by this schema.",
        "name": "companyGroups"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaCountries
 * @description schemas of countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaCountries = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/countries/",
    "id": constants.APP_URL + "/api/exchange/countries/",
    "type": "object",
    "title": "Countries schema.",
    "description": "Countries schema.",
    "name": "countries",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "id": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "iso": {
        "type": "string",
        "title": "ISO of record",
        "description": "Record schema.",
        "name": "iso"
      },
      "nameCz": {
        "type": "string",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "nameCz"
      },
      "nameSk": {
        "type": "string",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "nameSk"
      },
      "nameEng": {
        "type": "string",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "nameEng"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name countries
 * @description list of countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.countries = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  id, iso, name_cz as "nameCz", name_sk as "nameSk", name_eng as "nameEng" ' +
      'FROM ' +
      '  countries c ' +
      'WHERE ' +
      '  (last_date >= $1::timestamp or $1 is null) ' +
      '  and (id = $2 or $2 is null) ' +
      '  and (iso = $3 or $3 is null) ' +
      'ORDER BY ' +
      '  id desc';

    //req.query.datetime = '2015-10-01T08:00:00.000Z';
    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.body.datetime, req.params.id, req.body.iso], req, connection).then(
          function (result) {
            res.json(req.params.id ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaCompanies
 * @description schemas of companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaCompanies = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/companies/",
    "id": constants.APP_URL + "/api/exchange/companies/",
    "type": "object",
    "title": "Companies schema.",
    "description": "Companies schema.",
    "name": "companies",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "returns": {
      "status": {
        "type": "number",
        "values": [
          {"val": 0, "name": 'Error'},
          {"val": 1, "name": 'Success'}
        ]
      }
    },
    "error": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "array",
          "title": "array of errors",
          "properties": {
            "name": {
              "type": "string",
              "title": "name of field"
            },
            "code": {
              "type": "number",
              "title": "code of error",
              "values": [
                {"val": 0, "name": 'Error'},
                {"val": 1, "name": 'Success'}
              ]
            }
          }
        }
      }
    },
    "properties": {
      "id": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "regId": {
        "type": "string",
        "title": "regId of record",
        "description": "Record schema.",
        "name": "regId"
      },
      "vatId": {
        "type": "string",
        "title": "vatId of record",
        "description": "Record schema.",
        "name": "vatId"
      },
      "companyName": {
        "type": "string",
        "title": "companyName of record",
        "description": "Record schema.",
        "name": "companyName"
      },
      "companyGroup": {
        "type": "number",
        "title": "companyGroup of record",
        "description": "Record schema.",
        "name": "companyGroup"
      },
      "addressTag1": {
        "type": "string",
        "title": "addressTag1 of record",
        "description": "Record schema.",
        "name": "addressTag1"
      },
      "addressStreet1": {
        "type": "string",
        "title": "addressStreet1 of record",
        "description": "Record schema.",
        "name": "addressStreet1"
      },
      "addressCity1": {
        "type": "string",
        "title": "addressCity1 of record",
        "description": "Record schema.",
        "name": "addressCity1"
      },
      "addressZip1": {
        "type": "string",
        "title": "addressZip1 of record",
        "description": "Record schema.",
        "name": "addressZip1"
      },
      "addressRegion1": {
        "type": "string",
        "title": "addressRegion1 of record",
        "description": "Record schema.",
        "name": "addressRegion1"
      },
      "phone11": {
        "type": "string",
        "title": "phone11 of record",
        "description": "Record schema.",
        "name": "phone11"
      },
      "phone11Tag": {
        "type": "string",
        "title": "phone11Tag of record",
        "description": "Record schema.",
        "name": "phone11Tag"
      },
      "phone12": {
        "type": "string",
        "title": "phone12 of record",
        "description": "Record schema.",
        "name": "phone12"
      },
      "phone12Tag": {
        "type": "string",
        "title": "phone12Tag of record",
        "description": "Record schema.",
        "name": "phone12Tag"
      },
      "phone13": {
        "type": "string",
        "title": "phone13 of record",
        "description": "Record schema.",
        "name": "phone13"
      },
      "phone13Tag": {
        "type": "string",
        "title": "phone13Tag of record",
        "description": "Record schema.",
        "name": "phone13Tag"
      },
      "email11": {
        "type": "string",
        "title": "email11 of record",
        "description": "Record schema.",
        "name": "email11"
      },
      "email11Tag": {
        "type": "string",
        "title": "email11Tag of record",
        "description": "Record schema.",
        "name": "email11Tag"
      },
      "email12": {
        "type": "string",
        "title": "email12 of record",
        "description": "Record schema.",
        "name": "email12"
      },
      "email12Tag": {
        "type": "string",
        "title": "email12Tag of record",
        "description": "Record schema.",
        "name": "email12Tag"
      },
      "email13": {
        "type": "string",
        "title": "email13 of record",
        "description": "Record schema.",
        "name": "email13"
      },
      "email13Tag": {
        "type": "string",
        "title": "email13Tag of record",
        "description": "Record schema.",
        "name": "email13Tag"
      },
      "fax11": {
        "type": "string",
        "title": "fax11 of record",
        "description": "Record schema.",
        "name": "fax11"
      },
      "fax11Tag": {
        "type": "string",
        "title": "fax11Tag of record",
        "description": "Record schema.",
        "name": "fax11Tag"
      },
      "fax12": {
        "type": "string",
        "title": "fax12 of record",
        "description": "Record schema.",
        "name": "fax12"
      },
      "fax12Tag": {
        "type": "string",
        "title": "fax12Tag of record",
        "description": "Record schema.",
        "name": "fax12Tag"
      },
      "addressTag2": {
        "type": "string",
        "title": "addressTag2 of record",
        "description": "Record schema.",
        "name": "addressTag2"
      },
      "addressStreet2": {
        "type": "string",
        "title": "addressStreet2 of record",
        "description": "Record schema.",
        "name": "addressStreet2"
      },
      "addressCity2": {
        "type": "string",
        "title": "addressCity2 of record",
        "description": "Record schema.",
        "name": "addressCity2"
      },
      "addressZip2": {
        "type": "string",
        "title": "addressZip2 of record",
        "description": "Record schema.",
        "name": "addressZip2"
      },
      "addressRegion2": {
        "type": "string",
        "title": "addressRegion2 of record",
        "description": "Record schema.",
        "name": "addressRegion2"
      },
      "phone21": {
        "type": "string",
        "title": "phone21 of record",
        "description": "Record schema.",
        "name": "phone21"
      },
      "phone21Tag": {
        "type": "string",
        "title": "phone21Tag of record",
        "description": "Record schema.",
        "name": "phone21Tag"
      },
      "phone22": {
        "type": "string",
        "title": "phone22 of record",
        "description": "Record schema.",
        "name": "phone22"
      },
      "phone22Tag": {
        "type": "string",
        "title": "phone22Tag of record",
        "description": "Record schema.",
        "name": "phone22Tag"
      },
      "phone23": {
        "type": "string",
        "title": "phone23 of record",
        "description": "Record schema.",
        "name": "phone23"
      },
      "phone23Tag": {
        "type": "string",
        "title": "phone23Tag of record",
        "description": "Record schema.",
        "name": "phone23Tag"
      },
      "email21": {
        "type": "string",
        "title": "email21 of record",
        "description": "Record schema.",
        "name": "email21"
      },
      "email21Tag": {
        "type": "string",
        "title": "email21Tag of record",
        "description": "Record schema.",
        "name": "email21Tag"
      },
      "email22": {
        "type": "string",
        "title": "email22 of record",
        "description": "Record schema.",
        "name": "email22"
      },
      "email22Tag": {
        "type": "string",
        "title": "email22Tag of record",
        "description": "Record schema.",
        "name": "email22Tag"
      },
      "email23": {
        "type": "string",
        "title": "email23 of record",
        "description": "Record schema.",
        "name": "email23"
      },
      "email23Tag": {
        "type": "string",
        "title": "email23Tag of record",
        "description": "Record schema.",
        "name": "email23Tag"
      },
      "fax21": {
        "type": "string",
        "title": "fax21 of record",
        "description": "Record schema.",
        "name": "fax21"
      },
      "fax21Tag": {
        "type": "string",
        "title": "fax21Tag of record",
        "description": "Record schema.",
        "name": "fax21Tag"
      },
      "fax22": {
        "type": "string",
        "title": "fax22 of record",
        "description": "Record schema.",
        "name": "fax22"
      },
      "fax22Tag": {
        "type": "string",
        "title": "fax22Tag of record",
        "description": "Record schema.",
        "name": "fax22Tag"
      },
      "addressTag3": {
        "type": "string",
        "title": "addressTag3 of record",
        "description": "Record schema.",
        "name": "addressTag3"
      },
      "addressStreet3": {
        "type": "string",
        "title": "addressStreet3 of record",
        "description": "Record schema.",
        "name": "addressStreet3"
      },
      "addressCity3": {
        "type": "string",
        "title": "addressCity3 of record",
        "description": "Record schema.",
        "name": "addressCity3"
      },
      "addressZip3": {
        "type": "string",
        "title": "addressZip3 of record",
        "description": "Record schema.",
        "name": "addressZip3"
      },
      "addressRegion3": {
        "type": "string",
        "title": "addressRegion3 of record",
        "description": "Record schema.",
        "name": "addressRegion3"
      },
      "phone31": {
        "type": "string",
        "title": "phone31 of record",
        "description": "Record schema.",
        "name": "phone31"
      },
      "phone31Tag": {
        "type": "string",
        "title": "phone31Tag of record",
        "description": "Record schema.",
        "name": "phone31Tag"
      },
      "phone32": {
        "type": "string",
        "title": "phone32 of record",
        "description": "Record schema.",
        "name": "phone32"
      },
      "phone32Tag": {
        "type": "string",
        "title": "phone32Tag of record",
        "description": "Record schema.",
        "name": "phone32Tag"
      },
      "phone33": {
        "type": "string",
        "title": "phone33 of record",
        "description": "Record schema.",
        "name": "phone33"
      },
      "phone33Tag": {
        "type": "string",
        "title": "phone33Tag of record",
        "description": "Record schema.",
        "name": "phone33Tag"
      },
      "email31": {
        "type": "string",
        "title": "email31 of record",
        "description": "Record schema.",
        "name": "email31"
      },
      "email31Tag": {
        "type": "string",
        "title": "email31Tag of record",
        "description": "Record schema.",
        "name": "email31Tag"
      },
      "email32": {
        "type": "string",
        "title": "email32 of record",
        "description": "Record schema.",
        "name": "email32"
      },
      "email32Tag": {
        "type": "string",
        "title": "email32Tag of record",
        "description": "Record schema.",
        "name": "email32Tag"
      },
      "email33": {
        "type": "string",
        "title": "email33 of record",
        "description": "Record schema.",
        "name": "email33"
      },
      "email33Tag": {
        "type": "string",
        "title": "email33Tag of record",
        "description": "Record schema.",
        "name": "email33Tag"
      },
      "fax31": {
        "type": "string",
        "title": "fax31 of record",
        "description": "Record schema.",
        "name": "fax31"
      },
      "fax31Tag": {
        "type": "string",
        "title": "fax31Tag of record",
        "description": "Record schema.",
        "name": "fax31Tag"
      },
      "fax32": {
        "type": "string",
        "title": "fax32 of record",
        "description": "Record schema.",
        "name": "fax32"
      },
      "fax32Tag": {
        "type": "string",
        "title": "fax32Tag of record",
        "description": "Record schema.",
        "name": "fax32Tag"
      },
      "website1": {
        "type": "string",
        "title": "website1 of record",
        "description": "Record schema.",
        "name": "website1"
      },
      "website2": {
        "type": "string",
        "title": "website2 of record",
        "description": "Record schema.",
        "name": "website2"
      },
      "website3": {
        "type": "string",
        "title": "website3 of record",
        "description": "Record schema.",
        "name": "website3"
      },
      "facebook1": {
        "type": "string",
        "title": "facebook1 of record",
        "description": "Record schema.",
        "name": "facebook1"
      },
      "google1": {
        "type": "string",
        "title": "google1 of record",
        "description": "Record schema.",
        "name": "google1"
      },
      "twitter1": {
        "type": "string",
        "title": "twitter1 of record",
        "description": "Record schema.",
        "name": "twitter1"
      },
      "category": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "subcategory": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "addressCountry1": {
        "type": "number",
        "title": "addressCountry1 of record",
        "description": "Record schema.",
        "name": "addressCountry1"
      },
      "addressCountry2": {
        "type": "number",
        "title": "addressCountry2 of record",
        "description": "Record schema.",
        "name": "addressCountry2"
      },
      "addressCountry3": {
        "type": "number",
        "title": "addressCountry3 of record",
        "description": "Record schema.",
        "name": "addressCountry3"
      },
      "facebook2": {
        "type": "string",
        "title": "facebook2 of record",
        "description": "Record schema.",
        "name": "facebook2"
      },
      "google2": {
        "type": "string",
        "title": "google2 of record",
        "description": "Record schema.",
        "name": "google2"
      },
      "twitter2": {
        "type": "string",
        "title": "twitter2 of record",
        "description": "Record schema.",
        "name": "twitter2"
      },
      "facebook3": {
        "type": "string",
        "title": "facebook3 of record",
        "description": "Record schema.",
        "name": "facebook3"
      },
      "google3": {
        "type": "string",
        "title": "google3 of record",
        "description": "Record schema.",
        "name": "google3"
      },
      "twitter3": {
        "type": "string",
        "title": "twitter3 of record",
        "description": "Record schema.",
        "name": "twitter3"
      },
      "rating": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "lastDate": {
        "type": "date",
        "title": "lastDate of record",
        "description": "Record schema.",
        "name": "lastDate"
      },
      "lastUser": {
        "type": "string",
        "title": "lastUser of record",
        "description": "Record schema.",
        "name": "lastUser"
      },
      "ownerId": {
        "type": "string",
        "title": "ownerId of record",
        "description": "Record schema.",
        "name": "ownerId"
      },
      "status": {
        "type": "string",
        "title": "status of change",
        "description": "Record schema from people_companies_synch.",
        "name": "status"
      }
    },
    "requiredFields": [
      "companyName"
    ],
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};


/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companies
 * @description list of companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companies = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  c.id, ' +
      '  c.reg_id as "regId",' +
      '  c.vat_id as "vatId",' +
      '  c.company_name as "companyName",' +
      '  c.company_group as "companyGroup",' +
      '  c.address_tag_1 as "addressTag1",' +
      '  c.address_street_1 as "addressStreet1",' +
      '  c.address_city_1 as "addressCity1",' +
      '  c.address_zip_1 as "addressZip1",' +
      '  c.address_region_1 as "addressRegion1",' +
      '  c.phone_1_1 as "phone11",' +
      '  c.phone_1_1_tag as "phone11Tag",' +
      '  c.phone_1_2 as "phone12",' +
      '  c.phone_1_2_tag as "phone12Tag",' +
      '  c.phone_1_3 as "phone13",' +
      '  c.phone_1_3_tag as "phone13Tag",' +
      '  c.email_1_1 as "email11",' +
      '  c.email_1_1_tag as "email11Tag",' +
      '  c.email_1_2 as "email12",' +
      '  c.email_1_2_tag as "email12Tag",' +
      '  c.email_1_3 as "email13",' +
      '  c.email_1_3_tag as "email13Tag",' +
      '  c.fax_1_1 as "fax11",' +
      '  c.fax_1_1_tag as "fax11Tag",' +
      '  c.fax_1_2 as "fax12",' +
      '  c.fax_1_2_tag as "fax12Tag",' +
      '  c.address_tag_2 as "addressTag2",' +
      '  c.address_street_2 as "addressStreet2",' +
      '  c.address_city_2 as "addressCity2",' +
      '  c.address_zip_2 as "addressZip2",' +
      '  c.address_region_2 as "addressRegion2",' +
      '  c.phone_2_1 as "phone21",' +
      '  c.phone_2_1_tag as "phone21Tag",' +
      '  c.phone_2_2 as "phone22",' +
      '  c.phone_2_2_tag as "phone22Tag",' +
      '  c.phone_2_3 as "phone23",' +
      '  c.phone_2_3_tag as "phone23Tag",' +
      '  c.email_2_1 as "email21",' +
      '  c.email_2_1_tag as "email21Tag",' +
      '  c.email_2_2 as "email22",' +
      '  c.email_2_2_tag as "email22Tag",' +
      '  c.email_2_3 as "email23",' +
      '  c.email_2_3_tag as "email23Tag",' +
      '  c.fax_2_1 as "fax21",' +
      '  c.fax_2_1_tag as "fax21Tag",' +
      '  c.fax_2_2 as "fax22",' +
      '  c.fax_2_2_tag as "fax22Tag",' +
      '  c.address_tag_3 as "addressTag3",' +
      '  c.address_street_3 as "addressStreet3",' +
      '  c.address_city_3 as "addressCity3",' +
      '  c.address_zip_3 as "addressZip3",' +
      '  c.address_region_3 as "addressRegion3",' +
      '  c.phone_3_1 as "phone31",' +
      '  c.phone_3_1_tag as "phone31Tag",' +
      '  c.phone_3_2 as "phone32",' +
      '  c.phone_3_2_tag as "phone32Tag",' +
      '  c.phone_3_3 as "phone33",' +
      '  c.phone_3_3_tag as "phone33Tag",' +
      '  c.email_3_1 as "email31",' +
      '  c.email_3_1_tag as "email31Tag",' +
      '  c.email_3_2 as "email32",' +
      '  c.email_3_2_tag as "email32Tag",' +
      '  c.email_3_3 as "email33",' +
      '  c.email_3_3_tag as "email33Tag",' +
      '  c.fax_3_1 as "fax31",' +
      '  c.fax_3_1_tag as "fax31Tag",' +
      '  c.fax_3_2 as "fax32",' +
      '  c.fax_3_2_tag as "fax32Tag",' +
      '  c.website_1 as "website1",' +
      '  c.website_2 as "website2",' +
      '  c.website_3 as "website3",' +
      '  c.facebook_1 as "facebook1",' +
      '  c.google_1 as "google1",' +
      '  c.twitter_1 as "twitter1",' +
      '  c.category,' +
      '  c.subcategory,' +
      '  c.address_country_1 as "addressCountry1",' +
      '  c.address_country_2 as "addressCountry2",' +
      '  c.address_country_3 as "addressCountry3",' +
      '  c.facebook_2 as "facebook2",' +
      '  c.google_2 as "google2",' +
      '  c.twitter_2 as "twitter2",' +
      '  c.facebook_3 as "facebook3",' +
      '  c.google_3 as "google3",' +
      '  c.twitter_3 as "twitter3",' +
      '  c.rating,' +
      '  c.last_date as "lastDate",' +
      '  c.last_user as "lastUser", ' +
      '  c.owner_id as "ownerId", ' +
      '  pcs.status ' +
      'FROM ' +
      '  companies c ' +
      '  LEFT JOIN people_companies_synch pcs ON c.id = pcs.companies_id and pcs.people_id is null ' +
      'WHERE ' +
      '  (pcs.last_date >= $1::timestamp or $1 is null) ' +
      '  and (c.id = $2 or $2 is null) ' +
      '  and (c.reg_id = $3 or $3 is null) ' +
      'ORDER BY ' +
      '  c.id desc ' +
      'LIMIT 1000';

    //req.query.datetime = '2015-10-01T08:00:00.000Z';
    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.body.datetime, req.params.id, req.body.regId], req, connection).then(
          function (result) {
            //res.json(tools.getMultiResult(result));
            res.json(req.params.id ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companiesPost
 * @description post companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companiesPost = function (req, res) {
  try {
    var sql, sqlSeq, vals = [], connection, row;
//console.log(req);
    // verify
    if (!req.body.companyName) {
      res.json({
        id: null,
        type: "object",
        title: "Companies schema.",
        description: "Companies schema.",
        name: "companies",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "companyName", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_companies_id\') AS id, login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO companies ' +
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

    vals = [null, req.body.regId, req.body.vatId, req.body.companyName, req.body.companyGroup, req.body.addressTag1, req.body.addressStreet1, req.body.addressCity1, req.body.addressZip1, req.body.addressRegion1,
      req.body.phone11, req.body.phone11Tag, req.body.phone12, req.body.phone12Tag, req.body.phone13, req.body.phone13Tag, req.body.email11, req.body.email11Tag, req.body.email12, req.body.email12Tag,
      req.body.email13, req.body.email13Tag, req.body.fax11, req.body.fax11Tag, req.body.fax12, req.body.fax12Tag, req.body.addressTag2, req.body.addressStreet2, req.body.addressCity2, req.body.addressZip2,
      req.body.addressRegion2, req.body.phone21, req.body.phone21Tag, req.body.phone22, req.body.phone22Tag, req.body.phone23, req.body.phone23Tag, req.body.email21, req.body.email21Tag, req.body.email22, req.body.email22Tag,
      req.body.email23, req.body.email23Tag, req.body.fax21, req.body.fax21Tag, req.body.fax22, req.body.fax22Tag, req.body.addressTag3, req.body.addressStreet3, req.body.addressCity3, req.body.addressZip3,
      req.body.addressRegion3, req.body.phone31, req.body.phone31Tag, req.body.phone32, req.body.phone32Tag, req.body.phone33, req.body.phone33Tag, req.body.email31, req.body.email31Tag, req.body.email32,
      req.body.email32Tag, req.body.email33, req.body.email33Tag, req.body.fax31, req.body.fax31Tag, req.body.fax32, req.body.fax32Tag, req.body.website1, req.body.website2, req.body.website3,
      req.body.facebook1, req.body.google1, req.body.twitter1, req.body.category, req.body.subcategory, req.body.addressCountry1, req.body.addressCountry2, req.body.addressCountry3, req.body.facebook2,
      req.body.google2, req.body.twitter2, req.body.facebook3, req.body.google3, req.body.twitter3, req.body.rating, req.body.lastDate, req.body.lastUser, req.body.ownerId];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            vals[87] = row.loginName;
            vals[88] = row.ownerId;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Companies schema.",
              description: "Companies schema.",
              name: "companies",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaPeople
 * @description schemas of people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaPeople = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/people/",
    "id": constants.APP_URL + "/api/exchange/people/",
    "type": "object",
    "title": "People schema.",
    "description": "People schema.",
    "name": "people",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "id": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "title": {
        "type": "string",
        "title": "title of record",
        "description": "Record schema.",
        "name": "title"
      },
      "firstName": {
        "type": "string",
        "title": "firstName of record",
        "description": "Record schema.",
        "name": "firstName"
      },
      "middleName": {
        "type": "string",
        "title": "middleName of record",
        "description": "Record schema.",
        "name": "middleName"
      },
      "lastName": {
        "type": "string",
        "title": "lastName of record",
        "description": "Record schema.",
        "name": "lastName"
      },
      "suffix": {
        "type": "string",
        "title": "suffix of record",
        "description": "Record schema.",
        "name": "suffix"
      },
      "nickname": {
        "type": "string",
        "title": "nickname of record",
        "description": "Record schema.",
        "name": "nickname"
      },
      "picture": {
        "type": "string",
        "title": "picture of record",
        "description": "Record schema.",
        "name": "picture"
      },
      "managerName": {
        "type": "string",
        "title": "managerName of record",
        "description": "Record schema.",
        "name": "managerName"
      },
      "assistantName": {
        "type": "string",
        "title": "assistantName of record",
        "description": "Record schema.",
        "name": "assistantName"
      },
      "spouse": {
        "type": "string",
        "title": "spouse of record",
        "description": "Record schema.",
        "name": "spouse"
      },
      "children": {
        "type": "string",
        "title": "children of record",
        "description": "Record schema.",
        "name": "children"
      },
      "birthday": {
        "type": "date",
        "title": "birthday of record",
        "description": "Record schema.",
        "name": "birthday"
      },
      "anniversary": {
        "type": "date",
        "title": "anniversary of record",
        "description": "Record schema.",
        "name": "anniversary"
      },
      "anniversaryName": {
        "type": "string",
        "title": "anniversaryName of record",
        "description": "Record schema.",
        "name": "anniversaryName"
      },
      "gender": {
        "type": "string",
        "title": "gender of record",
        "description": "Record schema.",
        "name": "gender"
      },
      "hobbies": {
        "type": "string",
        "title": "hobbies of record",
        "description": "Record schema.",
        "name": "hobbies"
      },
      "businessAddrName": {
        "type": "string",
        "title": "businessAddrName of record",
        "description": "Record schema.",
        "name": "businessAddrName"
      },
      "businessAddrStreet": {
        "type": "string",
        "title": "businessAddrStreet of record",
        "description": "Record schema.",
        "name": "businessAddrStreet"
      },
      "businessAddrCity": {
        "type": "string",
        "title": "businessAddrCity of record",
        "description": "Record schema.",
        "name": "businessAddrCity"
      },
      "businessAddrZip": {
        "type": "string",
        "title": "businessAddrZip of record",
        "description": "Record schema.",
        "name": "businessAddrZip"
      },
      "businessAddrRegion": {
        "type": "string",
        "title": "businessAddrRegion of record",
        "description": "Record schema.",
        "name": "businessAddrRegion"
      },
      "homeAddrName": {
        "type": "string",
        "title": "homeAddrName of record",
        "description": "Record schema.",
        "name": "homeAddrName"
      },
      "homeAddrStreet": {
        "type": "string",
        "title": "homeAddrStreet of record",
        "description": "Record schema.",
        "name": "homeAddrStreet"
      },
      "homeAddrCity": {
        "type": "string",
        "title": "homeAddrCity of record",
        "description": "Record schema.",
        "name": "homeAddrCity"
      },
      "homeAddrZip": {
        "type": "string",
        "title": "homeAddrZip of record",
        "description": "Record schema.",
        "name": "homeAddrZip"
      },
      "homeAddrRegion": {
        "type": "string",
        "title": "homeAddrRegion of record",
        "description": "Record schema.",
        "name": "homeAddrRegion"
      },
      "otherAddrName": {
        "type": "string",
        "title": "otherAddrName of record",
        "description": "Record schema.",
        "name": "otherAddrName"
      },
      "otherAddrStreet": {
        "type": "string",
        "title": "otherAddrStreet of record",
        "description": "Record schema.",
        "name": "otherAddrStreet"
      },
      "otherAddrCity": {
        "type": "string",
        "title": "otherAddrCity of record",
        "description": "Record schema.",
        "name": "otherAddrCity"
      },
      "otherAddrZip": {
        "type": "string",
        "title": "otherAddrZip of record",
        "description": "Record schema.",
        "name": "otherAddrZip"
      },
      "otherAddrRegion": {
        "type": "string",
        "title": "otherAddrRegion of record",
        "description": "Record schema.",
        "name": "otherAddrRegion"
      },
      "email": {
        "type": "string",
        "title": "email of record",
        "description": "Record schema.",
        "name": "email"
      },
      "email2": {
        "type": "string",
        "title": "email2 of record",
        "description": "Record schema.",
        "name": "email2"
      },
      "skype": {
        "type": "string",
        "title": "skype of record",
        "description": "Record schema.",
        "name": "skype"
      },
      "otherIm": {
        "type": "string",
        "title": "otherIm of record",
        "description": "Record schema.",
        "name": "otherIm"
      },
      "linkedin": {
        "type": "string",
        "title": "linkedin of record",
        "description": "Record schema.",
        "name": "linkedin"
      },
      "twitter": {
        "type": "string",
        "title": "twitter of record",
        "description": "Record schema.",
        "name": "twitter"
      },
      "facebook": {
        "type": "string",
        "title": "facebook of record",
        "description": "Record schema.",
        "name": "facebook"
      },
      "businessPhone": {
        "type": "string",
        "title": "businessPhone of record",
        "description": "Record schema.",
        "name": "businessPhone"
      },
      "assistantPhone": {
        "type": "string",
        "title": "assistantPhone of record",
        "description": "Record schema.",
        "name": "assistantPhone"
      },
      "homePhone": {
        "type": "string",
        "title": "homePhone of record",
        "description": "Record schema.",
        "name": "homePhone"
      },
      "mobilePhone": {
        "type": "string",
        "title": "mobilePhone of record",
        "description": "Record schema.",
        "name": "mobilePhone"
      },
      "otherPhone": {
        "type": "string",
        "title": "otherPhone of record",
        "description": "Record schema.",
        "name": "otherPhone"
      },
      "fax": {
        "type": "string",
        "title": "fax of record",
        "description": "Record schema.",
        "name": "fax"
      },
      "teamMember": {
        "type": "number",
        "title": "teamMember of record",
        "description": "Record schema.",
        "name": "teamMember"
      },
      "private": {
        "type": "number",
        "title": "private of record",
        "description": "Record schema.",
        "name": "private"
      },
      "note": {
        "type": "string",
        "title": "note of record",
        "description": "Record schema.",
        "name": "note"
      },
      "noteAuthor": {
        "type": "string",
        "title": "noteAuthor of record",
        "description": "Record schema.",
        "name": "noteAuthor"
      },
      "noteDate": {
        "type": "string",
        "title": "noteDate of record",
        "description": "Record schema.",
        "name": "noteDate"
      },
      "userField1": {
        "type": "string",
        "title": "userField1 of record",
        "description": "Record schema.",
        "name": "userField1"
      },
      "userField2": {
        "type": "string",
        "title": "userField2 of record",
        "description": "Record schema.",
        "name": "userField2"
      },
      "userField3": {
        "type": "string",
        "title": "userField3 of record",
        "description": "Record schema.",
        "name": "userField3"
      },
      "userField4": {
        "type": "string",
        "title": "userField4 of record",
        "description": "Record schema.",
        "name": "userField4"
      },
      "userField5": {
        "type": "string",
        "title": "userField5 of record",
        "description": "Record schema.",
        "name": "userField5"
      },
      "userField6": {
        "type": "string",
        "title": "userField6 of record",
        "description": "Record schema.",
        "name": "userField6"
      },
      "userField7": {
        "type": "string",
        "title": "userField7 of record",
        "description": "Record schema.",
        "name": "userField7"
      },
      "userField8": {
        "type": "string",
        "title": "userField8 of record",
        "description": "Record schema.",
        "name": "userField8"
      },
      "userField9": {
        "type": "string",
        "title": "userField9 of record",
        "description": "Record schema.",
        "name": "userField9"
      },
      "userField10": {
        "type": "string",
        "title": "userField10 of record",
        "description": "Record schema.",
        "name": "userField10"
      },
      "businessAddrCountry": {
        "type": "number",
        "title": "businessAddrCountry of record",
        "description": "Record schema.",
        "name": "businessAddrCountry"
      },
      "homeAddrCountry": {
        "type": "number",
        "title": "homeAddrCountry of record",
        "description": "Record schema.",
        "name": "homeAddrCountry"
      },
      "otherAddrCountry": {
        "type": "number",
        "title": "otherAddrCountry of record",
        "description": "Record schema.",
        "name": "otherAddrCountry"
      },
      "googlePlus": {
        "type": "string",
        "title": "googlePlus of record",
        "description": "Record schema.",
        "name": "googlePlus"
      },
      "lastDate": {
        "type": "date",
        "title": "lastDate of record",
        "description": "Record schema.",
        "name": "lastDate"
      },
      "lastUser": {
        "type": "string",
        "title": "lastUser of record",
        "description": "Record schema.",
        "name": "lastUser"
      },
      "status": {
        "type": "string",
        "title": "status of change",
        "description": "Record schema from people_companies_synch.",
        "name": "status"
      }
    },
    "paramsFields": [
      "regId"
    ],
    "requiredFields": [
      "lastName"
    ],
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};


/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name people
 * @description list of people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.people = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  p.id,' +
      '  p.title,' +
      '  p.first_name as "firstName",' +
      '  p.middle_name as "middleName",' +
      '  p.last_name as "lastName",' +
      '  p.suffix,' +
      '  p.nickname,' +
      '  p.picture,' +
      '  p.manager_name as "managerName",' +
      '  p.assistant_name as "assistantName",' +
      '  p.spouse,' +
      '  p.children,' +
      '  p.birthday,' +
      '  p.anniversary,' +
      '  p.anniversary_name as "anniversaryName",' +
      '  p.gender,' +
      '  p.hobbies,' +
      '  p.business_addr_name as "businessAddrName",' +
      '  p.business_addr_street as "businessAddrStreet",' +
      '  p.business_addr_city as "businessAddrCity",' +
      '  p.business_addr_zip as "businessAddrZip",' +
      '  p.business_addr_region as "businessAddrRegion",' +
      '  p.home_addr_name as "homeAddrName",' +
      '  p.home_addr_street as "homeAddrStreet",' +
      '  p.home_addr_city as "homeAddrCity",' +
      '  p.home_addr_zip as "homeAddrZip",' +
      '  p.home_addr_region as "homeAddrRegion",' +
      '  p.other_addr_name as "otherAddrName",' +
      '  p.other_addr_street as "otherAddrStreet",' +
      '  p.other_addr_city as "otherAddrCity",' +
      '  p.other_addr_zip as "otherAddrZip",' +
      '  p.other_addr_region as "otherAddrRegion",' +
      '  p.email,' +
      '  p.email2,' +
      '  p.skype,' +
      '  p.other_im as "otherIm",' +
      '  p.linkedin,' +
      '  p.twitter,' +
      '  p.facebook,' +
      '  p.business_phone as "businessPhone",' +
      '  p.assistant_phone as "assistantPhone",' +
      '  p.home_phone as "homePhone",' +
      '  p.mobile_phone as "mobilePhone",' +
      '  p.other_phone as "otherPhone",' +
      '  p.fax,' +
      '  p.team_member as "teamMember",' +
      '  p.private,' +
      '  p.note,' +
      '  p.note_author as "noteAuthor",' +
      '  p.note_date as "noteDate",' +
      '  p.user_field_1 as "userField1",' +
      '  p.user_field_2 as "userField2",' +
      '  p.user_field_3 as "userField3",' +
      '  p.user_field_4 as "userField4",' +
      '  p.user_field_5 as "userField5",' +
      '  p.user_field_6 as "userField6",' +
      '  p.user_field_7 as "userField7",' +
      '  p.user_field_8 as "userField8",' +
      '  p.user_field_9 as "userField9",' +
      '  p.user_field_10 as "userField10",' +
      '  p.business_addr_country as "businessAddrCountry",' +
      '  p.home_addr_country as "homeAddrCountry",' +
      '  p.other_addr_country as "otherAddrCountry",' +
      '  p.google_plus as "googlePlus",' +
      '  p.last_date as "lastDate",' +
      '  p.last_user as "lastUser",' +
      '  pcs.status ' +
      'FROM ' +
      '  people p ' +
      '  LEFT JOIN people_companies_synch pcs ON p.id = pcs.people_id and pcs.companies_id is null ' +
      'WHERE ' +
      '  (pcs.last_date >= $1::timestamp or $1 is null) ' +
      '  and (p.id = $2::numeric or $2 is null) ' +
      'ORDER BY ' +
      '  p.id desc ' +
      'LIMIT 1000';

    //req.query.datetime = '2015-10-01T08:00:00.000Z';
    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.body.datetime, req.params.id], req, connection).then(
          function (result) {
            res.json(req.params.id ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peoplePost
 * @description post people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peoplePost = function (req, res) {
  try {
    var sql = '', sqlSeq, vals = [], connection, row;

    // verify
    if (!req.body.lastName) {
      res.json({
        id: null,
        type: "object",
        title: "People schema.",
        description: "People schema.",
        name: "people",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "lastName", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_people_id\') AS id, login_name as "loginName" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO people ' +
      '  (id, title, first_name, middle_name, last_name, suffix, nickname, picture, manager_name, assistant_name,' +
      '   spouse, children, birthday, anniversary, anniversary_name, gender, hobbies, business_addr_name, business_addr_street, business_addr_city,' +
      '   business_addr_zip, business_addr_region, home_addr_name, home_addr_street, home_addr_city, home_addr_zip, home_addr_region, other_addr_name, other_addr_street, other_addr_city,' +
      '   other_addr_zip, other_addr_region, email, email2, skype, other_im, linkedin, twitter, facebook, business_phone,' +
      '   assistant_phone, home_phone, mobile_phone, other_phone, fax, team_member, private, note, note_author, note_date,' +
      '   user_field_1, user_field_2, user_field_3, user_field_4, user_field_5, user_field_6, user_field_7, user_field_8, user_field_9, user_field_10,' +
      '   business_addr_country, home_addr_country, other_addr_country, google_plus, last_date, last_user) ' +
      'VALUES(' +
      '  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,' +
      '  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,' +
      '  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,' +
      '  $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,' +
      '  $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,' +
      '  $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,' +
      '  $61, $62, $63, $64, $65, $66)';

    vals = [null, req.body.title, req.body.firstName, req.body.middleName, req.body.lastName, req.body.suffix, req.body.nickname, req.body.picture, req.body.managerName, req.body.assistantName,
      req.body.spouse, req.body.children, req.body.birthday, req.body.anniversary, req.body.anniversaryName, req.body.gender, req.body.hobbies, req.body.businessAddrName, req.body.businessAddrStreet, req.body.businessAddrCity,
      req.body.businessAddrZip, req.body.businessAddrRegion, req.body.homeAddrName, req.body.homeAddrStreet, req.body.homeAddrCity, req.body.homeAddrZip, req.body.homeAddrRegion, req.body.otherAddrName, req.body.otherAddrStreet, req.body.otherAddrCity,
      req.body.otherAddrZip, req.body.otherAddrRegion, req.body.email, req.body.email2, req.body.skype, req.body.otherIm, req.body.linkedin, req.body.twitter, req.body.facebook, req.body.businessPhone,
      req.body.assistantPhone, req.body.homePhone, req.body.mobilePhone, req.body.otherPhone, req.body.fax, req.body.teamMember, req.body.private, req.body.note, req.body.noteAuthor, req.body.noteDate,
      req.body.userField1, req.body.userField2, req.body.userField3, req.body.userField4, req.body.userField5, req.body.userField6, req.body.userField7, req.body.userField8, req.body.userField9, req.body.userField10,
      req.body.businessAddrCountry, req.body.homeAddrCountry, req.body.otherAddrCountry, req.body.googlePlus, req.body.lastDate, req.body.lastUser];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            vals[65] = row.loginName;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "People schema.",
              description: "People schema.",
              name: "people",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaPeopleCompanies
 * @description schemas of people companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaPeopleCompanies = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/people-companies/",
    "id": constants.APP_URL + "/api/exchange/people-companies/",
    "type": "object",
    "title": "People Companies schema.",
    "description": "People Companies schema.",
    "name": "peopleCompanies",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "peopleId": {
        "type": "number",
        "title": "peopleId of record",
        "description": "Record schema.",
        "name": "peopleId"
      },
      "companiesId": {
        "type": "number",
        "title": "companiesId of record",
        "description": "Record schema.",
        "name": "companiesId"
      },
      "positionId": {
        "type": "number",
        "title": "positionId of record",
        "description": "Record schema.",
        "name": "positionId"
      },
      "roleId": {
        "type": "number",
        "title": "roleId of record",
        "description": "Record schema.",
        "name": "roleId"
      },
      "workSince": {
        "type": "date",
        "title": "workSince of record",
        "description": "Record schema.",
        "name": "workSince"
      },
      "workTo": {
        "type": "date",
        "title": "workTo of record",
        "description": "Record schema.",
        "name": "workTo"
      },
      "lastDate": {
        "type": "date",
        "title": "lastDate of record",
        "description": "Record schema.",
        "name": "lastDate"
      },
      "lastUser": {
        "type": "string",
        "title": "lastUser of record",
        "description": "Record schema.",
        "name": "lastUser"
      },
      "status": {
        "type": "string",
        "title": "status of change",
        "description": "Record schema from people_companies_synch.",
        "name": "status"
      }
    },
    "requiredFields": [
      "peopleId",
      "companyId"
    ],
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peopleCompanies
 * @description list of peopleCompanies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peopleCompanies = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  pc.people_id as "peopleId",' +
      '  pc.companies_id as "companiesId",' +
      '  pc.position_id as "positionId",' +
      '  pc.role_id as "roleId",' +
      '  pc.work_since as "workSince",' +
      '  pc.work_to as "workTo", ' +
      '  pc.last_date as "lastDate", ' +
      '  pc.last_user as "lastUser", ' +
      '  pcs.status ' +
      'FROM ' +
      '  people_companies pc ' +
      '  LEFT JOIN people_companies_synch pcs ON pc.people_id = pcs.people_id and pc.companies_id = pcs.companies_id and pcs.companies_id is null ' +
      'WHERE ' +
      '  (pc.last_date >= $1::timestamp or $1 is null) ' +
      '  and (pc.people_id = $2 or $2 is null) ' +
      '  and (pc.companies_id = $3 or $3 is null) ' +
      'ORDER BY ' +
      '  pc.people_id desc ' +
      'LIMIT 1000';

    //req.query.datetime = '2015-10-01T08:00:00.000Z';
    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.body.datetime, req.params.people, req.params.company], req, connection).then(
          function (result) {
            res.json(req.params.people ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peopleCompaniesPost
 * @description post peopleCompanies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peopleCompaniesPost = function (req, res) {
  try {
    var sql = '', sqlSeq, vals = [], connection, row;

    // verify
    if (!req.body.peopleId || !req.body.companiesId) {
      res.json({
        id: null,
        type: "object",
        title: "PeopleCompanies schema.",
        description: "PeopleCompanies schema.",
        name: "peopleCompanies",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "peopleId", code: 0}, // 0 required
            {name: "companiesId", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlSeq = 'SELECT login_name as "loginName" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO people_companies ' +
      '  (people_id, companies_id, position_id, role_id, work_since, work_to, last_date, last_user) ' +
      'VALUES($1, $2, $3, $4, $5, $6, $7, $8)';

    vals = [req.body.peopleId, req.body.companiesId, req.body.positionId, req.body.roleId, req.body.workSince, req.body.workTo, req.body.lastDate, req.body.lastUser];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[7] = row.loginName;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "PeopleCompanies schema.",
              description: "PeopleCompanies schema.",
              name: "peopleCompanies",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name countriesPost
 * @description post countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.countriesPost = function (req, res) {
  try {
    var sql, sqlSeq, vals = [], connection, row;

    // verify
    if (!req.body.iso || !req.body.nameCz) {
      res.json({
        id: null,
        type: "object",
        title: "Countries schema.",
        description: "Countries schema.",
        name: "countries",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "iso", code: 0}, // 0 required
            {name: "nameCz", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_countries_id\') AS id, login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO countries ' +
      '  (id, iso, name_cz, name_sk, name_eng, last_date, last_user) ' +
      'VALUES($1, $2, $3, $4, $5, $6, $7)';

    vals = [null, req.body.iso, req.body.nameCz, req.body.nameSk, req.body.nameEng, req.body.lastDate, req.body.lastUser];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            vals[6] = row.loginName;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Countries schema.",
              description: "Countries schema.",
              name: "countries",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name countriesPut
 * @description put countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.countriesPut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Countries schema.",
        description: "Countries schema.",
        name: "countries",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.id];
    tools.setUpdateProperty(req.body.iso, 'iso', vals, arrayColumns);
    tools.setUpdateProperty(req.body.nameCz, 'name_cz', vals, arrayColumns);
    tools.setUpdateProperty(req.body.nameSk, 'name_sk', vals, arrayColumns);
    tools.setUpdateProperty(req.body.nameEng, 'name_eng', vals, arrayColumns);

    sql =
      'UPDATE countries set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Countries schema.",
              description: "Countries schema.",
              name: "countries",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name countriesDelete
 * @description delete countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.countriesDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Countries schema.",
        description: "Countries schema.",
        name: "countries",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM countries WHERE id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.id], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Countries schema.",
              description: "Countries schema.",
              name: "countries",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name countriesAllDelete
 * @description delete all countries
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.countriesAllDelete = function (req, res) {
  try {
    var sql, connection;

/*
    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Countries schema.",
        description: "Countries schema.",
        name: "countries",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }
*/

    sql = 'DELETE FROM countries';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Countries schema.",
              description: "Countries schema.",
              name: "countries",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companiesPut
 * @description put companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companiesPut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Companies schema.",
        description: "Companies schema.",
        name: "companies",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.id];
    tools.setUpdateProperty(req.body.regId, 'reg_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.vatId, 'vat_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.companyName, 'company_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.companyGroup, 'company_group', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressTag1, 'address_tag_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressStreet1, 'address_street_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCity1, 'address_city_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressZip1, 'address_zip_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressRegion1, 'address_region_1', vals, arrayColumns);

    tools.setUpdateProperty(req.body.phone11, 'phone_1_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone11Tag, 'phone_1_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone12, 'phone_1_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone12Tag, 'phone_1_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone13, 'phone_1_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone13Tag, 'phone_1_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email11, 'email_1_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email11Tag, 'email_1_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email12, 'email_1_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email12Tag, 'email_1_2_tag', vals, arrayColumns);

    tools.setUpdateProperty(req.body.email13, 'email_1_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email13Tag, 'email_1_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax11, 'fax_1_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax11Tag, 'fax_1_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax12, 'fax_1_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax12Tag, 'fax_1_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressTag2, 'address_tag_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressStreet2, 'address_street_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCity2, 'address_city_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressZip2, 'address_zip_2', vals, arrayColumns);

    tools.setUpdateProperty(req.body.addressRegion2, 'address_region_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone21, 'phone_2_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone21Tag, 'phone_2_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone22, 'phone_2_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone22Tag, 'phone_2_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone23, 'phone_2_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone23Tag, 'phone_2_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email21, 'email_2_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email21Tag, 'email_2_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email22, 'email_2_2', vals, arrayColumns);

    tools.setUpdateProperty(req.body.email22Tag, 'email_2_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email23, 'email_2_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email23Tag, 'email_2_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax21, 'fax_2_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax21Tag, 'fax_2_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax22, 'fax_2_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax22Tag, 'fax_2_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressTag3, 'address_tag_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressStreet3, 'address_street_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCity3, 'address_city_3', vals, arrayColumns);

    tools.setUpdateProperty(req.body.addressZip3, 'address_zip_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressRegion3, 'address_region_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone31, 'phone_3_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone31Tag, 'phone_3_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone32, 'phone_3_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone32Tag, 'phone_3_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone33, 'phone_3_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.phone33Tag, 'phone_3_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email31, 'email_3_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email31Tag, 'email_3_1_tag', vals, arrayColumns);

    tools.setUpdateProperty(req.body.email32, 'email_3_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email32Tag, 'email_3_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email33, 'email_3_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email33Tag, 'email_3_3_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax31, 'fax_3_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax31Tag, 'fax_3_1_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax32, 'fax_3_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax32Tag, 'fax_3_2_tag', vals, arrayColumns);
    tools.setUpdateProperty(req.body.website1, 'website_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.website2, 'website_2', vals, arrayColumns);

    tools.setUpdateProperty(req.body.website3, 'website_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.facebook1, 'facebook_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.google1, 'google_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.twitter1, 'twitter_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.category, 'category', vals, arrayColumns);
    tools.setUpdateProperty(req.body.subcategory, 'subcategory', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCountry1, 'address_country_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCountry2, 'address_country_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.addressCountry3, 'address_country_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.facebook2, 'facebook_2', vals, arrayColumns);

    tools.setUpdateProperty(req.body.google2, 'google_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.twitter2, 'twitter_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.facebook3, 'facebook_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.google3, 'google_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.twitter3, 'twitter_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.rating, 'rating', vals, arrayColumns);
    //, req.body.lastDate, req.body.lastUser, req.body.ownerId

    sql =
      'UPDATE companies set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Companies schema.",
              description: "Companies schema.",
              name: "companies",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companiesDelete
 * @description delete companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companiesDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Companies schema.",
        description: "Companies schema.",
        name: "companies",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM companies WHERE id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.id], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Companies schema.",
              description: "Companies schema.",
              name: "companies",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peoplePut
 * @description put people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peoplePut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "People schema.",
        description: "People schema.",
        name: "people",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.id];
    tools.setUpdateProperty(req.body.title, 'title', vals, arrayColumns);
    tools.setUpdateProperty(req.body.firstName, 'first_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.middleName, 'middle_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.lastName, 'last_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.suffix, 'suffix', vals, arrayColumns);
    tools.setUpdateProperty(req.body.nickname, 'nickname', vals, arrayColumns);
    tools.setUpdateProperty(req.body.picture, 'picture', vals, arrayColumns);
    tools.setUpdateProperty(req.body.managerName, 'manager_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.assistantName, 'assistant_name', vals, arrayColumns);

    tools.setUpdateProperty(req.body.spouse, 'spouse', vals, arrayColumns);
    tools.setUpdateProperty(req.body.children, 'children', vals, arrayColumns);
    tools.setUpdateProperty(req.body.birthday, 'birthday', vals, arrayColumns);
    tools.setUpdateProperty(req.body.anniversary, 'anniversary', vals, arrayColumns);
    tools.setUpdateProperty(req.body.anniversaryName, 'anniversary_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.gender, 'gender', vals, arrayColumns);
    tools.setUpdateProperty(req.body.hobbies, 'hobbies', vals, arrayColumns);
    tools.setUpdateProperty(req.body.businessAddrName, 'business_addr_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.businessAddrStreet, 'business_addr_street', vals, arrayColumns);
    tools.setUpdateProperty(req.body.businessAddrCity, 'business_addr_city', vals, arrayColumns);

    tools.setUpdateProperty(req.body.businessAddrZip, 'business_addr_zip', vals, arrayColumns);
    tools.setUpdateProperty(req.body.businessAddrRegion, 'business_addr_region', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrName, 'home_addr_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrStreet, 'home_addr_street', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrCity, 'home_addr_city', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrZip, 'home_addr_zip', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrRegion, 'home_addr_region', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherAddrName, 'other_addr_name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherAddrStreet, 'other_addr_street', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherAddrCity, 'other_addr_city', vals, arrayColumns);

    tools.setUpdateProperty(req.body.otherAddrZip, 'other_addr_zip', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherAddrRegion, 'other_addr_region', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email, 'email', vals, arrayColumns);
    tools.setUpdateProperty(req.body.email2, 'email2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.skype, 'skype', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherIm, 'other_im', vals, arrayColumns);
    tools.setUpdateProperty(req.body.linkedin, 'linkedin', vals, arrayColumns);
    tools.setUpdateProperty(req.body.twitter, 'twitter', vals, arrayColumns);
    tools.setUpdateProperty(req.body.facebook, 'facebook', vals, arrayColumns);
    tools.setUpdateProperty(req.body.businessPhone, 'business_phone', vals, arrayColumns);

    tools.setUpdateProperty(req.body.assistantPhone, 'assistant_phone', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homePhone, 'home_phone', vals, arrayColumns);
    tools.setUpdateProperty(req.body.mobilePhone, 'mobile_phone', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherPhone, 'other_phone', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fax, 'fax', vals, arrayColumns);
    tools.setUpdateProperty(req.body.teamMember, 'team_member', vals, arrayColumns);
    tools.setUpdateProperty(req.body.private, 'private', vals, arrayColumns);
    tools.setUpdateProperty(req.body.note, 'note', vals, arrayColumns);
    tools.setUpdateProperty(req.body.noteAuthor, 'note_author', vals, arrayColumns);
    tools.setUpdateProperty(req.body.noteDate, 'note_date', vals, arrayColumns);

    tools.setUpdateProperty(req.body.userField1, 'user_field_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField2, 'user_field_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField3, 'user_field_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField4, 'user_field_4', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField5, 'user_field_5', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField6, 'user_field_6', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField7, 'user_field_7', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField8, 'user_field_8', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField9, 'user_field_9', vals, arrayColumns);
    tools.setUpdateProperty(req.body.userField10, 'user_Field_10', vals, arrayColumns);

    tools.setUpdateProperty(req.body.businessAddrCountry, 'business_addr_country', vals, arrayColumns);
    tools.setUpdateProperty(req.body.homeAddrCountry, 'home_addr_country', vals, arrayColumns);
    tools.setUpdateProperty(req.body.otherAddrCountry, 'other_addr_country', vals, arrayColumns);
    tools.setUpdateProperty(req.body.googlePlus, 'google_plus', vals, arrayColumns);


    sql =
      'UPDATE people set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "People schema.",
              description: "People schema.",
              name: "people",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peopleDelete
 * @description delete people
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peopleDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "People schema.",
        description: "People schema.",
        name: "people",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM people WHERE id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.id], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "People schema.",
              description: "People schema.",
              name: "people",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peopleCompaniesDelete
 * @description delete people_companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peopleCompaniesDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.people || !req.params.company) {
      res.json({
        id: null,
        type: "object",
        title: "People companies schema.",
        description: "People companies schema.",
        name: "peopleCompanies",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "people", code: 0}, // 0 required
            {name: "company", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM people_companies WHERE people_id = $1 and companies_id = $2';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.people, req.params.company], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "People companies schema.",
              description: "People companies schema.",
              name: "peopleCompanies",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name peopleCompaniesPut
 * @description put people_companies
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.peopleCompaniesPut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.people || !req.params.company) {
      res.json({
        peopleId: null,
        compnaiesId: null,
        type: "object",
        title: "People companies schema.",
        description: "People companies schema.",
        name: "peopleCompanies",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "peopleId", code: 0}, // 0 required
            {name: "companiesId", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.people, req.params.company];
    tools.setUpdateProperty(req.body.positionId, 'position_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.roleId, 'role_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.workSince, 'work_since', vals, arrayColumns);
    tools.setUpdateProperty(req.body.workTo, 'work_to', vals, arrayColumns);

    sql =
      'UPDATE people_companies set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  people_id = $1 ' +
      '  and companies_id = $2';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          }
        ).then(
          function () {
            res.json({
              peopleId: vals[0],
              companyId: vals[1],
              type: "object",
              title: "People companies schema.",
              description: "People companies schema.",
              name: "peopleCompanies",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaProducts
 * @description schemas of products
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaProducts = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/products/",
    "id": constants.APP_URL + "/api/exchange/products/",
    "type": "object",
    "title": "Products schema.",
    "description": "Products schema.",
    "name": "products",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "id": {
        "type": "number",
        "title": "Id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "code": {
        "type": "string",
        "title": "code of record",
        "description": "Record schema.",
        "name": "code"
      },
      "name": {
        "type": "string",
        "title": "name of record",
        "description": "Record schema.",
        "name": "name"
      },
      "shortDescription": {
        "type": "string",
        "title": "shortDescription of record",
        "description": "Record schema.",
        "name": "shortDescription"
      },
      "fullDescription": {
        "type": "string",
        "title": "fullDescription of record",
        "description": "Record schema.",
        "name": "fullDescription"
      },
      "rrp": {
        "type": "number",
        "title": "rrp of record",
        "description": "Record schema.",
        "name": "rrp"
      },
      "price1": {
        "type": "number",
        "title": "price1 of record",
        "description": "Record schema.",
        "name": "price1"
      },
      "price2": {
        "type": "number",
        "title": "price2 of record",
        "description": "Record schema.",
        "name": "price2"
      },
      "price3": {
        "type": "number",
        "title": "price3 of record",
        "description": "Record schema.",
        "name": "price3"
      },
      "price4": {
        "type": "number",
        "title": "price4 of record",
        "description": "Record schema.",
        "name": "price4"
      },
      "price5": {
        "type": "number",
        "title": "price5 of record",
        "description": "Record schema.",
        "name": "price5"
      },
      "picture": {
        "type": "string",
        "title": "picture of record",
        "description": "Record schema.",
        "name": "picture"
      },
      "unit": {
        "type": "string",
        "title": "unit of record",
        "description": "Record schema.",
        "name": "unit"
      },
      "currencyRrp": {
        "type": "string",
        "title": "currencyRrp of record",
        "description": "Record schema.",
        "name": "currencyRrp"
      },
      "currency1": {
        "type": "string",
        "title": "currency1 of record",
        "description": "Record schema.",
        "name": "currency1"
      },
      "currency2": {
        "type": "string",
        "title": "currency2 of record",
        "description": "Record schema.",
        "name": "currency2"
      },
      "currency3": {
        "type": "string",
        "title": "currency3 of record",
        "description": "Record schema.",
        "name": "currency3"
      },
      "currency4": {
        "type": "string",
        "title": "currency4 of record",
        "description": "Record schema.",
        "name": "currency4"
      },
      "currency5": {
        "type": "string",
        "title": "currency5 of record",
        "description": "Record schema.",
        "name": "currency5"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name products
 * @description list of products
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.products = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  p.id,' +
      '  p.code,' +
      '  p.name,' +
      '  p.short_description as "shortDescription",' +
      '  p.full_description as "fullDescription",' +
      '  p.rrp,' +
      '  p.price_1 as "price1",' +
      '  p.price_2 as "price2",' +
      '  p.price_3 as "price3",' +
      '  p.price_4 as "price4",' +
      '  p.price_5 as "price5",' +
      '  p.picture,' +
      '  p.unit,' +
      '  p.currency_rrp as "currencyRrp",' +
      '  p.currency_1 as "currency1",' +
      '  p.currency_2 as "currency2",' +
      '  p.currency_3 as "currency3",' +
      '  p.currency_4 as "currency4",' +
      '  p.currency_5 as "currency5" ' +
      'FROM ' +
      '  products p ' +
      '  LEFT JOIN products_synch ps ON p.id = ps.product_id ' +
      'WHERE ' +
      '  (ps.last_date >= $1::timestamp or $1 is null) ' +
      '  and (p.id = $2::numeric or $2 is null) ' +
      'ORDER BY ' +
      '  p.id desc ' +
      'LIMIT 1000';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.body.datetime, req.params.id], req, connection).then(
          function (result) {
            res.json(req.params.id ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name productsPost
 * @description post product
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.productsPost = function (req, res) {
  try {
    var sql = '', sqlSeq, vals = [], connection, row;

    // verify
/*
    if (!req.body.lastName) {
      res.json({
        id: null,
        type: "object",
        title: "Products schema.",
        description: "Products schema.",
        name: "products",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: []
        }
      });
      return;
    }
*/

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_product_id\') AS id, login_name as "loginName" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO products ' +
      '(id, code, name, short_description, full_description, rrp, price_1, price_2, price_3, price_4, price_5, picture, unit, ' +
      'currency_rrp, currency_1, currency_2, currency_3, currency_4, currency_5) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)';

    vals = [null, req.body.code, req.body.name, req.body.shortDescription, req.body.full_description, req.body.priceRrp,
      req.body.price1, req.body.price2, req.body.price3, req.body.price4, req.body.price5, req.body.picture, req.body.unit,
      req.body.currencyRrp, req.body.currency1, req.body.currency2, req.body.currency3, req.body.currency4, req.body.currency5];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Products schema.",
              description: "Products schema.",
              name: "products",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name productsPut
 * @description put product
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.productsPut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.id) {
      res.json({
        peopleId: null,
        compnaiesId: null,
        type: "object",
        title: "Products schema.",
        description: "Products schema.",
        name: "products",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.id];
    tools.setUpdateProperty(req.body.code, 'code', vals, arrayColumns);
    tools.setUpdateProperty(req.body.name, 'name', vals, arrayColumns);
    tools.setUpdateProperty(req.body.shortDescription, 'short_description', vals, arrayColumns);
    tools.setUpdateProperty(req.body.fullDescription, 'full_description', vals, arrayColumns);
    tools.setUpdateProperty(req.body.rrp, 'rrp', vals, arrayColumns);
    tools.setUpdateProperty(req.body.price1, 'price_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.price2, 'price_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.price3, 'price_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.price4, 'price_4', vals, arrayColumns);
    tools.setUpdateProperty(req.body.price5, 'price_5', vals, arrayColumns);
    tools.setUpdateProperty(req.body.picture, 'picture', vals, arrayColumns);
    tools.setUpdateProperty(req.body.unit, 'unit', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currencyRrp, 'currency_rrp', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency1, 'currency_1', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency2, 'currency_2', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency3, 'currency_3', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency4, 'currency_4', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency5, 'currency_5', vals, arrayColumns);

    sql =
      'UPDATE products set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          }
        ).then(
          function () {
            res.json({
              peopleId: vals[0],
              companyId: vals[1],
              type: "object",
              title: "Products schema.",
              description: "Products schema.",
              name: "products",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name productsDelete
 * @description delete product
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.productsDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Products schema.",
        description: "Products schema.",
        name: "products",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM products WHERE id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.id], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Products schema.",
              description: "Products schema.",
              name: "products",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name productsAllDelete
 * @description delete all products
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.productsAllDelete = function (req, res) {
  try {
    var sql, connection;

/*
    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Products schema.",
        description: "Products schema.",
        name: "products",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: []
        }
      });
      return;
    }
*/

    sql = 'DELETE FROM products';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Products schema.",
              description: "Products schema.",
              name: "products",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaBalance
 * @description schemas of balance
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaBalance = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/balance/",
    "id": constants.APP_URL + "/api/exchange/balance/",
    "type": "object",
    "title": "Balance schema.",
    "description": "Balance schema.",
    "name": "balance",
    "methods": [
      /*{type: "GET", code: ""},*/
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "companyId": {
        "type": "number",
        "title": "companyId of record",
        "description": "Record schema.",
        "name": "companyId"
      },
      "sign": {
        "type": "number",
        "title": "sign of record",
        "description": "Record schema.",
        "name": "sign"
      },
      "originDate": {
        "type": "date",
        "title": "originDate of record",
        "description": "Record schema.",
        "name": "originDate"
      },
      "dueDate": {
        "type": "date",
        "title": "dueDate of record",
        "description": "Record schema.",
        "name": "dueDate"
      },
      "paymentDate": {
        "type": "date",
        "title": "paymentDate of record",
        "description": "Record schema.",
        "name": "paymentDate"
      },
      "document": {
        "type": "string",
        "title": "document of record",
        "description": "Record schema.",
        "name": "document"
      },
      "amount": {
        "type": "number",
        "title": "amount of record",
        "description": "Record schema.",
        "name": "amount"
      },
      "balance": {
        "type": "number",
        "title": "balance of record",
        "description": "Record schema.",
        "name": "balance"
      },
      "currency": {
        "type": "string",
        "title": "currency of record",
        "description": "Record schema.",
        "name": "currency"
      },
      "rate": {
        "type": "number",
        "title": "rate of record",
        "description": "Record schema.",
        "name": "rate"
      },
      "amountCommon": {
        "type": "number",
        "title": "amountCommon of record",
        "description": "Record schema.",
        "name": "amountCommon"
      },
      "balanceCommon": {
        "type": "number",
        "title": "balanceCommon of record",
        "description": "Record schema.",
        "name": "balanceCommon"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name balancePost
 * @description post balance
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.balancePost = function (req, res) {
  try {
    var sql = '', vals = [], connection, row;

    // verify
    /*
     if (!req.body.lastName) {
     res.json({
     id: null,
     type: "object",
     title: "Balance schema.",
     description: "Balance schema.",
     name: "balance",
     method: "post",
     status: 0, // 0 error, 1 success
     error: {
     fields: []
     }
     });
     return;
     }
     */

    sql =
      'INSERT INTO balance ' +
      '(company_id, sign, origin_date, due_date, payment_date, document, ' +
      'amount, balance, currency, rate, amount_common, balance_common) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';

    vals = [req.body.companyId, req.body.sign, req.body.originDate, req.body.dueDate, req.body.paymentDate, req.body.document,
      req.body.amount, req.body.balance, req.body.currency, req.body.rate, req.body.amountCommon, req.body.balanceCommon];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, vals, connection).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Balance schema.",
              description: "Balance schema.",
              name: "balance",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name balanceAllDelete
 * @description delete all balance
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.balanceAllDelete = function (req, res) {
  try {
    var sql, connection;

/*
    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Balance schema.",
        description: "Balance schema.",
        name: "balance",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: []
        }
      });
      return;
    }
*/

    sql = 'DELETE FROM balance';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Balance schema.",
              description: "Balance schema.",
              name: "balance",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaSales
 * @description schemas of sales
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaSales = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/sales/",
    "id": constants.APP_URL + "/api/exchange/sales/",
    "type": "object",
    "title": "Sales schema.",
    "description": "Sales schema.",
    "name": "sales",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"},
      {type: "PUT", code: "update"},
      {type: "DELETE", code: "delete"}
    ],
    "properties": {
      "id": {
        "type": "number",
        "title": "id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "docDate": {
        "type": "date",
        "title": "docDate of record",
        "description": "Record schema.",
        "name": "docDate"
      },
      "companyId": {
        "type": "number",
        "title": "companyId of record",
        "description": "Record schema.",
        "name": "companyId"
      },
      "document": {
        "type": "string",
        "title": "document of record",
        "description": "Record schema.",
        "name": "document"
      },
      "repId": {
        "type": "number",
        "title": "repId of record",
        "description": "Record schema.",
        "name": "repId"
      },
      "productId": {
        "type": "number",
        "title": "productId of record",
        "description": "Record schema.",
        "name": "productId"
      },
      "note": {
        "type": "string",
        "title": "note of record",
        "description": "Record schema.",
        "name": "note"
      },
      "quantity": {
        "type": "number",
        "title": "quantity of record",
        "description": "Record schema.",
        "name": "quantity"
      },
      "unitPrice": {
        "type": "number",
        "title": "unitPrice of record",
        "description": "Record schema.",
        "name": "unitPrice"
      },
      "discount": {
        "type": "number",
        "title": "discount of record",
        "description": "Record schema.",
        "name": "discount"
      },
      "totalPrice": {
        "type": "number",
        "title": "totalPrice of record",
        "description": "Record schema.",
        "name": "totalPrice"
      },
      "currency": {
        "type": "string",
        "title": "currency of record",
        "description": "Record schema.",
        "name": "currency"
      },
      "rate": {
        "type": "number",
        "title": "rate of record",
        "description": "Record schema.",
        "name": "rate"
      },
      "totalCommonPrice": {
        "type": "number",
        "title": "totalCommonPrice of record",
        "description": "Record schema.",
        "name": "totalCommonPrice"
      },
      "domainId": {
        "type": "number",
        "title": "domainId of record",
        "description": "Record schema.",
        "name": "domainId"
      },
      "unitCost": {
        "type": "number",
        "title": "unitCost of record",
        "description": "Record schema.",
        "name": "unitCost"
      },
      "totalCost": {
        "type": "number",
        "title": "totalCost of record",
        "description": "Record schema.",
        "name": "totalCost"
      },
      "totalCommonCost": {
        "type": "number",
        "title": "totalCommonCost of record",
        "description": "Record schema.",
        "name": "totalCommonCost"
      },
      "totalCommonProfit": {
        "type": "number",
        "title": "totalCommonProfit of record",
        "description": "Record schema.",
        "name": "totalCommonProfit"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name salesPost
 * @description post sales
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesPost = function (req, res) {
  try {
    var sql = '', sqlSeq, vals = [], connection, row;

    // verify
    /*
     if (!req.body.lastName) {
     res.json({
     id: null,
     type: "object",
     title: "Sales schema.",
     description: "Sales schema.",
     name: "sales",
     method: "post",
     status: 0, // 0 error, 1 success
     error: {
     fields: []
     }
     });
     return;
     }
     */

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_sales_id\') AS id, login_name as "loginName" FROM users_login ul WHERE login_token = $1';

    sql =
      'INSERT INTO sales ' +
      '(id, doc_date, company_id, document, rep_id, product_id, note, quantity, unit_price, discount, total_price, currency, rate, ' +
      'total_common_price, domain_id, unit_cost, total_cost, total_common_cost, total_common_profit) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)';

    vals = [null, req.body.docDate, req.body.companyId, req.body.document, req.body.repId, req.body.productId,
      req.body.note, req.body.quantity, req.body.unitPrice, req.body.discount, req.body.totalPrice, req.body.currency, req.body.rate,
      req.body.totalCommonPrice, req.body.domainId, req.body.unitCost, req.body.totalCost, req.body.totalCommonCost, req.body.totalCommonProfit];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [req.body.hash], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            /*vals[65] = row.loginName;*/
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: vals[0],
              type: "object",
              title: "Sales schema.",
              description: "Sales schema.",
              name: "sales",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name salesPut
 * @description put sales
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesPut = function (req, res) {
  try {
    var sql, sqlUser, vals = [], connection, arrayColumns = [];

    // verify
    if (!req.params.id) {
      res.json({
        peopleId: null,
        compnaiesId: null,
        type: "object",
        title: "Sales schema.",
        description: "Sales schema.",
        name: "sales",
        method: "put",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlUser = 'SELECT login_name as "loginName", people_id as "ownerId" FROM users_login ul WHERE login_token = $1';

    vals = [req.params.id];
    tools.setUpdateProperty(req.body.docDate, 'doc_date', vals, arrayColumns);
    tools.setUpdateProperty(req.body.companyId, 'company_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.document, 'document', vals, arrayColumns);
    tools.setUpdateProperty(req.body.repId, 'rep_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.productId, 'product_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.note, 'note', vals, arrayColumns);
    tools.setUpdateProperty(req.body.quantity, 'quantity', vals, arrayColumns);
    tools.setUpdateProperty(req.body.unitPrice, 'unit_price', vals, arrayColumns);
    tools.setUpdateProperty(req.body.discount, 'discount', vals, arrayColumns);
    tools.setUpdateProperty(req.body.totalPrice, 'total_price', vals, arrayColumns);
    tools.setUpdateProperty(req.body.currency, 'currency', vals, arrayColumns);
    tools.setUpdateProperty(req.body.rate, 'rate', vals, arrayColumns);
    tools.setUpdateProperty(req.body.totalCommonPrice, 'total_common_price', vals, arrayColumns);
    tools.setUpdateProperty(req.body.domainId, 'domain_id', vals, arrayColumns);
    tools.setUpdateProperty(req.body.unitCost, 'unit_cost', vals, arrayColumns);
    tools.setUpdateProperty(req.body.totalCost, 'total_cost', vals, arrayColumns);
    tools.setUpdateProperty(req.body.totalCommonCost, 'total_common_cost', vals, arrayColumns);
    tools.setUpdateProperty(req.body.totalCommonProfit, 'total_common_profit', vals, arrayColumns);

    sql =
      'UPDATE sales set ' +
      arrayColumns.join(',') + ' ' +
      'WHERE ' +
      '  id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlUser, [req.body.hash], req, connection).then(
          function (result) {
            return postgres.executeSQL(req, res, sql, vals, connection);
          }
        ).then(
          function () {
            res.json({
              peopleId: vals[0],
              companyId: vals[1],
              type: "object",
              title: "Sales schema.",
              description: "Sales schema.",
              name: "sales",
              method: "put",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name salesDelete
 * @description delete sales
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Sales schema.",
        description: "Sales schema.",
        name: "sales",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "id", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM sales WHERE id = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.id], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Sales schema.",
              description: "Sales schema.",
              name: "sales",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name salesAllDelete
 * @description delete all sales
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesAllDelete = function (req, res) {
  try {
    var sql, connection;

    /*
     // verify
     if (!req.params.id) {
     res.json({
     id: null,
     type: "object",
     title: "Sales schema.",
     description: "Sales schema.",
     name: "sales",
     method: "delete",
     status: 0, // 0 error, 1 success
     error: {
     fields: []
     }
     });
     return;
     }
     */

    sql = 'DELETE FROM sales';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Sales schema.",
              description: "Sales schema.",
              name: "sales",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name salesDocumentDelete
 * @description delete sales with document
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.salesDocumentDelete = function (req, res) {
  try {
    var sql, connection;

    // verify
    if (!req.params.id) {
      res.json({
        id: null,
        type: "object",
        title: "Sales schema.",
        description: "Sales schema.",
        name: "sales",
        method: "delete",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "document", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql = 'DELETE FROM sales WHERE document = $1';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, [req.params.document], connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Sales schema.",
              description: "Sales schema.",
              name: "sales",
              method: "delete",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaCurrency
 * @description schemas of currency
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaCurrency = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/currency/",
    "id": constants.APP_URL + "/api/exchange/currency/",
    "type": "object",
    "title": "Currency schema.",
    "description": "Currency schema.",
    "name": "currency",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"}
    ],
    "properties": {
      "code": {
        "type": "string",
        "title": "code of record",
        "description": "Record schema.",
        "name": "code"
      },
      "name": {
        "type": "string",
        "title": "name of record",
        "description": "Record schema.",
        "name": "name"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name currency
 * @description list of currency
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.currency = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  code,' +
      '  name ' +
      'FROM ' +
      '  currency c ' +
      'WHERE ' +
      '  (code = $1::varchar or $1 is null) ' +
      'ORDER BY ' +
      '  code desc ' +
      'LIMIT 1000';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.params.code], req, connection).then(
          function (result) {
            res.json(req.params.code ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name currencyPost
 * @description post currency
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.currencyPost = function (req, res) {
  try {
    var sql = '', vals = [], connection;

    // verify
    /*
     if (!req.body.lastName) {
     res.json({
     id: null,
     type: "object",
     title: "Currency schema.",
     description: "Currency schema.",
     name: "currency",
     method: "post",
     status: 0, // 0 error, 1 success
     error: {
     fields: []
     }
     });
     return;
     }
     */

    sql =
      'INSERT INTO currency (code, name) VALUES ($1, $2)';

    vals = [req.body.code, req.body.name];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, vals, connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Currency schema.",
              description: "Currency schema.",
              name: "currency",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaUnits
 * @description schemas of units
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaUnits = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/units/",
    "id": constants.APP_URL + "/api/exchange/units/",
    "type": "object",
    "title": "Units schema.",
    "description": "Units schema.",
    "name": "units",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"}
    ],
    "properties": {
      "code": {
        "type": "string",
        "title": "code of record",
        "description": "Record schema.",
        "name": "code"
      },
      "name": {
        "type": "string",
        "title": "name of record",
        "description": "Record schema.",
        "name": "name"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name units
 * @description list of units
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.units = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  code,' +
      '  name ' +
      'FROM ' +
      '  units u ' +
      'WHERE ' +
      '  (code = $1::varchar or $1 is null) ' +
      'ORDER BY ' +
      '  code desc ' +
      'LIMIT 1000';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.params.code], req, connection).then(
          function (result) {
            res.json(req.params.code ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name unitsPost
 * @description post units
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.unitsPost = function (req, res) {
  try {
    var sql = '', vals = [], connection;

    // verify
    if (!req.body.code) {
      res.json({
        id: null,
        type: "object",
        title: "Units schema.",
        description: "Units schema.",
        name: "units",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "code", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sql =
      'INSERT INTO units (code, name) VALUES ($1, $2)';

    vals = [req.body.code, req.body.name];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.executeSQL(req, res, sql, vals, connection).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Units schema.",
              description: "Units schema.",
              name: "units",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name schemaCompanyGroups
 * @description schemas of company groups
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.schemaCompanyGroups = function (req, res) {
  var result = {
    "$schema": constants.APP_URL + "/api/exchange/schema/company-groups/",
    "id": constants.APP_URL + "/api/exchange/company-groups/",
    "type": "object",
    "title": "Company groups schema.",
    "description": "Company groups schema.",
    "name": "companyGroups",
    "methods": [
      {type: "GET", code: ""},
      {type: "POST", code: "create"}
    ],
    "properties": {
      "id": {
        "type": "number",
        "title": "id of record",
        "description": "Record schema.",
        "name": "id"
      },
      "name": {
        "type": "string",
        "title": "name of record",
        "description": "Record schema.",
        "name": "name"
      }
    },
    "required": [
      "connectString",
      "hash"
    ]
  };
  tools.sendResponseSuccess(result, res, false);
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companyGroups
 * @description list of company groups
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companyGroups = function (req, res) {
  try {
    var sql, connection;
    sql =
      'SELECT ' +
      '  id,' +
      '  name ' +
      'FROM ' +
      '  company_groups cg ' +
      'WHERE ' +
      '  (id = $1::numeric or $1 is null) ' +
      'ORDER BY ' +
      '  id desc ' +
      'LIMIT 1000';

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sql, [req.params.id], req, connection).then(
          function (result) {
            res.json(req.params.id ? (result.rows[0] || {}) : result.rows);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name companyGroupsPost
 * @description post company groups
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companyGroupsPost = function (req, res) {
  try {
    var sql = '', sqlSeq, vals = [], connection, row;

    // verify
    if (!req.body.name) {
      res.json({
        id: null,
        type: "object",
        title: "Company groups schema.",
        description: "Company groups schema.",
        name: "companyGroups",
        method: "post",
        status: 0, // 0 error, 1 success
        error: {
          fields: [
            {name: "name", code: 0} // 0 required
          ]
        }
      });
      return;
    }

    sqlSeq = req.body.id ? 'SELECT null AS id' : 'SELECT nextval(\'seq_company_groups_id\') AS id';

    sql =
      'INSERT INTO company_groups (id, name) VALUES ($1, $2)';

    vals = [null, req.body.name];

    conn.getConnectionForExportImportAPI(req, {connectString: req.body.connectString}).then(
      function (result) {
        connection = result;
        postgres.select(sqlSeq, [], req, connection).then(
          function (result) {
            row = tools.getSingleResult(result);
            vals[0] = row.id || req.body.id;
            return postgres.executeSQL(req, res, sql, vals, connection);
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        ).then(
          function () {
            res.json({
              id: req.body.id,
              type: "object",
              title: "Company groups schema.",
              description: "Company groups schema.",
              name: "companyGroups",
              method: "post",
              status: 1, // 0 error, 1 success
              error: {
                fields: []
              }
            });
          },
          function (result) {
            tools.sendResponseError(result, res, false);
          }
        );
      }
    );
  } catch (e) {
    tools.sendResponseError(e, res, false);
  }
};
