/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  tasks = require('../controllers/tasks');

conn.setEnv('development');

exports.events = function (test) {
  tasks.events(
    {
      user: 'notia_user',
      password: 'notia',
      database: 'dit_develop',
      host: 'localhost',
      port: 5432,
      clientDB: null
    },
    {
      callback: function () {
        return null;
      }
    }
  ).then(
    function (result) {
      test.ok(result.length > 0, "empty list");
      test.ok(result[0].item.id !== undefined, "property item.id not found");
      test.ok(result[0].item.start_date !== undefined, "property item.start_date not found");
      test.ok(result[0].item.users !== undefined, "property item.users not found");
      test.done();
    }
  );
};

exports.markAsDone = function (test) {
  var tempId;
  tasks.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        subject: 'Testing task',
        startDate: new Date(),
        dueDate: new Date(),
        timezoneName: 'Europe/Prague'
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          len: function () {
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
        tempId = result.id;
        tasks.markAsDone(
          {
            body: {id: tempId},
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
              tasks.get(
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
                    test.ok(result.finishDate !== undefined, "property finishDate not found");
                    test.ok(new Date(result.finishDate) instanceof Date, "property finishDate not found");
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

exports.get = function (test) {
  var id = 80;
  tasks.get(
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
        test.ok(parseInt(result.id, 10) === id, "get record error");
        test.ok(result.projectId !== undefined, "property projectId not found");
        test.ok(result.projectName !== undefined, "property projectName not found");
        test.ok(result.subject !== undefined, "property subject not found");
        test.ok(result.startDate !== undefined, "property startDate not found");
        test.ok(result.dueDate !== undefined, "property dueDate not found");
        test.ok(result.finishDate !== undefined, "property finishDate not found");
        test.done();
      }
    }
  );
};

exports.del = function (test) {
  var tempId;
  tasks.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        subject: 'Testing task',
        startDate: new Date(),
        dueDate: new Date(),
        timezoneName: 'Europe/Prague'
      },
      validationErrors: function () {
        return null;
      },
      assert: function (arg, msg) {
        return {
          notEmpty: function () {
            test.throws({}, 'assert', msg);
          },
          len: function () {
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
        tempId = result.id;
        test.ok(tempId > 0, "post error");
        tasks.del(
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

exports.tags = function (test) {
  tasks.tags(
    {
      validationErrors: function () {
        return null;
      }
    },
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

exports.relatedList = function (test) {
  tasks.relatedList(
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
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].projectId !== undefined, "property projectId not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.done();
      }
    }
  );
};

exports.relatedPrecedingList = function (test) {
  tasks.relatedPrecedingList(
    {
      params: {id: 77},
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
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].projectId !== undefined, "property projectId not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.done();
      }
    }
  );
};

exports.relatedFollowingList = function (test) {
  tasks.relatedFollowingList(
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
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].projectId !== undefined, "property projectId not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  var tempId;
  tasks.post(
    {
      body: {
        subject: 'TESTING TASK ' + Math.random(),
        startDate: new Date(),
        dueDate: new Date(),
        timezoneName: 'Europe/Prague'
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
          len: function (arg, arg2) {
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
        tempId = result.id;
        tasks.get(
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
              test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
              test.ok(result.id === tempId, "post record error");
              tasks.del(
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
  var tempId = 1, temp = 'TESTING PROJECT ' + Math.random();
  tasks.put(
    {
      body: {
        id: tempId,
        subject: temp,
        startDate: new Date(),
        dueDate: new Date(),
        timezoneName: 'Europe/Prague'
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
          len: function (arg, arg2) {
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
        test.ok(parseInt(result.id, 10) === tempId, "put record error");
        tasks.get(
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
              test.ok(result.subject === temp, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.deleteTasksTags = function (test) {
  var id = 77;
  tasks.insertTasksTags(
    {
      testId: {'id_TestTag': 1, 'id_TestTag2': 2},
      validationErrors: function () {
        return null;
      }
    },
    {},
    {
      taskId: id,
      taskTags: [{id: 'id_TestTag', name: 'TestTag'}, {id: 'id_TestTag2', name: 'TestTag2'}]
    }
  ).then(
    function () {
      tasks.deleteTasksTags(
        {},
        {},
        {id: id},
        {}
      ).then(
        function (result) {
          test.done();
        }
      );
    }
  );
};

exports.list = function (test) {
  tasks.list(
    {
      query: {count: 0},
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.ok(result[0].deadline !== undefined, "property deadline not found");
        test.ok(new Date(result.deadline) instanceof Date, "property deadline not found");
        test.done();
      }
    }
  );
};

exports.userCount = function (test) {
  tasks.userCount(
    {signedCookies: {auth_token: 'TESTOVACITOKEN'}},
    {
      json: function (result) {
        test.ok(result.count > 0, "empty list");
        test.ok(result.message.type === 'SUCCESS', "userCount error");
        test.done();
      }
    }
  );
};

exports.userListOld = function (test) {
  tasks.userListOld(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      params: {limit: 5}
    },
    {
      json: function (result) {
        test.ok(result.records, "userListOld error");
        test.done();
      }
    }
  );
};

exports.userListTomorrow = function (test) {
  tasks.userListTomorrow(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      params: {limit: 5}
    },
    {
      json: function (result) {
        test.ok(result.records, "userListTomorrow error");
        test.done();
      }
    }
  );
};

exports.userListNew = function (test) {
  tasks.userListNew(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      params: {limit: 5}
    },
    {
      json: function (result) {
        test.ok(result.records, "userListNew error");
        test.done();
      }
    }
  );
};
