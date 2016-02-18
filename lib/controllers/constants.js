/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 05.09.2014.
 */
/*global require, module, __dirname */
/*jslint node: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_Constants
 */

/**
 * @namespace __Server_Constants
 * @author Martin Boháč
 */

// predelat na JSON ktery se bude nacitat jak pro server tak pro klienta, aby to bylo na jednom miste
module.exports = {
  APP_URL: 'dealinteal.notia.cz',
  SECRET: 'Notia.1*',
  ATTACHMENTS_TYPES: {
    APPOINTMENT: 'APPOINTMENT',
    COMPANY: 'COMPANY',
    OPPORTUNITY: 'OPPORTUNITY',
    ANY: 'ANY',
    PEOPLE: 'PEOPLE',
    PRODUCT: 'PRODUCT'
  },
  INTERNAL_TOKEN: '6e495f39b2a39f794c5e949bb2750955',
  WORD_TEMPLATE_DIRNAME: __dirname + '/../word_templates/',
  MS_EXCHANGE_CONNECT_STRING: 'DEALINTEAL_API',
  PASSWORD_FOR_EXPORT_IMPORT_API: 'notia',
  MONITOR_EVENTS_DB_TIME: 10000,
  ERROR: '500',
  MESSAGE_TYPE_INTERNAL: 'INTERNAL',
  MESSAGE_ERROR: 'ERROR',
  MESSAGE_ERROR_MODAL: 'ERROR_MODAL',
  MESSAGE_ERROR_TEXT: 'Error on server',
  MESSAGE_SUCCESS: 'SUCCESS',
  MESSAGE_SUCCESS_TEXT: 'Success on server',
  MESSAGE_WARNING_MODAL: 'WARNING_MODAL',
  MESSAGE_WARNING_MODAL_CONN_LOST: 'WARNING_MODAL_CONN_LOST',
  MESSAGE_INFO_IMPORT_CSV: 'INFO_IMPORT_CSV',
  MESSAGE_VALIDATION_LENGTH: 'valid range for field is',
  MESSAGE_VALIDATION_FORMAT: 'invalid format',
  MESSAGE_VALIDATION_NUMBER: 'invalid number',
  MESSAGE_VALIDATION_DATE_RANGE: 'invalid Date range',
  MESSAGE_CONNECT_INVALID_USERNAME_OR_PASSWORD: 'invalid login or password',
  MESSAGE_CONNECT_INVALID_CONNECT_STRING: 'invalid connect string',
  MESSAGE_TEXT_CONNECTION_SOON_LOST: 'CONNECTION_SOON_LOST',
  MESSAGE_TEXT_YES: 'YES',
  MESSAGE_TEXT_NO: 'NO',
  PG_CONNECT_ERROR: 'error - no connection',
  PG_RUNNING_QUERY_ERROR: 'error running query',
  PG_RUNNING_QUERY_ERROR_PERMISSION: 'error running query - insufficient privileges',
  E500: {message: {type: 'ERROR_MODAL', msg: 'Error on server'}},
  E900: {message: {type: 'ERROR_LOGIN', msg: 'Error with connections'}},
  OK: {message: {type: 'SUCCESS', msg: 'Success on server'}},
  DATE_FORMAT: 'DD.MM.YYYY',
  TYPE_CALENDAR_EVENT_REMINDER: 'REMINDER',
  TYPE_CALENDAR_EVENT_APPOINTMENT: 'APPOINTMENT',
  AGENDA_TYPE_APPOINTMENT_PHONE_CALL: 'APPOINTMENT_PHONE_CALL',
  AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING: 'APPOINTMENT_BUSINESS_MEETING',
  AGENDA_TYPE_APPOINTMENT_OTHER: 'APPOINTMENT_OTHER',
  AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT: 'APPOINTMENT_ALL_DAY_EVENT',
  AGENDA_TYPE_APPOINTMENT: 'APPOINTMENT',
  AGENDA_TYPE_TASK: 'TASK',
  AGENDA_TYPE_REMINDER: 'REMINDER',
  AGENDA_TYPE_BIRTHDAY: 'BIRTHDAY',
  AGENDA_TYPE_ANNIVERSARY: 'ANNIVERSARY',
  REMINDER_BINDING_TYPE_FIELD_FOR_TASK: 'task_id',
  CONTENT_TYPE_CSV: 'text/csv; charset=utf-8',
  CONTENT_DISPOSITION: 'attachment; filename=',
  HTTP_STATUS: {
    OK: 200
  },
  EXPORT_CSV_SEPARATOR: ';',
  IMPORT_CSV_SEPARATOR: ';',
  CONNECTION_LOST_TIME: 60 * 1000 * 10, // 10 min.
  MS_EXCHANGE: {
    CREDENTIALS: {  // aplikace "Deal in Teal" na uctu "developer.nis@outlook.com" s heslem "hymen349."  https://apps.dev.microsoft.com
      CLIENT_ID: "dbb621ed-08e5-4a79-812c-86c25d06893f",
      CLIENT_SECRET: "XjgKCHD8spfqUrewxSwHo5t",
      SITE: "https://login.microsoftonline.com/common",
      AUTHORIZATION_PATH: "/oauth2/v2.0/authorize",
      TOKEN_PATH: "/oauth2/v2.0/token"
    },
    REDIRECT_URI: "http://localhost:9000/api/ms-exchange-authorize",
    SCOPES:  [ "openid",
      "https://outlook.office.com/mail.read",
      "https://outlook.office.com/calendars.read",
      "https://outlook.office.com/contacts.read"]
  },
  DML_METHODS: {
    POST: {CODE: 'POST', DB_CODE: 'I'},
    UPDATE: {CODE: 'UPDATE', DB_CODE: 'U'},
    SELECT: {CODE: 'SELECT', DB_CODE: 'S'},
    DELETE: {CODE: 'DELETE', DB_CODE: 'D'}
  },
  OPPORTUNITY_STATUS: {
    OPEN: 0,
    SUCCESS: 1,
    FAILED: 2
  }
};

