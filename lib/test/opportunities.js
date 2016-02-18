/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  opportunities = require('../controllers/opportunities');

conn.setEnv('development');

exports.get = function (test) {
  opportunities.get(
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
        test.ok(result.id !== undefined, "property id not found");
        test.ok(result.companyId !== undefined, "property companyId not found");
        test.ok(result.subject !== undefined, "property subject not found");
        test.ok(result.ownerId !== undefined, "property ownerId not found");
        test.ok(result.description !== undefined, "property description not found");
        test.ok(result.salesPipelineStageId !== undefined, "property salesPipelineStageId not found");
        test.ok(result.chance !== undefined, "property chance not found");
        test.ok(result.personId !== undefined, "property personId not found");
        test.done();
      }
    }
  );
};

exports.put = function (test) {
  var tempId = 1, tempDesc = 'TEST ' + Math.random();
  opportunities.put(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: tempId,
        description: tempDesc,
        subject: 'Subject 1',
        owner_id: 6,
        company: {id: 1}
      },
      validationErrors: function () {
        return null;
      },
      checkBody: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          isInt: function () {
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
        opportunities.get(
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
              test.equal(result.description, tempDesc, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.post = function (test) {
  var tempId;
  opportunities.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        subject: 'test',
        company: {id: 1}
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
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
        opportunities.get(
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
              test.ok(result.id > 0, "post record error");
              opportunities.del(
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

exports.del = function (test) {
  var tempId;
  opportunities.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        subject: 'test',
        company: {id: 1}
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
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
        test.ok(tempId > 0, "post error");
        opportunities.del(
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
    }
  );
};

exports.putItem = function (test) {
  var testProduct = [];
  testProduct[0] = {id: 288};
  opportunities.putItem(
    {
      body: {
        id: 10,
        item: {
          number: 1,
          product: testProduct,
          price: 20,
          amount: 5
        }
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
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.message.type === 'SUCCESS', "putItem error");
        test.done();
      }
    }
  );
};

exports.postItem = function (test) {
  var testProduct = [];
  testProduct[0] = {id: 3};
  opportunities.postItem(
    {
      body: {
        id: 10,
        item: {
          product: testProduct,
          price: 200,
          amount: 50
        }
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
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(result.message.type === 'SUCCESS', "postItem error");
        test.done();
      }
    }
  );
};

exports.delItem = function (test) {
  opportunities.delItem(
    {
      params: {
        id: 10,
        number: 1
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
        test.ok(result.message.type === 'SUCCESS', "delItem error");
        test.done();
      }
    }
  );
};

exports.listItems = function (test) {
  opportunities.listItems(
    {
      query: {count: 0},
      params: {id: 10}
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].salesPipelineId !== undefined, "property salesPipelineId not found");
        test.done();
      }
    }
  );
};

exports.deleteTasksTags = function (test) {
  opportunities.saveTags(
    {
      body: {
        id: 10,
        opportunityTags: [{id: 'id_TestTag', name: 'TestTag'}, {id: 'id_TestTag2', name: 'TestTag2'}],
        testId: {'id_TestTag': 1, 'id_TestTag2': 2}
      },
      validationErrors: function () {
        return null;
      }
    },
    {},
    {}
  ).then(
    function () {
      opportunities.deleteTasksTags(
        {},
        {},
        {id: 10},
        {}
      ).then(
        function (result) {
          test.done();
        }
      );
    }
  );
};

exports.tags = function (test) {
  opportunities.tags(
    {
      validationErrors: function () {
        return null;
      }
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

exports.history = function (test) {
  opportunities.history(
    {
      params: {id: 10},
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
        test.ok(result.length > 0, "empty search");
        test.done();
      }
    }
  );
};

exports.searchGlobal = function (test) {
  opportunities.searchGlobal(
    {
      params: {str: 'seznam.cz'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.list = function (test) {
  opportunities.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.ok(result[0].companyName !== undefined, "property companyName not found");
        test.ok(result[0].ownerName !== undefined, "property ownerName not found");
        test.ok(result[0].chance !== undefined, "property chance not found");
        test.ok(result[0].price !== undefined, "property price not found");
        test.done();
      }
    }
  );
};
