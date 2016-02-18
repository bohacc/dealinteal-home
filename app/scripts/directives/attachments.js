/*jslint node: true, unparam: true */
'use strict';

/**
 * @file attachments
 * @fileOverview attachments
 */

/**
 * @namespace attachments
 * @author Martin Boháč
 */
angular.module('crmPostgresWebApp')
  .directive('attachments', function () {
    return {
      templateUrl: 'views/directives/attachments.html',
      restrict: 'E',
      scope: {
        table: '=?',
        tableId: '=?',
        info: '=?',
        config: '=?'
      },
      controller: ['$scope', 'Constants', 'AttachmentsService', 'FilesService', function ($scope, Constants, AttachmentsService, FilesService) {
        $scope.attachments = [];
        $scope.attachmentFile = {};
        $scope.searchStr = '';
        $scope.dataLoader = AttachmentsService.list;
        $scope.dataLoaderParams = {
          sortField: 'description',
          sortDirection: 'asc',
          table: $scope.table,
          tableId: $scope.tableId
        };
        $scope.infoPaging = {};
        $scope.uploadAttachmentConfig = {};
        $scope.uploadPicture = function () {
          FilesService.uploadFile($scope.attachmentFile, $scope.uploadAttachmentConfig);
        };

        /**
         * @memberof attachments
         * @method
         * @name setSearch
         * @description set search after enter
         * @param event {Object} handle for DOM event
         * @returns void
         */
        $scope.setSearch = function (event) {
          if (event.which === 13) {
            $scope.dataLoaderParams.searchStr = $scope.searchStr;
          }
        };

        /**
         * @memberof attachments
         * @method
         * @name selectFile
         * @description select file
         * @param file {Object} file
         * @returns void
         */
        $scope.selectFile = function (file) {
          $scope.attachmentFile = file;
          $scope.uploadPicture();
        };

        /**
         * @memberof attachments
         * @method
         * @name initAttachmentsConfig
         * @description initialization picture config object
         * @returns void
         */
        $scope.initAttachmentsConfig = function () {
          $scope.uploadAttachmentConfig = {
            url: '/api/attachments/upload/' + ($scope.table || Constants.ATTACHMENTS_TYPES.ANY) + '/' + ($scope.tableId || '999999'),
            errorMsg: '',
            callback: $scope.afterUploadAttachment,
            callbackError: $scope.afterUploadAttachmentError
          };
        };

        /**
         * @memberof attachments
         * @method
         * @name initAttachments
         * @description initialization attachments
         * @returns void
         */
        $scope.initAttachments = function () {
          if (typeof $scope.info === 'object') {
            $scope.info.paging = $scope.infoPaging;
          } else {
            $scope.info = {paging: $scope.infoPaging};
          }
        };

        /**
         * @memberof attachments
         * @method
         * @name afterUploadAttachment
         * @description callback for upload file after action
         * @returns void
         */
        $scope.afterUploadAttachment = function () {
          $scope.inProcess = false;
          $scope.dataLoaderParams.loadCount = true;
          $scope.dataLoaderParams.hash = Math.random();
        };

        /**
         * @memberof attachments
         * @method
         * @name afterUploadAttachmentError
         * @description callback for upload file after action
         * @returns void
         */
        $scope.afterUploadAttachmentError = function () {
          $scope.inProcess = false;
        };

        /**
         * @memberof attachments
         * @method
         * @name deleteFile
         * @description delete file
         * @param obj {Object}
         * @returns void
         */
        $scope.deleteFile = function (obj) {
          AttachmentsService.del(obj).then(function () {
            $scope.afterDeleteAttachment();
          });
        };

        /**
         * @memberof attachments
         * @method
         * @name afterDeleteAttachment
         * @description callback for delete file after action
         * @returns void
         */
        $scope.afterDeleteAttachment = function () {
          $scope.inProcess = false;
          $scope.dataLoaderParams.loadCount = true;
          $scope.dataLoaderParams.hash = Math.random();
        };

        // Watchers
        $scope.$watch('config.selectFileHash', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            $('#selectFile').click();
          }
        }, true);

        // Run
        $scope.initAttachments();
        $scope.initAttachmentsConfig();
      }]
    };
  });
