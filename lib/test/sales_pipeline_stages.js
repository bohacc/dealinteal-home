/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  constants = require('../controllers/constants'),
  sales_pipeline_stages = require('../controllers/sales_pipeline_stages');

conn.setEnv('development');

exports.list = function (test) {
  sales_pipeline_stages.list(
    {},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].name !== undefined, "property name not found");
        test.done();
      }
    }
  );
};

exports.get = function (test) {
  sales_pipeline_stages.get(
    {
      params: {id: 1},
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
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.id > 0, "property ID not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  var id = 99;
  sales_pipeline_stages.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        name: 'Test',
        chance: 1
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
          isNull: function () {
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
        sales_pipeline_stages.get(
          {
            params: {id: id},
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
              test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
              test.ok(parseInt(result.id, 10) === id, "post record error");
              sales_pipeline_stages.del(
                {
                  params: {
                    id: id
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
                      }
                    };
                  }
                },
                {
                  json: function (result) {
                    test.done();
                  }
                }
              );
            }
          }
        );
      }
    },
    false
  );
};

exports.put = function (test) {
  var id = 1, ran = 'Lead / New Opportunity'; // + Math.random();
  sales_pipeline_stages.put(
    {
      body: {
        id: id,
        name: ran
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
          isNull: function () {
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
        sales_pipeline_stages.get(
          {
            params: {id: id},
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
              test.equal(result.name, ran, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.del = function (test) {
  var id = 99;
  sales_pipeline_stages.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        name: "TEST" + Math.random(),
        chance: 99
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
          isNull: function () {
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
        sales_pipeline_stages.del(
          {
            params: {
              id: id
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
                }
              };
            }
          },
          {
            json: function (result) {
              sales_pipeline_stages.get(
                {
                  params: {id: id},
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
                    test.equal(result.id, null, "delete record error");
                    test.done();
                  }
                }
              );
              test.equal(result.message.type, constants.MESSAGE_SUCCESS, "delete record error");
            }
          }
        );
      }
    }
  );
};

exports.replace = function (test) {
  var id = 99, newId = 88;
  sales_pipeline_stages.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        name: "TEST" + Math.random(),
        chance: 99
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
          isNull: function () {
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
        sales_pipeline_stages.replace(
          {
            params: {
              id: id
            },
            body: {
              id: id,
              newId: newId
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
                }
              };
            }
          },
          {
            json: function (result) {
              sales_pipeline_stages.get(
                {
                  params: {id: id},
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
                    test.equal(result.id, null, "delete record error");
                    test.done();
                  }
                }
              );
              test.equal(result.message.type, constants.MESSAGE_SUCCESS, "delete record error");
            }
          }
        );
      }
    }
  );
};
