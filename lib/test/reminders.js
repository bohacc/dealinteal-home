/*jslint node: true, unparam: true */
'use strict';

var reminders = require('../controllers/reminders'),
  conn = require('../controllers/connections'),
  constants = require('../controllers/constants'),
  express = require('express');

conn.setEnv('development');

exports.addReminder = function (test) {
  var id = 999999999;
  reminders.addReminder(
    {
      validationErrors: function () {
        return null;
      },
      body: {id: 1},
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        return null;
      }
    },
    {
      testId: id,
      appointment_id: 795,
      recipient_id: 9,
      subject: 'Test',
      reminder_time: '2014-12-14T01:01:50.000Z',
      email_rem: 1,
      email: 'bohac@notia.cz'
    }
  ).then(
    function () {
      reminders.get(
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
            reminders.del(
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
    },
    function () {
      test.ok(false, 'error on add reminder');
      test.done();
    }
  );
};

exports.post = function (test) {
  var id = 999999999;
  reminders.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {id: id, subject: 'Test 999999999', recipient_id: 9, original_time: new Date(), reminder_time: new Date()},
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
        reminders.get(
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
              test.ok(result.subject === 'Test 999999999', "get record error");
              reminders.del(
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
                    reminders.get(
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
                          test.ok(result === undefined || result === null || JSON.stringify(result) === '{}', "not empty record");
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
      }
    }
  );
};

exports.put = function (test) {
  var id = 70;
  reminders.put(
    {
      params: {id: id},
      body: {id: id, subject: 'Test 33'},
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
        reminders.get(
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
              test.ok(result.subject === 'Test 33', "get record error");
              reminders.put(
                {
                  params: {id: id},
                  body: {id: id, subject: 'Test 3'},
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
  var tempId = 999999999;
  reminders.addReminder(
    {
      validationErrors: function () {
        return null;
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {},
    {
      testId: tempId,
      subject: 'Test'
    }
  ).then(
    function () {
      reminders.del(
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
            reminders.get(
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
                  test.ok(result === undefined || result === null || JSON.stringify(result) === '{}', "delete record error");
                  test.done();
                }
              }
            );
          }
        }
      );
    }
  );
};

exports.get = function (test) {
  var id = 70;
  reminders.get(
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
        test.ok(result.subject === 'Test 3', "get record error");
        test.done();
      }
    }
  );
};

exports.list = function (test) {
  reminders.list(
    {
      query: {count: 0},
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty list");
        test.ok(parseInt(result[0].id, 10) > 0, "get record error");
        test.done();
      }
    }
  );
};

exports.listForCalendar = function (test) {
  reminders.listForCalendar(
    {
      validationErrors: function () {
        return null;
      },
      signedCookies: {auth_token: '123456789'},
      params: {}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty list");
        //test.ok(parseInt(result[0].id, 10) > 0, "get record error");
        test.done();
      }
    }
  );
};

exports.putFromCalendar = function (test) {
  var id = 70;
  reminders.putFromCalendar(
    {
      params: {id: id},
      body: {id: id, original_time: '2014-12-10T01:02:50.000Z'},
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
        reminders.get(
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
              test.ok(result.original_time === '2014-12-10T01:02:50.000Z', "get record error");
              reminders.putFromCalendar(
                {
                  params: {id: id},
                  body: {id: id, original_time: '2014-12-16T01:02:50.000Z'},
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

exports.markAsDone = function (test) {
  var tempId;
  reminders.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {subject: 'Testing reminder', recipient_id: 9, original_time: new Date(), reminder_time: new Date()},
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
        reminders.markAsDone(
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
              reminders.get(
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
                    test.ok(result.finish_date !== undefined, "property finish_date not found");
                    test.ok(new Date(result.finish_date) instanceof Date, "property finish_date not found");
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

exports.deleteReminderFor = function (test) {
  var tempId, taskId = 1;
  reminders.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {subject: 'Testing reminder', task_id: taskId, recipient_id: 9, original_time: new Date(), reminder_time: new Date()},
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
        reminders.get(
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
              test.ok(parseInt(result.task_id, 10) === 1, "post record error");
              reminders.deleteReminderFor(
                {},
                {},
                {type: 'task_id', id: taskId},
                {}
              ).then(
                function () {
                  reminders.get(
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
                        test.ok(result === undefined || result === null || JSON.stringify(result) === '{}', "delete record error");
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
    }
  );
};
