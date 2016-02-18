/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file alerts
 * @fileOverview AlertsService
 */

/**
 * @namespace AlertsService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('AlertsService', ['$location', '$timeout', 'Constants', 'Tools',
    function AlertsService($location, $timeout, Constants, Tools) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var alerts = {items: []},
        alertsModal = [],
        types = [Constants.MESSAGE_INFO, Constants.MESSAGE_SUCCESS, Constants.MESSAGE_WARNING, Constants.MESSAGE_ERROR, Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD],
        typesModal = [Constants.MESSAGE_INFO_MODAL, Constants.MESSAGE_SUCCESS_MODAL, Constants.MESSAGE_WARNING_MODAL, Constants.MESSAGE_ERROR_MODAL, Constants.MESSAGE_WARNING_MODAL_CONN_LOST],
        messageLimit = 20,
        timeDelay = 10000;
      return {
        /**
         * @memberof AlertsService
         * @method
         * @name add
         * @description add alert object to stack
         * param obj {Object} object with message
         * @returns void
         */
        add: function (obj) {
          if (!obj) {
            return;
          }
          obj.id = Math.random();
          // stack overflow
          if (alerts.items.length > messageLimit) {
            $timeout(function () {
              alerts.items.splice(0, alerts.items.length);
            }, timeDelay);
          }
          if (alertsModal.length > messageLimit) {
            $timeout(function () {
              alertsModal.splice(0, alertsModal.length);
            }, timeDelay);
          }
          // ADD
          if (types.indexOf(obj.type) > -1) {
            alerts.items.push(obj);
            $timeout(function () {
              Tools.deleteItemOfArrayObjects(alerts, 'items', obj.id, 'id');
            }, timeDelay);
          }
          if (typesModal.indexOf(obj.type) > -1) {
            alertsModal.push(obj);
          }
        },
        /**
         * @memberof AlertsService
         * @method
         * @name get
         * @description getter for alerts
         * @returns Object
         */
        get: function () {
          return alerts;
        },
        /**
         * @memberof AlertsService
         * @method
         * @name getModal
         * @description getter for modal alerts
         * @returns Array
         */
        getModal: function () {
          return alertsModal;
        },
        /**
         * @memberof AlertsService
         * @method
         * @name deleteType
         * @description delete all alerts with type
         * @param type {String} name of the type
         * @returns Array
         */
        deleteType: function (type) {
          Tools.deleteItemOfArrayObjects(alerts, 'items', type, 'type');
        },
        /**
         * @memberof AlertsService
         * @method
         * @name prepareMessage
         * @description prepare message from response
         * @param result {String} response result
         * @param msgInfoSuccess {String} msgInfoSuccess
         * @param msgInfoError {String} msgInfoError
         * @returns Boolean
         */
        prepareMessage: function (result, msgInfoSuccess, msgInfoError) {
          var isSuccess = false, error = false, i, l, messages = [];
          if (result.data.message && result.data.message.type === Constants.MESSAGE_ERROR_MODAL) {
            this.add({type: Constants.MESSAGE_ERROR_MODAL, message: msgInfoError, message2: '(' + decodeURIComponent(result.data.message.msg) + ')', title: 'ERROR'});
          } else {
            // add header for items messages
            messages.push({message: msgInfoError});
            for (i = 0, l = result.data.length; i < l; i += 1) {
              if (result.data[i].message.type === Constants.MESSAGE_ERROR_MODAL) {
                error = true;
                messages.push({message: '(' + decodeURIComponent(result.data[i].message.msg) + ')'});
              }
            }
            if (error) {
              this.add({type: Constants.MESSAGE_ERROR_MODAL, messages: messages, title: 'ERROR'});
            } else {
              isSuccess = true;
              this.deleteType(Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD);
              this.add({type: Constants.MESSAGE_SUCCESS, message: msgInfoSuccess});
            }
          }
          return isSuccess;
        },
        /**
         * @memberof AlertsService
         * @method
         * @name clear
         * @description clear all alerts
         * @returns void
         */
        clear: function () {
          alerts = {items: []};
          alertsModal = [];
        },
        /**
         * @memberof AlertsService
         * @method
         * @name closeModalMessage
         * @description close modal message
         * @returns void
         */
        closeModalMessage: function () {
          $('#alertModal').modal('hide');
        }
      };
    }]);
