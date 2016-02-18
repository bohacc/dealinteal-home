/*jslint node: true */
'use strict';

/**
 * @file user
 * @fileOverview UserCtrl
 */

/**
 * @namespace UserCtrl
 * @author Martin Boháč
 */

angular.module('crmPostgresWebApp')
  .controller('UserCtrl', ['$scope', '$translate', '$translatePartialLoader', 'UsersService', 'PageAncestor', 'Constants', function ($scope, $translate, $translatePartialLoader, UsersService, PageAncestor, Constants) {
    // translate
    $translatePartialLoader.addPart('user');
    $translate.refresh();

    $scope.settings = {
      user: {},
      resType: 0
    };
    $scope.users = [];
    $scope.resTypes = [
      {id: 0, name: 'ALL'},
      {id: 1, name: 'USER'}
    ]; // 0 = All, 1 = only user

    /**
     * @memberof User
     * @method
     * @name loadUsers
     * @description load users
     * @returns void
     */
    $scope.loadUsers = function () {
      UsersService.list().then(
        function (result) {
          $scope.users = result.data;
        }
      );
    };

    /**
     * @memberof User
     * @method
     * @name setUser
     * @description set user
     * @param index {Number} index
     * @returns void
     */
    $scope.setUser = function (index) {
      $scope.settings.user = $scope.users[index];
    };

    /**
     * @memberof User
     * @method
     * @name setResType
     * @description set resType
     * @param index {Number} index
     * @returns void
     */
    $scope.setResType = function (index) {
      $scope.settings.resType = $scope.resTypes[index];
    };

    /**
     * @memberof User
     * @method
     * @name verifyForm
     * @description verify form
     * @returns Boolean
     */
    $scope.verifyForm = function () {
      var result = true, verifyMessages = [], i, l;
      verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

      // verify type_id input data
      if (!($scope.settings && $scope.settings.user && $scope.settings.user.id)) {
        result = false;
        verifyMessages.push({message: 'USER'});
      }

      for (i = 0, l = verifyMessages.length; i < l; i += 1) {
        if (i > 1) {
          verifyMessages[i].prefix = ', ';
        }
      }
      if (!result) {
        $scope.pageAncestor.addAlert({type: Constants.MESSAGE_WARNING_VALIDATION_BEFORE_CRUD, messages: verifyMessages});
      }
      return result;
    };

    /**
     * @memberof User
     * @method
     * @name createPermission
     * @description create permission
     * @returns void
     */
    $scope.createPermission = function () {
      var obj = {id: $scope.settings.user.id, resType: $scope.settings.resType.id};
      if ($scope.verifyForm()) {
        $scope.pageAncestor.post(function () {
          return UsersService.createPermission(obj).then(function (promise) {
            return promise;
          });
        });
      }
    };

    // Run
    $scope.pageAncestor = PageAncestor.getInstance();
    $scope.pageAncestor.init({
      scope: $scope,
      formObject: 'settings',
      table: 'USERS_RESTRICTIONS'
    });
    $scope.loadUsers();
  }]);
