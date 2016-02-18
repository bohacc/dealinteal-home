/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file Log_data
 * @fileOverview LogDataService
 */

/**
 * @namespace LogData
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .service('LogData', ['$http', '$q', 'Tools', function ($http, $q, Tools) {
    var Obj = function () {
      // Service logic
      var logObject,
        oldObject,
        newObject,
        changes = {isChanged: false};

      // Public API here
      /**
       * @memberof LogData
       * @method
       * @name default
       * @description set oldObject as default state
       * param obj {Object}
       * @returns void
       */
      this.default = function (obj) {
        Tools.setObject(oldObject, obj);
      };
      /**
       * @memberof LogData
       * @method
       * @name clear
       * @description clear all properties
       * @returns void
       */
      this.clear = function () {
        var key;
        for (key in logObject) {
          if (logObject.hasOwnProperty(key) && key !== 'table') {
            delete logObject[key];
          }
        }
        for (key in newObject) {
          if (newObject.hasOwnProperty(key)) {
            oldObject[key] = newObject[key];
            delete newObject[key];
          }
        }
        changes.isChanged = false;
      };
      /**
       * @memberof LogData
       * @method
       * @name addChanges
       * @description
       * param obj {Object} form object with data
       * @returns void
       */
      this.addChanges = function (obj) {
        newObject = Tools.createObject(obj);
      };
      /**
       * @memberof LogData
       * @method
       * @name init
       * @description inicialization listen
       * param scope {$scope} scope of controller
       * param formObject {String} form object with data
       * param table {String} table for log to database
       * @returns void
       */
      this.init = function (scope, formObject, table) {
        var service = this;
        oldObject = Tools.createObject(scope[formObject]);
        newObject = {};
        logObject = {};
        logObject.table = table;
        scope.$watch(formObject, function (newValue, oldValue) {
          if (newValue !== oldValue) {
            // set isChanged
            service.addChanges(newValue);
            changes.isChanged = JSON.stringify(Tools.getChangedProperties(oldObject, newObject)) !== '{}';
          }
        }, true);
      };
      /**
       * @memberof LogData
       * @method
       * @name save
       * @description save changes into database
       * param key {String}
       * @returns Object
       */
      this.save = function (property) {
        var deferred = $q.defer();
        // add name of properties with same value where changes to logObject.old
        logObject.old = Tools.getChangedProperties(newObject, oldObject);
        if (!logObject.id) {
          logObject.id = property.id || oldObject.id;
        }
        logObject.new = property.method === 'DELETE' ? {} : Tools.getChangedProperties(oldObject, newObject);
        logObject.method = property.method;
        if (JSON.stringify(logObject.old) !== '{}') {
          $http.post('/api/log', JSON.stringify(logObject))
            .success(function (data) {
              deferred.resolve('log has send');
            })
            .error(function (data) {
              deferred.reject(data);
            });
        } else {
          deferred.reject('nothing to log');
        }
        return deferred.promise;
      };
      /**
       * @memberof LogData
       * @method
       * @name getChanges
       * @description get object with changes
       * @returns Object
       */
      this.getChanges = function () {
        return {oldObject: oldObject, newObject: newObject, logObject: logObject, changes: changes};
      };
    };

    this.getInstance = function () {
      return new Obj();
    };
  }]);
