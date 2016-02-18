/*jslint node: true, unparam: true */
'use strict';

/**
 * @file messenger
 * @fileOverview MessengerService
 */

/**
 * @namespace MessengerService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('MessengerService', ['Tools', function MessengerService(Tools) {
    var data = {},
      deleteMessengerObject = false;
    /**
     * @memberof MessengerService
     * @method
     * @name setData
     * @description set data to service
     * @returns void
     */
    this.setData = function (obj) {
      data = obj;
    };
    /**
     * @memberof MessengerService
     * @method
     * @name getData
     * @description get data from service - CREATE New instance of object
     * @returns Object
     */
    this.getData = function () {
      var obj = Tools.createObject(data);
      if (deleteMessengerObject) {
        data = {};
      }
      return obj;
    };
    /**
     * @memberof MessengerService
     * @method
     * @name clear
     * @description clear data
     * @returns Object
     */
    this.clear = function () {
      data = {};
    };
    /**
     * @memberof MessengerService
     * @method
     * @name setData
     * @description set data to service
     * @returns void
     */
    this.setDeleteObjectAfterTransfer = function (arg) {
      deleteMessengerObject = arg;
    };
  }]);
