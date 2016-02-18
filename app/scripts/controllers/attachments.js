/*jslint node: true */
'use strict';

/**
 * @file attachments
 * @fileOverview AttachmentsCtrl
 */

/**
 * @namespace AttachmentsCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('AttachmentsCtrl', ['$scope', '$translate', '$translatePartialLoader', 'Constants',
    function ($scope, $translate, $translatePartialLoader, Constants) {
      // translate
      $translatePartialLoader.addPart('attachments');
      $translate.refresh();

      $scope.attachmentsTable = Constants.ATTACHMENTS_TYPES.ANY;
    }]);
