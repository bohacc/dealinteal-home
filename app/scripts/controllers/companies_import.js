/*jslint node: true */
'use strict';

/**
 * @file CompaniesImportCtrl
 * @fileOverview CompaniesImport
 */

/**
 * @namespace CompaniesImport
 * @author Name
 */

angular.module('crmPostgresWebApp')
  .controller('CompaniesImportCtrl', ['$scope', '$translate', '$translatePartialLoader', 'FilesService', 'SocketFactory', 'Constants', 'ImportCSVService', function ($scope, $translate, $translatePartialLoader, FilesService, SocketFactory, Constants, ImportCSVService) {
    // translate
    $translatePartialLoader.addPart('companies_import');
    $translate.refresh();

    $scope.toggleStages = [false, false];
    $scope.list = [];
    $scope.dataLoader = ImportCSVService.listImportCsvV1;
    $scope.dataLoaderSummary = ImportCSVService.listImportCsvV1;
    $scope.dataLoaderParams = {
      filter: {},
      sortField: 'company_name',
      sortDirection: 'asc',
      hash: null
    };
    $scope.infoPaging = {};
    $scope.importFile = {};
    $scope.inProcess = false;
    $scope.uploadFileSuccess = false;
    $scope.importFileSuccess = false;
    $scope.errorInUploadProcess = false;
    $scope.errorInImportProcess = false;
    $scope.isFileChange = false;
    $scope.uploadFileConfig = {
      url: '/api/import/csv/v1/companies-import-csv-v1',
      errorMsg: '',
      callback: function (response) {
        $scope.uploadFileSuccess = true;
        $scope.errorInImportProcess = !response.data.startImportSuccess;
      },
      callbackError: function () {
        $scope.errorInUploadProcess = true;
      }
    };
    $scope.info = {
      count: 0,
      step: 0,
      process: 0
    };
    $scope.IMPORT_CSV_FILE_SIZE_LIMIT = Constants.IMPORT_CSV_FILE_SIZE_LIMIT;

    /**
     * @memberof CompaniesImportCtrl
     * @method
     * @name uploadFile
     * @description upload file to the server
     * @returns void
     */
    $scope.uploadFile = function () {
      if (!$scope.inProcess && $scope.importFile.name) {
        $scope.clearProgressBars();
        FilesService.uploadFile($scope.importFile, $scope.uploadFileConfig);
        $scope.inProcess = true;
      }
    };

    /**
     * @memberof CompaniesImportCtrl
     * @method
     * @name cancelUploadFile
     * @description cancel upload file to the server
     * @returns void
     */
    $scope.cancelUploadFile = function () {
      $scope.importFile.upload.abort();
      SocketFactory.emit('send:message', {cancelImport: true}, function () {
        $scope.inProcess = false;
      });
      if (!$scope.info.process) {
        $scope.inProcess = false;
      }
    };

    /**
     * @memberof CompaniesImportCtrl
     * @method
     * @name selectFile
     * @description select file
     * @param file {Object} file
     * @returns void
     */
    $scope.selectFile = function (file) {
      $scope.importFile = file;
      $scope.isFileChange = true;
    };

    /**
     * @memberof CompaniesImportCtrl
     * @method
     * @name init
     * @description initialization import page properties
     * @returns void
     */
    $scope.refreshLocalProgressBar = function () {
      if (Object.keys($scope.importFile).length === 0) {
        $scope.importFile = {progress: 100};
      }
    };

    /**
     * @memberof CompaniesImportCtrl
     * @method
     * @name clearProgressBars
     * @description clear all progress bars
     * @returns void
     */
    $scope.clearProgressBars = function () {
      $scope.uploadFileSuccess = false;
      $scope.importFileSuccess = false;
      $scope.importFile.progress = 0;
      $scope.info = {
        count: 0,
        step: 0,
        process: 0
      };
    };

    // Sockets
    SocketFactory.on('send:message', function (message) {
      if (message.type === Constants.MESSAGE_INFO_IMPORT_CSV) {
        $scope.info = message;
        $scope.inProcess = !message.isCancel && !message.success && !message.failed;
        $scope.errorInImportProcess = message.failed;
        $scope.importFileSuccess = message.success;
        $scope.dataLoaderParams.hash = message.success ? Math.random() : null;
        $scope.refreshLocalProgressBar();
      }
    });

    // Run
  }]);
