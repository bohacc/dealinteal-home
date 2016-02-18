/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 16.10.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file export_csv
 * @fileOverview __Server_REST_API_ImportCSVService
 */

/**
 * @namespace __Server_REST_API_ImportCSVService
 * @author Martin Boháč
 */

var postgres = require('./api_pg'),
  tools = require('./tools'),
  constants = require('./constants'),
  importCsv = require('./import_csv'),
  socketio = require('./socketio'),
  fs = require('fs'),
  readline = require('readline'),
  Stream = require('stream'),
  Promise = require('promise');

/**
 * @memberof __Server_REST_API_ImportCSVService
 * @method
 * @name companiesPost
 * @description import csv to companies_import_csv_v1
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companiesPost = function (req, res) {
  console.log('import - companies');
  var instream, outstream, rl, messages, flag = true, sqlDelete, sqlProperties, stack = [];
  sqlDelete = 'delete from companies_import_csv_v1';
  try {
    messages = [
      {
        message: {
          type: constants.MESSAGE_INFO_IMPORT_CSV,
          count: 0,
          step: 0,
          process: 0,
          inserted: 0,
          success: false,
          readFile: {
            step: 0,
            process: 0,
            success: false
          }
        }
      }
    ];

    socketio.listenCurrentUser(req, function (message) {
      if (message.cancelImport) {
        // cancel import
        rl.close();
        // response
        messages[0].message.isCancel = true;
        socketio.sendForCurrentUser(req, messages);
      }
    });

    // get count
    instream = fs.createReadStream(req.files.file.path);
    outstream = new Stream();
    rl = readline.createInterface(instream, outstream);
    rl.on('line', function (line) {
      messages[0].message.count += 1;
    });

    // action after calculate count
    rl.on('close', function () {
      // end read all row of file for calculate count
      // actions
      //messages[0].message.count = 8000;

      sqlProperties = postgres.createTransaction(req);
      sqlProperties.aliveOnError = true;
      postgres.executeSQL(req, res, sqlDelete, [], null, sqlProperties).then(
        function () {
          console.log('rows delete success');
          instream = fs.createReadStream(req.files.file.path);
          outstream = new Stream();
          rl = readline.createInterface(instream, outstream);

          rl.on('line', function (line) {
            // cancel on error
            if (messages[0].message.failed) {
              rl.close();
            }

            // process line here
            if (((messages[0].message.count / 100) * messages[0].message.readFile.process) < messages[0].message.readFile.step) {
              messages[0].message.readFile.process += 1;
            }
            messages[0].message.readFile.step += 1;

            // execute sql
            //if (messages[0].message.readFile.step <= 8000) {
            importCsv.companiesSql(req, res, messages, line, sqlProperties);
            //}

            // send process info messages to client
            if (flag) {
              setTimeout(function () {
                socketio.sendForAllUsers(messages);
                flag = true;
              }, 1000);
              flag = false;
            }
            // success messege
            if (messages[0].message.readFile.step === messages[0].message.count) {
              messages[0].message.readFile.success = true;
              socketio.sendForCurrentUser(req, messages);
            }
          });

          rl.on('error', function (err) {
            messages[0].message.failed = true;
            messages[0].message.msg = err;
            socketio.sendForCurrentUser(req, messages);
          });
        },
        function () {
          console.log('rows delete error');
        }
      );
    });

    rl.on('error', function (err) {
      messages[0].message.failed = true;
      messages[0].message.msg = err;
      socketio.sendForCurrentUser(req, messages);
    });
  } catch (e) {
    console.log(e);
    tools.sendResponseError(e, res, false);
  }
  res.json({startImportSuccess: true});
};

/**
 * @memberof __Server_REST_API_ImportCSVService
 * @method
 * @name companies
 * @description insert data to companies_import_csv_v1
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param messages {Object} messages
 * @param line {String} line
 * @param sqlProperties {Object} sqlProperties
 * @returns void
 */
exports.companiesSql = function (req, res, messages, line, sqlProperties) {
  var sql, vals = [], sep = constants.EXPORT_CSV_SEPARATOR, flag = true;
  sql =
    'INSERT INTO companies_import_csv_v1(' +
    '  id, reg_id, vat_id, company_name, company_group, address_tag_1, address_street_1, address_city_1, address_zip_1, address_region_1, ' +
    '  phone_1_1, phone_1_1_tag, phone_1_2, phone_1_2_tag, phone_1_3, phone_1_3_tag, email_1_1, email_1_1_tag, email_1_2, email_1_2_tag, ' +
    '  email_1_3, email_1_3_tag, fax_1_1, fax_1_1_tag, fax_1_2, fax_1_2_tag, address_tag_2, address_street_2, address_city_2, address_zip_2, ' +
    '  address_region_2, phone_2_1, phone_2_1_tag, phone_2_2, phone_2_2_tag, phone_2_3, phone_2_3_tag, email_2_1, email_2_1_tag, email_2_2, ' +
    '  email_2_2_tag, email_2_3, email_2_3_tag, fax_2_1, fax_2_1_tag, fax_2_2, fax_2_2_tag, address_tag_3, address_street_3, address_city_3, ' +
    '  address_zip_3, address_region_3, phone_3_1, phone_3_1_tag, phone_3_2, phone_3_2_tag, phone_3_3, phone_3_3_tag, email_3_1, email_3_1_tag, ' +
    '  email_3_2, email_3_2_tag, email_3_3, email_3_3_tag, fax_3_1, fax_3_1_tag, fax_3_2, fax_3_2_tag, website_1, website_2, ' +
    '  website_3, facebook_1, google_1, twitter_1, category, subcategory, address_country_1, address_country_2, address_country_3, facebook_2, ' +
    '  google_2, twitter_2, facebook_3, google_3, twitter_3, rating, people_id, people_title, people_first_name, people_middle_name, ' +
    '  people_last_name, people_suffix, people_nickname, people_picture, people_manager_name, people_assistant_name, people_spouse, people_children, people_birthday, people_anniversary, ' +
    '  people_anniversary_name, people_gender, people_hobbies, people_business_addr_name, people_business_addr_street, people_business_addr_city, people_business_addr_zip, people_business_addr_region, people_home_addr_name, people_home_addr_street, ' +
    '  people_home_addr_city, people_home_addr_zip, people_home_addr_region, people_other_addr_name, people_other_addr_street, people_other_addr_city, people_other_addr_zip, people_other_addr_region, people_email, people_email2, ' +
    '  people_skype, people_other_im, people_linkedin, people_twitter, people_facebook, people_business_phone, people_assistant_phone, people_home_phone, people_mobile_phone, people_other_phone, ' +
    '  people_fax, people_team_member, people_private, people_note, people_note_author, people_note_date, people_user_field_1, people_user_field_2, people_user_field_3, people_user_field_4, ' +
    '  people_user_field_5, people_user_field_6, people_user_field_7, people_user_field_8, people_user_field_9, people_user_field_10, people_business_addr_country, people_home_addr_country, people_other_addr_country, people_google_plus) ' +
    ' values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,' +
    '  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,' +
    '  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,' +
    '  $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,' +
    '  $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,' +
    '  $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,' +
    '  $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,' +
    '  $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,' +
    '  $81, $82, $83, $84, $85, $86, $87, $88, $89, $90,' +
    '  $91, $92, $93, $94, $95, $96, $97, $98, $99, $100,' +
    '  $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,' +
    '  $111, $112, $113, $114, $115, $116, $117, $118, $119, $120,' +
    '  $121, $122, $123, $124, $125, $126, $127, $128, $129, $130,' +
    '  $131, $132, $133, $134, $135, $136, $137, $138, $139, $140,' +
    '  $141, $142, $143, $144, $145, $146, $147, $148, $149, $150)';

  //console.log(line);

  vals = line.split(new RegExp(sep + '(?=(?:(?:[^"]*"){2})*[^"]*$)'));
  vals = vals.map(function (val) {
    if (val && val.indexOf(sep) > -1) {
      val = val.substring(1, val.length - 1);
    }
    return val || null;
  });

  //console.log(vals);

  // event after first line execute - labels
  if (messages[0].message.readFile.step === 1) {
    messages[0].message.step += 1;
    return;
  }

  //console.log(messages[0]);
  if (messages[0].message.failed) {
    return;
  }

  postgres.executeSQL(req, res, sql, vals, null, sqlProperties).then(
    function () {
      //console.log('row insert success');
      // process line here
      if (((messages[0].message.count / 100) * messages[0].message.process) < messages[0].message.step) {
        messages[0].message.process += 1;
      }
      messages[0].message.step += 1;
      // send process info messages to client
      if (flag) {
        setTimeout(function () {
          socketio.sendForAllUsers(messages);
          flag = true;
        }, 1000);
        flag = false;
      }
      // success messege
      if (messages[0].message.step === messages[0].message.count) {
        // close transaction
        sqlProperties.tx.commit();
        sqlProperties.client.end();

        messages[0].message.success = true;
        socketio.sendForCurrentUser(req, messages);
      }

      messages[0].message.inserted += 1;
      socketio.sendForCurrentUser(req, messages);

      // all insert is done - success message
      if (messages[0].message.inserted >= messages[0].message.count) {
        messages[0].message.success = true;
        socketio.sendForCurrentUser(req, messages);
      }
    },
    function (result) {
      console.log('row insert error');
      console.log(vals);
      //console.log(vals);
      messages[0].message.step += 1;
      messages[0].message.failed = true;
      messages[0].message.msg = result;
      socketio.sendForCurrentUser(req, messages);
    }
  );
};

/**
 * @memberof __Server_REST_API_ImportCSVService
 * @method
 * @name companiesGet
 * @description get data from companies_import_csv_v1
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.companiesGet = function (req, res) {
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
      sqlOrderByDirection;

    accessColumnOrder = ['COMPANY_NAME', 'RATING'];
    accessColumnOrderDirection = ['ASC', 'DESC'];
    sqlOrderByField = accessColumnOrder.indexOf(sortField) > -1 ? sortField : ' ID ';
    sqlOrderByDirection = accessColumnOrderDirection.indexOf(sortDirection) > -1 ? sortDirection : ' ASC ';
    sqlOrderBy = ' ' + sqlOrderByField + ' ' + (sqlOrderByField ? sqlOrderByDirection : '') + ' ';

    sql =
      'SELECT ' +
      '  company_name AS "companyName" ' +
      'FROM ' +
      '  companies_import_csv_v1 c ' +
      'ORDER BY ' +
      sqlOrderBy +
      'LIMIT $1::integer ' +
      'OFFSET $2::integer';

    sqlCount =
      'SELECT ' +
      '  count(*) AS rowscount ' +
      'FROM ' +
      '  companies_import_csv_v1 c ';

    if (loadCount === 1) {
      postgres.select(sqlCount, [], req).then(
        function (result) {
          obj.count = tools.getSingleResult(result).rowscount || 0;
          res.json(obj);
        },
        function (result) {
          tools.sendResponseError(result, res, false);
        }
      );
    } else {
      postgres.select(sql, [amount, offset], req).then(
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
