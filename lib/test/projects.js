/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  projects = require('../controllers/projects'),
  companies = require('../controllers/companies');

conn.setEnv('development');

exports.search = function (test) {
  projects.search(
    {
      query: {limit: 10},
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
  var tempId, testProject = [];
  testProject[0] = {name: 'TESTING PROJECT ' + Math.random()};
  projects.smartInsert(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {testId: null}
    },
    {},
    {project: testProject},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      test.ok(tempId > 0, "smartInsert error");
      projects.delete(
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
  projects.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].subject !== undefined, "property SUBJECT not found");
        test.done();
      }
    }
  );
};

exports.delete = function (test) {
  var tempId, testProject = [];
  testProject[0] = {name: 'TESTING PROJECT ' + Math.random()};
  projects.smartInsert(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {testId: null}
    },
    {},
    {project: testProject},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      projects.delete(
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
  projects.get(
    {
      params: {id: 5},
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
        test.ok(result.subject !== undefined, "property subject not found");
        test.ok(result.description !== undefined, "property description not found");
        test.ok(result.startDate !== undefined, "property startDate not found");
        test.ok(result.endDate !== undefined, "property endDate not found");
        test.ok(result.ownerId !== undefined, "property ownerId not found");
        test.ok(result.companyId !== undefined, "property companyId not found");
        test.ok(result.personId !== undefined, "property personId not found");
        test.ok(result.companyName !== undefined, "property companyName not found");
        test.ok(result.ownerName !== undefined, "property ownerName not found");
        test.ok(result.company !== undefined, "property company not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  var tempId;
  projects.post(
    {
      body: {
        subject: 'TESTING PROJECT ' + Math.random(),
        description: 'něco',
        companyId: null
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
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
          len: function (arg, arg2) {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        tempId = result.id;
        projects.get(
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
              projects.delete(
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
  var tempId = 1, tempDesc = 'TESTING PROJECT ' + Math.random();
  projects.put(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: tempId,
        subject: 'Test',
        description: tempDesc,
        companyId: null
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
          len: function (arg, arg2) {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function () {
        projects.get(
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
              test.ok(result.description === tempDesc, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.saveCompany = function (test) {
  var tempId = 1, tempCompId;
  projects.saveCompany(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: tempId,
        company: [{id: 3, name: 'TESTING COMPANY'}]
      }
    },
    {},
    {}
  ).then(
    function () {
      projects.saveCompany(
        {
          signedCookies: {auth_token: 'TESTOVACITOKEN'},
          body: {
            id: tempId,
            company: [{id: 2, name: 'TESTING COMPANY'}]
          }
        },
        {},
        {}
      ).then(
        function () {
          projects.get(
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
                test.ok(parseInt(result.companyId, 10) === 2, "bad updated value");
                test.ok(parseInt(result.id, 10) === tempId, "invalid record");
              }
            }
          );
        }
      );
    }
  ).then( // test of insert a new company
    function () {
      projects.saveCompany(
        {
          signedCookies: {auth_token: 'TESTOVACITOKEN'},
          body: {
            id: tempId,
            company: [{id: 'id_221456', name: 'TESTING COMPANY'}]
          }
        },
        {},
        {}
      ).then(
        function () {
          projects.get(
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
                tempCompId = result.companyId;
                test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
                test.ok(parseInt(tempCompId, 10) !== 2, "bad new value");
                projects.saveCompany(
                  {
                    signedCookies: {auth_token: 'TESTOVACITOKEN'},
                    body: {
                      id: tempId,
                      company: []
                    }
                  },
                  {},
                  {}
                ).then(
                  function () {
                    companies.delete(
                      {
                        params: {id: tempCompId},
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
                        json: function () {
                          test.done();
                        }
                      }
                    );
                  }
                );
              }
            }
          );
        }
      );
    }
  );
};

exports.history = function (test) {
  projects.history(
    {
      params: {id: 124},
      validationErrors: function () {
        return null;
      },
      checkParams: function (arg, msg) {
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
  projects.searchGlobal(
    {params: {str: 'test'}},
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.ok(result.length > 0, "empty search");
        test.done();
      }
    }
  );
};
