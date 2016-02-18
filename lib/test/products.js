/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  products = require('../controllers/products'),
  attachments = require('../controllers/attachments');

conn.setEnv('development');

exports.search = function (test) {
  products.search(
    {
      params: {search: 'test'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.length > 0, "empty search");
        test.done();
      }
    }
  );
};

exports.smartInsert = function (test) {
  var tempId, testProduct = [];
  testProduct[0] = {
    name: 'TESTING PRODUCT ' + Math.random(),
    price: 1500
  };
  products.smartInsert(
    {},
    {},
    {product: testProduct},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      test.ok(tempId > 0, "smartInsert error");
      products.delete(
        {
          params: {id: tempId},
          validationErrors: function () {
            return null;
          },
          assert: function (arg, msg) {
            return {
              notEmpty: function () {
                test.throws({}, 'assert', msg);
              },
              isInt: function () {
                test.throws({}, 'assert', msg);
              }
            };
          }
        },
        {
          json: function () {
            test.done();
          }
        }
      );
    }
  );
};

exports.list = function (test) {
  products.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].code !== undefined, "property CODE not found");
        test.done();
      }
    }
  );
};

exports.delete = function (test) {
  var tempId, testProduct = [];
  testProduct[0] = {name: 'TESTING PRODUCT ' + Math.random()};
  products.smartInsert(
    {},
    {},
    {product: testProduct},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      products.delete(
        {
          params: {id: tempId},
          validationErrors: function () {
            return null;
          },
          assert: function (arg, msg) {
            return {
              notEmpty: function () {
                test.throws({}, 'assert', msg);
              },
              isInt: function () {
                test.throws({}, 'assert', msg);
              }
            };
          }
        },
        {
          json: function (result) {
            test.ok(result.message.type === 'SUCCESS', "delete record error");
            test.done();
          }
        }
      );
    }
  );
};

exports.get = function (test) {
  products.get(
    {
      params: {id: 1},
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.id > 0, "property ID not found");
        test.ok(result.code !== undefined, "property code not found");
        test.ok(result.name !== undefined, "property name not found");
        test.ok(result.shortDescription !== undefined, "property shortDescription not found");
        test.ok(result.fullDescription !== undefined, "property fullDescription not found");
        test.ok(result.priceRrp !== undefined, "property priceRrp not found");
        test.ok(result.price1 !== undefined, "property price1 not found");
        test.ok(result.price2 !== undefined, "property price2 not found");
        test.ok(result.price3 !== undefined, "property price3 not found");
        test.ok(result.price4 !== undefined, "property price4 not found");
        test.ok(result.price5 !== undefined, "property price5 not found");
        test.ok(result.picture !== undefined, "property picture not found");
        test.ok(result.unit !== undefined, "property unit not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  var tempId, tempCode = 'TESTING PRODUCT ' + Math.random();
  products.post(
    {
      body: {
        code: tempCode,
        name: 'Test',
        shortDescription: tempCode,
        priceRrp: 800,
        price1: 10,
        price2: 10.5,
        price3: 50,
        price4: 50.12,
        price5: 100,
        unit: 'ks',
        currencyRrp: 'CZK',
        currency1: 'CZK',
        currency2: 'GBP',
        currency3: 'USD',
        currency4: 'EUR',
        currency5: 'CZK'
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          },
          isFloat: function () {
            test.throws({}, 'assert', msg);
          },
          len: function (arg, arg2) {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        tempId = result.id;
        products.get(
          {
            params: {id: tempId},
            validationErrors: function () {
              return null;
            },
            assert: function (arg, msg) {
              return {
                notEmpty: function () {
                  test.throws({}, 'assert', msg);
                }
              };
            }
          },
          {
            json: function (result) {
              test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
              test.ok(result.id === tempId, "post record error");
              test.ok(result.code === tempCode, "bad inserted value code");
              test.ok(result.name === 'Test', "bad inserted value name");
              test.ok(result.shortDescription === tempCode, "bad inserted value shortDescription");
              test.ok(parseFloat(result.price1) === 10, "bad inserted value price1");
              test.ok(parseFloat(result.price2) === 10.5, "bad inserted value price2");
              test.ok(parseFloat(result.price3) === 50, "bad inserted value price3");
              test.ok(parseFloat(result.price4) === 50.12, "bad inserted value price4");
              test.ok(parseFloat(result.price5) === 100, "bad inserted value price5");
              products.delete(
                {
                  params: {id: tempId},
                  validationErrors: function () {
                    return null;
                  },
                  assert: function (arg, msg) {
                    return {
                      notEmpty: function () {
                        test.throws({}, 'assert', msg);
                      },
                      isInt: function () {
                        test.throws({}, 'assert', msg);
                      }
                    };
                  }
                },
                {
                  json: function () {
                    test.done();
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.put = function (test) {
  var tempId = 1, tempDesc = 'TESTING PRODUCT ' + Math.random();
  products.put(
    {
      body: {
        id: tempId,
        code: 'TEST 01',
        name: 'testovací',
        shortDescription: tempDesc,
        priceRrp: 800,
        price1: 0.51,
        price2: 153.55,
        price3: 50,
        price4: 530.10,
        price5: 100,
        unit: 'ks',
        currencyRrp: 'CZK',
        currency1: 'CZK',
        currency2: 'GBP',
        currency3: 'USD',
        currency4: 'EUR',
        currency5: 'CZK'
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
            test.throws({}, 'assert', msg);
          },
          isFloat: function () {
            test.throws({}, 'assert', msg);
          },
          len: function (arg, arg2) {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function () {
        products.get(
          {
            params: {id: tempId},
            validationErrors: function () {
              return null;
            },
            assert: function (arg, msg) {
              return {
                notEmpty: function () {
                  test.throws({}, 'assert', msg);
                }
              };
            }
          },
          {
            json: function (result) {
              test.ok(result.shortDescription === tempDesc, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.uploadPicture = function (test) {
  var id = 0, files = {
    file: {
      fieldName: 'file',
      originalFilename: '01.jpg',
      path: 'C:\\Users\\TEST\\AppData\\Local\\Temp\\6284-1xpgr58.jpg',
      headers: {
        'content-disposition': 'form-data; name="file"; filename="01.jpg"',
        'content-type': 'image/jpeg'
      },
      ws: {
        writable: true,
        path: 'C:\\Users\\TEST\\AppData\\Local\\Temp\\6284-1xpgr58.jpg',
        flags: 'w',
        mode: 438,
        bytesWritten: 25364,
        closed: true
      },
      size: 25364,
      name: '01.jpg',
      type: 'image/jpeg'
    }
  };
  products.uploadPicture(
    {
      files: files,
      params: {
        table: 'PRODUCT',
        tableId: 7
      },
      body: {data: ''}
    },
    {
      json: function (result) {
        id = result.id;
        test.ok(result !== undefined && result !== null && id !== 0, "uploadPicture error");
        attachments.deleteFile(
          {
            params: {id: id},
            body: {data: ''}
          },
          {
            json: function (result) {
              test.ok(result.success === true, "deleteFile error");
              test.done();
            }
          }
        );
      }
    }
  );
};
