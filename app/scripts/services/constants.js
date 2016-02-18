/*jslint node: true*/
'use strict';

angular.module('crmPostgresWebApp')
  .service('Constants', function Constants() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      ATTACHMENTS_TYPES: {
        APPOINTMENT: 'APPOINTMENT',
        COMPANY: 'COMPANY',
        OPPORTUNITY: 'OPPORTUNITY',
        ANY: 'ANY',
        PEOPLE: 'PEOPLE',
        PRODUCT: 'PRODUCT'
      },
      LANGUAGE_KEYS: [
        'cs-cz',
        'en-us',
        'sk-sk'
      ],
      TASK: {
        FILTER: {
          OLD: {ID: 0, NAME: 'BEFORE_AND_UNFULFILLED'},
          TODAY: {ID: 1, NAME: 'TODAY'},
          TOMORROW: {ID: 2, NAME: 'TOMORROW'},
          NEW: {ID: 3, NAME: 'LATER'}
        }
      },
      PEOPLE: {
        FILTER: {
          UPCOMING_ANNIVERSARY: {ID: 0, NAME: 'UPCOMING_ANNIVERSARY'}
        }
      },
      COMPANIES: {
        FILTER: {
          OPEN_OPPORTUNITIES: {ID: 0, NAME: 'OPEN_OPPORTUNITIES'}
        }
      },
      APPOINTMENTS: {
        FILTER: {
          FUTURE: {ID: 0, NAME: 'FUTURE'},
          PAST: {ID: 1, NAME: 'PAST'}
        }
      },
      OPPORTUNITIES: {
        FILTER: {
          OPEN: {ID: 1, NAME: 'OPPORTUNITY_STATUS_OPEN', FILTER: 'TYPE'},
          SUCCESS: {ID: 2, NAME: 'OPPORTUNITY_STATUS_SUCCESS', FILTER: 'TYPE'},
          FAILURE: {ID: 3, NAME: 'OPPORTUNITY_STATUS_FAILED', FILTER: 'TYPE'}
        }
      },
      CRUD_POST: 'POST',
      CRUD_PUT: 'PUT',
      CRUD_DELETE: 'DELETE',
      MESSAGE_INFO: 'INFO',
      MESSAGE_SUCCESS: 'SUCCESS',
      MESSAGE_WARNING: 'WARNING',
      MESSAGE_ERROR: 'ERROR',
      MESSAGE_WARNING_VALIDATION_BEFORE_CRUD: 'WARNING_VALIDATION_BEFORE_CRUD',
      MESSAGE_WARNING_VALIDATION_PIPELINE_STAGE_NOT_FOUND: 'VALIDATION_PIPELINE_STAGE_NOT_FOUND',
      MESSAGE_CONNECTION_LOST: 'CONNECTION_LOST',
      MESSAGE_INFO_MODAL: 'INFO_MODAL',
      MESSAGE_SUCCESS_MODAL: 'SUCCESS_MODAL',
      MESSAGE_WARNING_MODAL: 'WARNING_MODAL',
      MESSAGE_WARNING_MODAL_CONN_LOST: 'WARNING_MODAL_CONN_LOST',
      MESSAGE_INFO_IMPORT_CSV: 'INFO_IMPORT_CSV',
      MESSAGE_ERROR_MODAL: 'ERROR_MODAL',
      MESSAGE_EXEC_REVOKE_PEOPLE: 'REVOKE_PEOPLE',
      MESSAGE_EXEC_REVOKE_PEOPLE_SUCCESS: 'REVOKE_PEOPLE_SUCCESS',
      MESSAGE_EXEC_REVOKE_PEOPLE_ERROR: 'REVOKE_PEOPLE_ERROR',
      MESSAGE_EXEC_DELETE_ITEM: 'INFO_RECORD_DELETE_ITEM_CONFIRM',
      MESSAGE_EXEC_DELETE_ITEM_SUCCESS: 'INFO_RECORD_DELETE_ITEM_SUCCESS',
      MESSAGE_EXEC_DELETE_ITEM_ERROR: 'INFO_RECORD_DELETE_ITEM_ERROR',
      MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE: 'INFO_REPLACE_STAGE_AND_DELETE_CONFIRM',
      MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE_SUCCESS: 'INFO_REPLACE_STAGE_AND_DELETE_CONFIRM_SUCCESS',
      MESSAGE_EXEC_REPLACE_STAGE_AND_DELETE_ERROR: 'INFO_REPLACE_STAGE_AND_DELETE_CONFIRM_ERROR',
      MESSAGE_TEXTAREA_OVERFLOW: 'WARNING_TEXTAREA_OVERFLOW',
      MESSAGE_TEXT_CONNECTION_SOON_LOST: 'CONNECTION_SOON_LOST',
      MESSAGE_TEXT_CONNECTION_SOON_LOST2: 'CONNECTION_SOON_LOST2',
      MESSAGE_TEXT_CONNECTION_SOON_LOST3: 'CONNECTION_SOON_LOST3',
      MESSAGE_TEXT_CONNECTION_SOON_LOST_TITLE: 'CONNECTION_SOON_LOST_TITLE',
      MESSAGE_TEXT_CONNECTION_LOST: 'CONNECTION_LOST_WITH_TIMEOUT',
      MESSAGE_TEXT_OPPORTUNITY_STATUS_SUCCESS_SUCCESS: 'OPPORTUNITY_STATUS_SUCCESS_SUCCESS',
      MESSAGE_TEXT_OPPORTUNITY_STATUS_FAILED_SUCCESS: 'OPPORTUNITY_STATUS_FAILED_SUCCESS',
      MESSAGE_TEXT_OPPORTUNITY_OPEN_CLOSED_SUCCESS: 'OPPORTUNITY_OPEN_CLOSED_SUCCESS',
      MESSAGE_TEXT_YES: 'YES',
      MESSAGE_TEXT_NO: 'NO',
      TYPE_CALENDAR_EVENT_REMINDER: 'REMINDER',
      TYPE_CALENDAR_EVENT_APPOINTMENT: 'APPOINTMENT',
      FULLCALENDAR_WEEK_AGENDA: 'agendaWeek',
      TIMELINE_DATE_CURRENT: 'TODAY',
      TIMELINE_DATE_PRIOR: 'YESTERDAY',
      TIMELINE_DATE_NEXT: 'TOMORROW',
      AGENDA_TYPE_APPOINTMENT_PHONE_CALL: 'APPOINTMENT_PHONE_CALL',
      AGENDA_TYPE_APPOINTMENT_BUSINESS_MEETING: 'APPOINTMENT_BUSINESS_MEETING',
      AGENDA_TYPE_APPOINTMENT_OTHER: 'APPOINTMENT_OTHER',
      AGENDA_TYPE_APPOINTMENT_ALL_DAY_EVENT: 'APPOINTMENT_ALL_DAY_EVENT',
      AGENDA_TYPE_APPOINTMENT: 'APPOINTMENT',
      AGENDA_TYPE_TASK: 'TASK',
      AGENDA_TYPE_REMINDER: 'REMINDER',
      AGENDA_TYPE_BIRTHDAY: 'BIRTHDAY',
      AGENDA_TYPE_ANNIVERSARY: 'ANNIVERSARY',
      PRIORITY: [
        {id: 0, name: 'LOW'},
        {id: 1, name: 'MEDIUM'},
        {id: 2, name: 'HIGH'}
      ],
      CONNECTION_LOST_TIME_LOGOUT: 60 * 1000,
      APPOINTMENT_TYPES: {PHONE_CALL: 1, ALL_DAY_EVENT: 2, BUSINESS_MEETING: 3, OTHER_APPOINTMENT: 4},
      SEARCH_STR_LENGTH: 'SEARCH_STR_LENGTH',
      ROUTES: {
        LOGIN: '/login',
        PERSON: '/person/',
        PROJECT: '/project/',
        TASKS: '/tasks/',
        TASK: '/task/',
        OPPORTUNITY: '/opportunity/',
        APPOINTMENT: '/appointment/',
        COMPANY: '/company/',
        COMPANIES_IMPORT: '/companies-import/'
      },
      EMPTY_PERSON_PICTURE: '/images/avatar-unisex.png',
      EMPTY_PRODUCT_PICTURE: '/images/no-picture.png',
      IMPORT_CSV_FILE_SIZE_LIMIT: '100MB',
      OPPORTUNITY_STATUS: {
        OPEN: {ID: 0, NAME: 'OPPORTUNITY_STATUS_OPEN'},
        SUCCESS: {ID: 1, NAME: 'OPPORTUNITY_STATUS_SUCCESS'},
        FAILED: {ID: 2, NAME: 'OPPORTUNITY_STATUS_FAILED'}
      },
      MESSAGE_EXEC_DELETE_TEXT: 'INFO_DELETE_TEXT_CONFIRM',
      MESSAGE_EXEC_DELETE_TEXT_SUCCESS: 'INFO_DELETE_TEXT_CONFIRM_SUCCESS',
      MESSAGE_EXEC_DELETE_TEXT_ERROR: 'INFO_DELETE_TEXT_CONFIRM_ERROR'
      // PROC JE TADY FORMAT DATUMU? NEBUDE PRO KAZDEHO STEJNY!!!
      //DATE_FORMAT: 'DD.MM.YYYY'
    };
  });