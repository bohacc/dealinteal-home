/*jslint node: true */
'use strict';

/**
 * @file Product
 * @fileOverview ProductCtrl
 */

/**
 * @namespace ProductCtrl
 * @author Pavel Kolomazník
 */

angular.module('crmPostgresWebApp')
  .controller('ProductCtrl', ['$scope', '$location', '$translate', '$translatePartialLoader', 'PageAncestor', 'ProductsService', 'Constants', 'MessengerService', 'initialData', 'FilesService', 'AttachmentsService',
    function ($scope, $location, $translate, $translatePartialLoader, PageAncestor, ProductsService, Constants, MessengerService, initialData, FilesService, AttachmentsService) {
      // translate
      $translatePartialLoader.addPart('product');
      $translate.refresh();

      $scope.product = initialData.product;
      $scope.localDataCurrency = initialData.currency;
      $scope.localDataUnits = initialData.units;
      $scope.pictureFile = {};
      $scope.isPictureChange = false;
      $scope.inProcess = false;
      $scope.uploadPictureConfig = {};

      /**
       * @memberof ProductCtrl
       * @method
       * @name initButtons
       * @description init actionButtons
       * @returns void
       */
      $scope.initButtons = function () {
        var save = {};
        $scope.actionButtons = [
          {
            name: 'DELETE',
            dropDown: [{name: 'DELETE_PRODUCT', onClick: $scope.del, disabled: function () { return !($scope.product.id); }}],
            disabled: !($scope.product.id)
          },
          {name: 'CANCEL', onClick: $scope.pageAncestor.cancel, disabled: function () { return !$scope.pageAncestor.log.changes.isChanged; }}
        ];
        if ($scope.product.id) {
          save = {name: 'SAVE', onClick: $scope.put, disabled: function () { return $scope.inProcess; }};
        } else {
          save = {name: 'SAVE', onClick: $scope.post, disabled: function () { return $scope.inProcess; }};
        }
        $scope.actionButtons.push(save);
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name newProduct
       * @description show new product page
       * @returns void
       */
      $scope.newProduct = function () {
        $location.path('/product');
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name verify
       * @description verify form
       * @returns Boolean
       */
      $scope.verifyForm = function () {
        var result = true, verifyMessages = [], i, l;
        verifyMessages.push({message: 'WARNING_FIELD_VALUE_INVALID'});

        if (!$scope.product.code) {
          result = false;
          verifyMessages.push({message: 'ARTICLE_NUMBER'});
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
       * @memberof ProductCtrl
       * @method
       * @name post
       * @description post form
       * @returns void
       */
      $scope.post = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.post(function () {
            return ProductsService.post($scope.product).then(function (promise) {
              if (promise.data.id) {
                $location.path('/product/' + promise.data.id);
              }
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name put
       * @description put form
       * @returns void
       */
      $scope.put = function () {
        if ($scope.verifyForm()) {
          $scope.pageAncestor.put(function () {
            return ProductsService.put($scope.product).then(function (promise) {
              return promise;
            });
          });
        }
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name del
       * @description delete form
       * @returns void
       */
      $scope.del = function () {
        $scope.pageAncestor.del(function () {
          return ProductsService.del($scope.product).then(function (promise) {
            if (promise.data.id) {
              $location.path('/product/' + promise.data.id);
            } else {
              $location.path('/products');
            }
            return promise;
          });
        });
      };
      /**
       * @memberof ProductCtrl
       * @method
       * @name copyProduct
       * @description new product from current
       * @returns void
       */
      $scope.copyProduct = function () {
        MessengerService.clear();
        $scope.product.id = null;
        $scope.product.code = null;
        MessengerService.setData($scope.product);
        $location.path('/product');
      };
      /**
       * @memberof ProductCtrl
       * @method
       * @name setCurrency
       * @description set currency
       * @param fieldNameIndex {String} index of currency and price field
       * @param index {Number} index of currency
       * @returns void
       */
      $scope.setCurrency = function (fieldNameIndex, index) {
        if (index === -1) {
          if ($scope.product['price' + fieldNameIndex] === '') {
            $scope.product['currency' + fieldNameIndex] = null;
          }
        } else {
          $scope.product['currency' + fieldNameIndex] = $scope.localDataCurrency[index].name;
        }
      };
      /**
       * @memberof ProductCtrl
       * @method
       * @name setUnit
       * @description set unit
       * @param index {Number} index of currency
       * @returns void
       */
      $scope.setUnit = function (index) {
        $scope.product.unit = $scope.localDataUnits[index].name;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name uploadPicture
       * @description upload picture
       * @returns void
       */
      $scope.uploadPicture = function () {
        FilesService.uploadFile($scope.pictureFile, $scope.uploadPictureConfig);
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name selectFile
       * @description select file
       * @param file {Object} file
       * @returns void
       */
      $scope.selectFile = function (file) {
        $scope.pictureFile = file;
        $scope.isPictureChange = true;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name removePicture
       * @description remove picture from
       * @returns void
       */
      $scope.removePicture = function () {
        $scope.isPictureChange = $scope.product.pictureId ? true : false;
        $scope.pictureFile = {};
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name showSavePictureAnchor
       * @description return boolean for eneble/disable save anchor
       * @returns Boolean
       */
      $scope.showSavePictureAnchor = function () {
        return $scope.isPictureChange && ($scope.pictureFile && $scope.pictureFile.name ? true : false) && !$scope.inProcess;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name showDeletePictureAnchor
       * @description return boolean for eneble/disable delete anchor
       * @returns Boolean
       */
      $scope.showDeletePictureAnchor = function () {
        return $scope.isPictureChange && !($scope.pictureFile && $scope.pictureFile.name || false) && !$scope.inProcess;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name showRemovePictureAnchor
       * @description return boolean for eneble/disable remove anchor
       * @returns Boolean
       */
      $scope.showRemovePictureAnchor = function () {
        return ($scope.product.pictureId && !$scope.isPictureChange) || ($scope.pictureFile && $scope.pictureFile.name ? true : false);
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name getProductPicture
       * @description create link for picture
       * @returns String
       */
      $scope.getProductPicture = function () {
        var result = null;
        if (Object.keys($scope.pictureFile || {}).length > 0) {
          result = 'pictureFile';
        } else if ($scope.product.pictureId && !$scope.isPictureChange) {
          result = '/api/attachments/' + $scope.product.pictureId;
        } else {
          result = Constants.EMPTY_PRODUCT_PICTURE;
        }
        return result;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name afterUploadPersonPicture
       * @description callback for upload file after action
       * @param response {Object} response
       * @returns void
       */
      $scope.afterUploadProductPicture = function (response) {
        $scope.isPictureChange = false;
        $scope.product.pictureId = response.data.id;
        $scope.uploadPictureConfig.data.id = response.data.id;
        $scope.inProcess = false;
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name initPictureConfig
       * @description initialization picture config object
       * @returns void
       */
      $scope.initPictureConfig = function () {
        $scope.uploadPictureConfig = {
          url: '/api/product/' + $scope.product.id + '/picture/upload',
          errorMsg: '',
          callback: $scope.afterUploadProductPicture,
          data: {
            table: Constants.ATTACHMENTS_TYPES.PRODUCT,
            id: $scope.product.pictureId
          }
        };
      };

      /**
       * @memberof ProductCtrl
       * @method
       * @name deletePicture
       * @description delete picture
       * @returns void
       */
      $scope.deletePicture = function () {
        var obj = {id: $scope.product.pictureId};
        AttachmentsService.del(obj).then(
          function () {
            $scope.product.pictureId = null;
            $scope.isPictureChange = false;
            $scope.inProcess = false;
          }
        );
      };
      // Run
      $scope.pageAncestor = PageAncestor.getInstance();
      $scope.pageAncestor.init({
        scope: $scope,
        formObject: 'product',
        table: 'PRODUCTS'
      });

      $scope.initButtons();
      $scope.initPictureConfig();

    }]);
