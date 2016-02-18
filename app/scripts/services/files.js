'use strict';

/**
 * @file files
 * @fileOverview FilesService
 */

/**
 * @namespace FilesService
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .service('FilesService', ['$timeout', 'Upload', function FilesService($timeout, Upload) {
    /**
     * @memberof ToolsService
     * @method
     * @name uploadFile
     * @description upload file to server
     * @param file {Object} file
     * @param config {Object} config
     * @returns void
     */
    this.uploadFile = function (file, config) {
      var obj, keys, i, l;
      config.inProcess = true;
      if (file && !file.$error) {
        obj = {
          url: config.url,
          data: config.data,
          method: 'POST',
          headers: {
            'my-header': 'my-header-value'
          },
          fields: {username: config.username},
          file: file,
          fileFormDataName: 'file'
        };
        file.upload = Upload.upload(obj);

        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;
            config.callback(response);
          });
        }, function (response) {
          config.callbackError(response);
          if (response.status > 0) {
            config.errorMsg = response.status + ': ' + response.data;
          }
        });

        file.upload.progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
        });
      }
    };
  }]);
