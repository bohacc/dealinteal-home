/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 20.01.2016.
 */
/*jslint es5: true, indent: 2, node:true, nomen: true, maxlen: 80, vars: true, unparam: true*/
'use strict';

var Docxtemplater = require('docxtemplater'),
  appointment = require('./appointment'),
  constants = require('./constants'),
  tools = require('./tools'),
  fs = require('fs');

/**
 * @file ms_word
 * @fileOverview __Server_MSWord
 */

/**
 * @namespace __Server_MSWord
 * @author Martin Boháč
 */

/**
 * @memberof __Server_REST_API_ExchangeService
 * @method
 * @name appointments
 * @description appointments
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.appointments = function (req, res) {
  var content, doc, buf, reqRes, date, fileName,
    dateFrom, dateTo, timeFrom, timeTo, attendees, attendeesCompany, i, l;

  try {
    fileName = 'appointment';
    res.writeHead(200, {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      'Content-disposition': 'attachment; filename=' + fileName + '.docx'
    });

    // appointment
    reqRes = tools.getReqResObject(req);
    reqRes.req.params = {id: req.params.id};
    reqRes.req.signedCookies = req.signedCookies;
    appointment.get(reqRes.req, reqRes.res).then(function (result) {
      try {
        content = fs.readFileSync(constants.WORD_TEMPLATE_DIRNAME + "appointment_template.docx", "binary");

        doc = new Docxtemplater(content);

        date = new Date(result.start_time);
        dateFrom = date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear();

        date = new Date(result.end_time);
        dateTo = date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear();

        date = new Date(result.start_time);
        timeFrom = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

        timeTo = '';
        date = new Date(result.end_time);
        timeTo = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

        attendees = '';
        // Team members
        for (i = 0, l = result.teamReminderMembers.length; i < l; i += 1) {
          if (i > 1) {
            attendees += ', ';
          }
          attendees += result.teamReminderMembers[i].name;
        }

        // Company members
        attendeesCompany = '';
        for (i = 0, l = result.attendeeReminderMembers.length; i < l; i += 1) {
          if (i > 1) {
            attendeesCompany += ', ';
          }
          attendeesCompany += result.attendeeReminderMembers[i].name;
        }

        doc.setData({
          dateFrom: dateFrom,
          dateTo: dateTo,
          subject: result.subject,
          timeFrom: timeFrom,
          timeTo: timeTo,
          companyName: result.company && result.company[0] ? result.company[0].name : '',
          myCompanyName: result.myCompanyName,
          ownerName: result.owner_name,
          attendees: attendees,
          attendeesCompany: attendeesCompany
        });

        doc.render();

        buf = doc.getZip().generate({type: "nodebuffer"});
        res.write(buf);
        res.end();
      } catch (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.log(e);
  }
};
