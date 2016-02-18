/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Page_ancestor
 * @fileOverview PageAncestorService
 */

/**
 * @namespace PageAncestorService
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('PageAncestor', ['$filter', '$location', '$rootScope', 'Tools', 'LogData', 'Constants', 'AlertsService', function PageAncestor($filter, $location, $rootScope, Tools, LogData, Constants, AlertsService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var Obj = function () {
      var scope, form, logData, self;

      logData = LogData.getInstance();
      self = this;
      this.routes = Constants.ROUTES;

      /**
       * @memberof PageAncestorService
       * @method
       * @name init
       * @description initialization all events for page
       * param scopeCtrl {$scope} callback
       * param formObject {String} name of form object
       * param table {String} name of table for log in database
       * @returns void
       */
      this.init = function (obj) {
        scope = obj.scope;
        form = obj.formObject;
        this.initFormChangeWatcher(scope);
        logData.init(scope, obj.formObject, obj.table);
        this.log = logData.getChanges();
      };

      /**
       * @memberof PageAncestorService
       * @method
       * @name cancel
       * @description cancel form object changes
       * @returns void
       */
      this.cancel = function () {
        Tools.setObject(scope[form], logData.getChanges().oldObject);
        Tools.setObject(logData.getChanges().newObject, logData.getChanges().oldObject);
      };

      /**
       * @memberof PageAncestorService
       * @method
       * @name openUrl
       * @description return Tools.openUrl
       * @returns void
       */
      this.openUrl = Tools.openUrl;

      /**
       * @memberof PageAncestorService
       * @method
       * @name setDefault
       * @description return logData.clear
       * @returns void
       */
      this.setDefault = logData.clear;

      /**
       * @memberof PageAncestorService
       * @method
       * @name post
       * @description set post properies
       * param callback {function} callback
       * @returns void
       */
      this.post = function (callback) {
        var service = this;
        if (callback) {
          scope.inProcess = true;
          callback().then(
            function (result) {
              if (AlertsService.prepareMessage(result, 'INFO_RECORD_POST_SUCCESS', 'INFO_RECORD_POST_ERROR')) {
                logData.clear();
                logData.save({method: Constants.CRUD_POST, id: result.data.id});
              }
              scope.inProcess = false;
            },
            function (result) {
              service.addAlert({
                type: Constants.MESSAGE_ERROR_MODAL,
                message: 'INFO_RECORD_POST_ERROR',
                message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                title: 'ERROR'
              });
              scope.inProcess = false;
            }
          );
        }
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name put
       * @description set put properies
       * param callback {function} callback
       * @returns void
       */
      this.put = function (callback) {
        var service = this;
        if (callback) {
          scope.inProcess = true;
          callback().then(
            function (result) {
              if (AlertsService.prepareMessage(result, 'INFO_RECORD_PUT_SUCCESS', 'INFO_RECORD_PUT_ERROR')) {
                logData.clear();
                logData.save({method: Constants.CRUD_PUT});
              }
              scope.inProcess = false;
            },
            function (result) {
              service.addAlert({
                type: Constants.MESSAGE_ERROR_MODAL,
                message: 'INFO_RECORD_PUT_ERROR',
                message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                title: 'ERROR'
              });
              scope.inProcess = false;
            }
          );
        }
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name del
       * @description set delete properies
       * param callback {function} callback
       * @returns void
       */
      this.del = function (callback) {
        var service = this, btns = [{}, {}], fceOK, fceCancel;
        if (callback) {
          scope.inProcess = true;
          // function for button OK
          fceOK = function () {
            logData.default(scope[form]);
            callback().then(
              function (result) {
                if (AlertsService.prepareMessage(result, 'INFO_RECORD_DELETE_SUCCESS', 'INFO_RECORD_DELETE_ERROR')) {
                  logData.save({method: Constants.CRUD_DELETE});
                }
                scope.inProcess = false;
              },
              function (result) {
                service.addAlert({
                  type: Constants.MESSAGE_ERROR_MODAL,
                  message: 'INFO_RECORD_DELETE_ERROR',
                  message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                  title: 'ERROR'
                });
                scope.inProcess = false;
              }
            );
          };
          // function for button STORNO
          fceCancel = function () {
            scope.inProcess = false;
          };
          // options for buttons of confirm dialog
          btns[0].name = 'OK';
          btns[0].onClick = fceOK;
          btns[1].name = 'STORNO';
          btns[1].onClick = fceCancel;
          // Run confirm dialog
          service.addAlert({
            type: Constants.MESSAGE_WARNING_MODAL,
            message: 'INFO_RECORD_DELETE_CONFIRM',
            title: 'DELETE',
            buttons: btns
          });
        }
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name initFormChangeWatcher
       * @description watcher for form with changes
       * param scope {$scope} scope from controller
       * @returns void
       */
      this.initFormChangeWatcher = function (scope) {
        var service = this, btns = [{}, {}], fceOK, fceCancel;
        // Event
        scope.$on("$locationChangeStart", function (event, nextUrl, currentUrl) {
          // isChanged and empty alertModal stack
          if (self.log.changes.isChanged && AlertsService.getModal().length === 0) {
            event.preventDefault();
            fceOK = function () {
              logData.clear();
              $location.$$parse(nextUrl);
            };
            fceCancel = function () {
              $rootScope.showFormChanges = true;
            };
            btns[0].name = 'OK';
            btns[0].onClick = fceOK;
            btns[1].name = 'STORNO';
            btns[1].onClick = fceCancel;
            // Run confirm dialog
            service.addAlert({
              type: 'WARNING_MODAL',
              message: 'FORM_CHANGE_ONCLOSE_CONFIRM',
              title: 'WARNING',
              buttons: btns
            });
          }
        });
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name addAlert
       * @description add alert to stack
       * param obj {Object}
       * @returns void
       */
      this.addAlert = function (obj) {
        AlertsService.add(obj);
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name confirm
       * @description set confirm properies
       * param callback {function} callback
       * @returns void
       */
      this.confirm = function (callback, confirmText, messageSuccessText, messageErrorText) {
        var service = this, btns = [{}, {}], fceOK, fceCancel;
        if (callback) {
          scope.inProcess = true;
          // function for button OK
          fceOK = function () {
            callback().then(
              function (result) {
                if (AlertsService.prepareMessage(result, messageSuccessText || 'INFO_CONFIRM_SUCCESS', messageErrorText || 'INFO_CONFIRM_ERROR')) {
                  console.log('success');
                }
                scope.inProcess = false;
              },
              function (result) {
                service.addAlert({
                  type: Constants.MESSAGE_ERROR_MODAL,
                  message: (messageErrorText || 'INFO_CONFIRM_ERROR'),
                  message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                  title: 'ERROR'
                });
                scope.inProcess = false;
              }
            );
          };
          // function for button STORNO
          fceCancel = function () {
            scope.inProcess = false;
          };
          // options for buttons of confirm dialog
          btns[0].name = 'OK';
          btns[0].onClick = fceOK;
          btns[1].name = 'STORNO';
          btns[1].onClick = fceCancel;
          // Run confirm dialog
          service.addAlert({
            type: Constants.MESSAGE_WARNING_MODAL,
            message: (confirmText || 'INFO_CONFIRM'),
            title: 'CONFIRM',
            buttons: btns
          });
        }
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name postPart
       * @description set post part properies
       * param callback {function} callback
       * @returns void
       */
      this.postPart = function (callback) {
        var service = this;
        if (callback) {
          scope.inProcess = true;
          callback().then(
            function (result) {
              if (AlertsService.prepareMessage(result, 'INFO_RECORD_POST_SUCCESS', 'INFO_RECORD_POST_ERROR')) {
                logData.clear();
                logData.default(scope[form]);
                logData.save({method: Constants.CRUD_PUT, id: result.data.id});
              }
              scope.inProcess = false;
            },
            function (result) {
              service.addAlert({
                type: Constants.MESSAGE_ERROR_MODAL,
                message: 'INFO_RECORD_POST_ERROR',
                message2: '(' + decodeURIComponent(result.data.message.msg) + ')',
                title: 'ERROR'
              });
              scope.inProcess = false;
            }
          );
        }
      };
      /**
       * @memberof PageAncestorService
       * @method
       * @name clear
       * @description clear log data
       * @returns void
       */
      this.default = function () {
        logData.default(scope[form]);
      };
    };

    this.getInstance = function () {
      return new Obj();
    };
  }]);
