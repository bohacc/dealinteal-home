/*jslint node: true, unparam: true */
'use strict';

describe('Controller: ProductCtrl', function () {

  // load the controller's module
  beforeEach(module('crmPostgresWebApp'));

  var ProductCtrl,
    scope,
    loc,
    constants,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location, $httpBackend, Constants) {
    scope = $rootScope.$new();
    loc = $location;
    httpBackend = $httpBackend;
    constants = Constants;
    httpBackend.whenGET('views/login.html').respond(201, '');
    ProductCtrl = $controller('ProductCtrl', {
      $scope: scope,
      initialData: {product: {}}
    });
  }));

  it('initButtons - initialization buttons for form', function () {
    scope.initButtons();
    expect(scope.actionButtons.length).toBe(3);
    expect(scope.actionButtons[0].name).toBe('DELETE');
    expect(scope.actionButtons[0].dropDown[0].name).toBe('DELETE_PRODUCT');
    expect(scope.actionButtons[1].name).toBe('CANCEL');
    expect(scope.actionButtons[2].name).toBe('SAVE');
  });

  it('newProduct - new product', function () {
    scope.newProduct();
    expect(loc.path()).toBe('/product');
  });

  it('verifyForm - verifications of data', function () {
    scope.product = {};
    expect(scope.verifyForm()).toBe(false);
    scope.product.code = 'Test';
    expect(scope.verifyForm()).toBe(true);
  });

  it('post - post project', function () {
    scope.post();
  });

  it('put - put project', function () {
    scope.put();
  });

  it('del - delete project', function () {
    scope.del();
  });

  it('copyProduct - copiing product', function () {
    scope.product = {
      id: 9,
      code: 'test',
      name: 'testing produkct',
      shortDescription: 'description of product',
      priceRrp: 500,
      currencyRrp: 'EUR'
    };
    scope.copyProduct();
    expect(scope.product.id).toBe(null);
    expect(scope.product.code).toBe(null);
    expect(scope.product.name).toBe('testing produkct');
    expect(scope.product.shortDescription).toBe('description of product');
    expect(scope.product.priceRrp).toBe(500);
    expect(scope.product.currencyRrp).toBe('EUR');
    expect(loc.path()).toBe('/product');
  });

  it('setCurrency - settting currency', function () {
    scope.localDataCurrency = [
      {id: 1, name: 'CZK'},
      {id: 2, name: 'EUR'}
    ];
    scope.product = {
      price1: '',
      currency1: 'CZK',
      price2: 500,
      currency2: 'EUR'
    };
    scope.setCurrency(1, -1);
    expect(scope.product.currency1).toBe(null);
    scope.setCurrency(2, 0);
    expect(scope.product.currency2).toBe('CZK');
  });

  it('setUnit - settting unit', function () {
    scope.localDataUnits = [
      {id: 'kg', name: 'kg'},
      {id: 'km', name: 'km'}
    ];
    scope.setUnit(0);
    expect(scope.product.unit).toBe('kg');
    scope.setUnit(1);
    expect(scope.product.unit).toBe('km');
  });

  it('uploadPicture - uploading picture', function () {
    scope.product = {id: 1, pictureId: null};
    scope.pictureFile = {id: 5};
    scope.uploadPictureConfig = {};
    scope.inProcess = false;
    scope.uploadPicture();
    expect(scope.uploadPictureConfig.inProcess).toBe(true);
  });

  it('selectFile - select file', function () {
    scope.pictureFile = null;
    scope.isPictureChange = false;
    scope.selectFile({id: 5}); // any object
    expect(scope.pictureFile.id).toBe(5);
    expect(scope.isPictureChange).toBe(true);
  });

  it('removePicture - remove picture from', function () {
    scope.isPictureChange = false;
    scope.product.pictureId = null;
    scope.pictureFile = {id: 5};
    scope.removePicture();
    expect(JSON.stringify(scope.pictureFile)).toBe('{}');
    expect(scope.isPictureChange).toBe(false);
    scope.isPictureChange = false;
    scope.product.pictureId = 5;
    scope.removePicture();
    expect(scope.isPictureChange).toBe(true);
  });

  it('showSavePictureAnchor - return boolean for eneble/disable save anchor', function () {
    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = 'Name';
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = true;
    scope.inProcess = false;
    expect(scope.showSavePictureAnchor()).toBe(true);
  });

  it('showDeletePictureAnchor - return boolean for eneble/disable delete anchor', function () {
    scope.isPictureChange = false;
    scope.pictureFile.name = 'Name';
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.inProcess = false;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.inProcess = true;
    expect(scope.showDeletePictureAnchor()).toBe(false);

    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.inProcess = false;
    expect(scope.showDeletePictureAnchor()).toBe(true);
  });

  it('showRemovePictureAnchor - return boolean for eneble/disable remove anchor', function () {
    scope.isPictureChange = true;
    scope.pictureFile.name = null;
    scope.product.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.product.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(false);

    scope.isPictureChange = false;
    scope.pictureFile.name = null;
    scope.product.pictureId = 5;
    expect(scope.showRemovePictureAnchor()).toBe(true);

    scope.isPictureChange = true;
    scope.pictureFile.name = 'Name';
    scope.product.pictureId = null;
    expect(scope.showRemovePictureAnchor()).toBe(true);
  });

  it('getProductPicture - create link for picture', function () {
    scope.pictureFile = {id: 1};
    expect(scope.getProductPicture()).toBe('pictureFile');

    scope.pictureFile = {};
    scope.isPictureChange = false;
    scope.product = {id: 1, pictureId: 5};
    expect(scope.getProductPicture()).toBe('/api/attachments/' + scope.product.pictureId);

    scope.pictureFile = {};
    scope.product.pictureId = null;
    scope.isPictureChange = true;
    expect(scope.getProductPicture()).toBe(constants.EMPTY_PRODUCT_PICTURE);
  });

  it('afterUploadProductPicture - callback for upload file after action', function () {
    scope.isPictureChange = null;
    scope.product.pictureId = null;
    scope.inProcess = null;
    scope.afterUploadProductPicture({data: {id: 5}});
    expect(scope.isPictureChange).toBe(false);
    expect(scope.product.pictureId).not.toBe(null);
    expect(scope.inProcess).toBe(false);
  });

  it('initPictureConfig - initialization picture config object', function () {
    scope.product = {id: 1, pictureId: 5};
    scope.uploadPictureConfig = {};
    var uploadPictureConfig = {
      url: '/api/product/' + scope.product.id + '/picture/upload',
      errorMsg: '',
      callback: scope.afterUploadPersonPicture,
      data: {
        table: constants.ATTACHMENTS_TYPES.PRODUCT,
        id: 5
      }
    };
    scope.initPictureConfig();
    expect(JSON.stringify(scope.uploadPictureConfig)).toBe(JSON.stringify(uploadPictureConfig));
  });

  it('deletePicture - delete picture', function () {
    scope.product = {id: 1, pictureId: 5};
    httpBackend.expectDELETE('/api/attachments/' + scope.product.pictureId).respond(201, {message: {type: constants.MESSAGE_SUCCESS}});
    scope.isPictureChange = null;
    scope.inProcess = false;
    scope.deletePicture();
    httpBackend.flush();
    expect(scope.product.pictureId).toBe(null);
    expect(scope.isPictureChange).toBe(false);
    expect(scope.inProcess).toBe(false);
  });
});
