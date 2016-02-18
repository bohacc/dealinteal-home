/*jslint node: true, unparam: true */
'use strict';

/**
 * @file people_companies
 * @fileOverview __Server_REST_API_People_Companies
 */

/**
 * @namespace __Server_REST_API_People_Companies
 * @author Pavel Kolomazník
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  companies = require('./companies'),
  positions = require('./positions'),
  roles = require('./roles');

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name exists
 * @description search connection between person and company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.exists = function (req, res) {
  var sql = 'SELECT COMPANIES_ID AS ID FROM PEOPLE_COMPANIES pc WHERE PEOPLE_ID = $1';
  return postgres.select(sql, [req.body.people_id], req).then(
    function (result) {
      return {exists: tools.getSingleResult(result).id > 0};
    },
    function (result) {
      return {};
    }
  );
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name insert
 * @description insert new connection into PEOPLE_COMPANIES
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.insert = function (req, res) {
  var sql = 'INSERT INTO PEOPLE_COMPANIES (PEOPLE_ID, COMPANIES_ID, POSITION_ID, ROLE_ID, WORK_SINCE, WORK_TO) ' +
    'VALUES ($1, $2, $3, $4, to_timestamp($5,\'DD.MM.YYYY HH24:MI\'), to_timestamp($6,\'DD.MM.YYYY HH24:MI\'))';
  req.assert('people_id', 'people_id musí být vyplněno.').notEmpty();
  req.assert('companies_id', 'companies_id musí být vyplněno.').notEmpty();

  return postgres.executeSQL(req, res, sql, [req.body.people_id, req.body.companies_id, req.body.position_id,
    req.body.role_id, req.body.work_since, req.body.work_to]);
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name delete
 * @description delete connection from PEOPLE_COMPANIES
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.delete = function (req, res) {
  var sql = 'DELETE FROM PEOPLE_COMPANIES WHERE PEOPLE_ID = $1 AND COMPANIES_ID = $2';
  return postgres.executeSQL(req, res, sql, [req.body.people_id, req.body.companies_id], null, null);
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name updateCompany
 * @description udpate connection between person and company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.updateCompany = function (req, res) {
  var sql = 'UPDATE PEOPLE_COMPANIES SET COMPANIES_ID = $3, WORK_SINCE = $4::date, WORK_TO = $5::date WHERE PEOPLE_ID = $1 AND COMPANIES_ID = $2';
  return postgres.executeSQL(req, res, sql, [req.body.people_id, req.body.companies_id, req.body.newCompanyId, req.body.work_since, req.body.work_to]);
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name updatePosition
 * @description udpate connection between person and position in company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.updatePosition = function (req, res) {
  var sql = 'UPDATE PEOPLE_COMPANIES SET POSITION_ID = $3 WHERE PEOPLE_ID = $1 AND COMPANIES_ID = $2';
  return postgres.executeSQL(req, res, sql, [req.body.people_id, req.body.companies_id, req.body.position_id]);
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name updateRole
 * @description udpate connection between person and role in company
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.updateRole = function (req, res) {
  var sql = 'UPDATE PEOPLE_COMPANIES SET ROLE_ID = $3 WHERE PEOPLE_ID = $1 AND COMPANIES_ID = $2';
  return postgres.executeSQL(req, res, sql, [req.body.people_id, req.body.companies_id, req.body.role_id]);
};

/**
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name updateAll
 * @description udpate all connections between person, company, position and role
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.updateAll = function (req, res, noCloseReq) {
  var companyExists, peopleCompanyExists, positionExists, roleExists;
  try {
    // když smažu náze firmy, mažu vazbu people_companies a nic dalšího nedělám
    if (req.body.companies_id && !req.body.company_name) {
      exports.delete(req, res);
      return tools.sendResponseSuccess(constants.OK, res, noCloseReq);
    }
    // nebyla vazba a nová společnost není vyplněná - konec
    if (!req.body.companies_id && !req.body.company_name) {
      return tools.sendResponseSuccess(constants.OK, res, noCloseReq);
    }
    // zjišťuji, jestli existuje společnost
    return companies.exists(req, res).then(
      function (result) {
        var company = tools.getSingleResult(result);
        if (req.body.companies_id) {
          companyExists = {exists: true, companyId: req.body.companies_id};
        } else {
          companyExists = {exists: company.exists, companyId: company.id};
        }
      }
    ).then(
      function () {
        // společnost neexistuje - zakládám novou a předávám dál nové ID, jinak předávám dál ID podle názvu společnosti
        return !companyExists.exists ? companies.post(req, res, noCloseReq) : {id: companyExists.companyId};
      }
    ).then(
      function (result) {
        // zjišťuji, jestli existuje JAKÁKOLIV vazba na člověka (v PEOPLE_COMPANIES je osoba pouze 1x)
        req.body.newCompanyId = result.id;
        return exports.exists(req, res).then(
          function (result) {
            peopleCompanyExists = tools.getSingleResult(result);
            if (!peopleCompanyExists.exists) {
              req.body.companies_id = req.body.newCompanyId; // pro insert
            }
          }
        );
      }
    ).then(
      function () {
        // existuje-li JAKÁKOLIV vazba v PEOPLE_COMPANIES, pak update, jinak insert
        return peopleCompanyExists.exists ? exports.updateCompany(req, res) : exports.insert(req, res);
      }
    ).then(
      function () {
        req.body.companies_id = req.body.newCompanyId; // už musí být aktuální companies_id i v případě změny na existující
        // zjišťuji, jestli existuje pozice
        return positions.exists(req, res).then(
          function (result) {
            var position = tools.getSingleResult(result);
            positionExists = {exists: position.exists, positionId: position.id};
          }
        );
      }
    ).then(
      function () {
        // pozice neexistuje - zakládám novou a předávám dál nové ID, jinak předávám dál ID(null) podle názvu pozice
        return (!positionExists.exists && req.body.positionBox[0] && req.body.positionBox[0].name) ? positions.insert(req, res, noCloseReq) : {newPositionId: positionExists.positionId};
      }
    ).then(
      function (result) {
        // update pozice v tabulce PEOPLE_COMPANIES
        req.body.position_id = result.newPositionId;
        return exports.updatePosition(req, res);
      }
    ).then(
      function () {
        // zjišťuji, jestli existuje role
        return roles.exists(req, res).then(
          function (result) {
            var role = tools.getSingleResult(result);
            roleExists = {exists: role.exists, roleId: role.id};
          }
        );
      }
    ).then(
      function () {
        // role neexistuje - zakládám novou a předávám dál nové ID, jinak předávám dál ID(null) podle názvu role
        return (!roleExists.exists && req.body.roleBox[0] && req.body.roleBox[0].name) ? roles.insert(req, res, noCloseReq) : {newRoleId: roleExists.roleId};
      }
    ).then(
      function (result) {
        // update role v tabulce PEOPLE_COMPANIES
        req.body.role_id = result.newRoleId;
        return exports.updateRole(req, res);
      }
    ).then(
      function () {
        return tools.sendResponseSuccess({companies_id: req.body.companies_id, position_id: req.body.position_id, role_id: req.body.role_id}, res, noCloseReq);
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
 * @memberof __Server_REST_API_People_Companies
 * @method
 * @name deletePeople
 * @description delete persons from company from DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.deletePeople = function (req, res) {
  var sql, errors, ids, isNotNumber, message_valid_format = constants.MESSAGE_VALIDATION_FORMAT;
  isNotNumber = function (el) {
    return !tools.isNumber(el);
  };
  req.assert('id', 'ID row not found.').notEmpty();
  req.assert('people', 'People ids not found.').notEmpty();
  if (req.params.people.split(',').some(isNotNumber)) {
    req.assert('people', tools.getValidationMessage('people', message_valid_format, null, null)).isNull();
  }

  errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  }

  try {
    ids = '(' + req.params.people + ')';
    sql = 'DELETE FROM PEOPLE_COMPANIES WHERE COMPANIES_ID = $1 AND PEOPLE_ID IN ' + ids;
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
