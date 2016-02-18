/*jslint node: true, unparam: true */
'use strict';

var appointment = require('../controllers/appointment'),
  conn = require('../controllers/connections'),
  companies = require('../controllers/companies'),
  reminders = require('../controllers/reminders'),
  people = require('../controllers/people'),
  projects = require('../controllers/projects'),
  constants = require('../controllers/constants');

conn.setEnv('development');

exports.types = function (test) {
  test.expect(4);
  appointment.types(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result.length === 4, "not enough values");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].name !== undefined, "property NAME not found");
        test.done();
      }
    }
  );
};

exports.places = function (test) {
  test.expect(4);
  appointment.places(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result.length === 3, "not enough values");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].name !== undefined, "property NAME not found");
        test.done();
      }
    }
  );
};

exports.tags = function (test) {
  test.expect(3);
  appointment.tags(
    {
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].name !== undefined, "property NAME not found");
        test.done();
      }
    }
  );
};

exports.nextFreeTime = function (test) {
  test.expect(3);
  appointment.nextFreeTime(
    {
      validationErrors: function () {
        return null;
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '{}', "empty list");
        test.ok(result.next_free_time !== undefined, "property NEXT_FREE_TIME not found");
        test.ok(new Date(result.next_free_time) instanceof Date, "property NEXT_FREE_TIME not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  test.expect(3);
  appointment.post(
    {
      body: {
        type_id: '3',
        subject: 'Test - auto.',
        place: 'HOME',
        start_time: '2015-01-13T15:00:00.000Z',
        end_time: '2015-01-13T17:00:00.000Z',
        owner_id: 9,
        timezone_name: 'Europe/Prague'
      },
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '{}', "empty list");
        test.ok(result.id !== undefined, "property ID not found");
        test.ok(result.id > 0, "property ID not found");
        appointment.del(
          {
            params: {
              id: result.id
            },
            body: {
              id: result.id
            },
            validationErrors: function () {
              return null;
            },
            assert: function () {
              return {
                notEmpty: function () {
                  return null;
                },
                isInt: function () {
                  return null;
                },
                len: function () {
                  return null;
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
};

exports.put = function (test) {
  test.expect(3);
  appointment.put(
    {
      body: {
        id: 245,
        type_id: '3',
        subject: 'Test - auto.',
        place: 'HOME',
        start_time: '2015-01-13T15:00:00.000Z',
        end_time: '2015-01-13T17:00:00.000Z',
        owner_id: 9,
        timezone_name: 'Europe/Prague'
      },
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '{}', "empty list");
        test.ok(result.id !== undefined, "property ID not found");
        test.ok(result.id > 0, "property ID not found");
        test.done();
      }
    }
  );
};

exports.del = function (test) {
  var id = 999999999;
  test.expect(3);
  appointment.post(
    {
      body: {
        id: id,
        type_id: '3',
        subject: 'Test - auto.',
        place: 'HOME',
        start_time: '2015-01-13T15:00:00.000Z',
        end_time: '2015-01-13T17:00:00.000Z',
        owner_id: 9,
        timezone_name: 'Europe/Prague'
      },
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '{}', "empty list");
        test.ok(result.id !== undefined, "property ID not found");
        test.ok(result.id > 0, "property ID not found");
        appointment.del({
          params: {
            id: id
          },
          body: {
            id: id
          },
          validationErrors: function () {
            return null;
          },
          assert: function () {
            return {
              notEmpty: function () {
                return null;
              },
              isInt: function () {
                return null;
              },
              len: function () {
                return null;
              }
            };
          }
        });
        test.done();
      }
    }
  );
};

exports.deleteAppointmentTags = function (test) {
  //test.expect(3);
  appointment.saveAppointmentTags(
    {
      body: {
        id: 245,
        appointment_tags: [{id: 'id_TestTag', name: 'TestTag'}, {id: 'id_TestTag2', name: 'TestTag2'}],
        testId: {'id_TestTag': 999999999, 'id_TestTag2': 999999998}
      },
      validationErrors: function () {
        return null;
      }
    },
    {},
    {}
  ).then(
    function () {
      appointment.deleteAppointmentTags(
        {
          body: {
            id: 245
          },
          validationErrors: function () {
            return null;
          }
        },
        {},
        {}
      ).then(
        function () {
          test.done();
        },
        function () {
          test.done();
        }
      );
    },
    function () {
      test.done();
    }
  );
};

exports.saveCompany = function (test) {
  var id = 245;
  appointment.saveCompany(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        company: [{id: 393732, name: 'Test'}]
      }
    },
    {},
    {}
  ).then(
    function () {
      appointment.saveCompany(
        {
          signedCookies: {auth_token: 'TESTOVACITOKEN'},
          body: {
            id: id,
            company: [{id: 393731, name: 'Test'}]
          }
        },
        {},
        {}
      ).then(
        function () {
          appointment.get(
            {
              params: {id: id},
              validationErrors: function () {
                return null;
              },
              assert: function () {
                return {
                  notEmpty: function () {
                    return null;
                  },
                  isInt: function () {
                    return null;
                  },
                  len: function () {
                    return null;
                  }
                };
              }
            },
            {
              json: function (result) {
                test.ok(JSON.stringify(result) !== '{}', "empty list");
                test.ok(parseInt(result.company_id, 10) === 393731, "bad updated value");
                test.ok(parseInt(result.id, 10) === id, "invalid record");
              }
            }
          );
        }
      );
    }
  ).then( // next test
    function () {
      appointment.saveCompany(
        {
          signedCookies: {auth_token: 'TESTOVACITOKEN'},
          body: {
            id: id,
            company: [{id: 'id_Test', name: 'Test'}]
          }
        },
        {},
        {}
      ).then(
        function () {
          appointment.get(
            {
              params: {id: id},
              validationErrors: function () {
                return null;
              },
              assert: function () {
                return {
                  notEmpty: function () {
                    return null;
                  },
                  isInt: function () {
                    return null;
                  },
                  len: function () {
                    return null;
                  }
                };
              }
            },
            {
              json: function (result) {
                test.ok(JSON.stringify(result) !== '{}', "empty list");
                test.ok(parseInt(result.company_id, 10) > 0, "bad updated value");
                test.ok(parseInt(result.company_id, 10) !== 393731, "bad updated value");
                test.ok(parseInt(result.id, 10) === id, "invalid record");
                appointment.saveCompany(
                  {
                    signedCookies: {auth_token: 'TESTOVACITOKEN'},
                    body: {
                      id: id,
                      company_id: null,
                      company: []
                    }
                  },
                  {},
                  {}
                ).then(
                  function () {
                    companies.delete(
                      {
                        params: {id: result.company_id},
                        validationErrors: function () {
                          return null;
                        },
                        assert: function () {
                          return {
                            notEmpty: function () {
                              return null;
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
                );
              }
            }
          );
        }
      );
    }
  );
};

exports.saveSalesPipeline = function (test) {
  var companyId = 393731, id = 245;
  appointment.saveSalesPipeline(
    {
      body: {
        id: id,
        owner_id: 9,
        company_id: companyId,
        salesPipeline: [{id: 1, name: 'Test'}],
        sales_pipeline_stage_id: 1
      }
    },
    {},
    {}
  ).then(
    function () {
      appointment.saveSalesPipeline(
        {
          body: {
            id: id,
            owner_id: 9,
            company_id: companyId,
            salesPipeline: [{id: 2, name: 'Test'}],
            sales_pipeline_stage_id: 9
          }
        },
        {},
        {}
      ).then(
        function () {
          appointment.get(
            {
              params: {id: id},
              validationErrors: function () {
                return null;
              },
              assert: function () {
                return {
                  notEmpty: function () {
                    return null;
                  },
                  isInt: function () {
                    return null;
                  },
                  len: function () {
                    return null;
                  }
                };
              }
            },
            {
              json: function (result) {
                test.ok(JSON.stringify(result) !== '{}', "empty list");
                test.ok(parseInt(result.sales_pipeline_id, 10) === 2, "bad updated value");
                test.ok(parseInt(result.id, 10) === id, "invalid record");
              }
            }
          );
        }
      ).then( // next test
        function () {
          appointment.saveSalesPipeline(
            {
              body: {
                id: id,
                company_id: companyId,
                owner_id: 9,
                salesPipeline: [{id: 'id_Test', name: 'Test'}]
              }
            },
            {},
            {}
          ).then(
            function () {
              appointment.get(
                {
                  params: {id: id},
                  validationErrors: function () {
                    return null;
                  },
                  assert: function () {
                    return {
                      notEmpty: function () {
                        return null;
                      },
                      isInt: function () {
                        return null;
                      },
                      len: function () {
                        return null;
                      }
                    };
                  }
                },
                {
                  json: function (result) {
                    test.ok(JSON.stringify(result) !== '{}', "empty list");
                    test.ok(parseInt(result.sales_pipeline_id, 10) > 0, "bad updated value");
                    test.ok(parseInt(result.sales_pipeline_id, 10) !== 2, "bad updated value");
                    test.ok(parseInt(result.id, 10) === id, "invalid record");
                    appointment.saveSalesPipeline(
                      {
                        body: {
                          id: id,
                          company_id: companyId,
                          sales_pipeline_id: null,
                          salesPipeline: []
                        }
                      },
                      {},
                      {}
                    ).then(
                      function () {
                        test.done();
                      }
                    );
                  }
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.addPeople = function (test) {
  var id = 245, appointmentReq, appointmentRes;
  appointmentReq = {
    params: {id: id},
    validationErrors: function () {
      return null;
    },
    assert: function () {
      return {
        notEmpty: function () {
          return null;
        },
        isInt: function () {
          return null;
        },
        len: function () {
          return null;
        }
      };
    }
  };
  appointmentRes = {
    json: function (result) {
      test.ok(JSON.stringify(result) !== '{}', "empty list");
      test.ok(parseInt(result.teamReminderMembers.length, 10) > 0, "bad updated value");
      test.ok(parseInt(result.teamReminderMembers[0].id, 10) === 9, "bad updated value");
      test.ok(parseInt(result.id, 10) === id, "invalid record");
      appointment.deletePeople({
        body: {
          id: id,
          teamReminderMembers: []
        }
      }, {}, {}).then(
        function () {
          test.done();
        }
      );
    }
  };

  appointment.addPeople({
    body: {
      id: id,
      teamReminderMembers: [{id: 9, name: 'Test'}]
    }
  }, {}, {}).then(
    function () {
      appointment.get(appointmentReq, appointmentRes);
    }
  );
};

exports.createPeople = function (test) {
  var id = 999999999, reqGet;
  reqGet = {
    params: {
      id: id
    },
    validationErrors: function () {
      return null;
    },
    assert: function () {
      return {
        notEmpty: function () {
          return null;
        },
        isInt: function () {
          return null;
        },
        len: function () {
          return null;
        }
      };
    }
  };
  appointment.createPeople({
    body: {
      id: id,
      testId: id,
      attendeeReminderMembers: [{id: 'id_Test', name: 'Martin Boháčtest'}]
    }
  }, {}, {}).then(
    function () {
      people.get(reqGet, {
        json: function (result) {
          people.delete(reqGet, {
            json: function () {
              test.ok(result.first_name === 'Martin', "bad updated value");
              test.ok(result.last_name === 'Boháčtest', "bad updated value");
              test.done();
            }
          });
        }
      });
    }
  );
};

exports.addReminders = function (test) {
  var id = 999999999;
  appointment.addReminders({
    signedCookies: {auth_token: 'TESTOVACITOKEN'},
    body: {
      id: 245,
      testId: id,
      owner_id: 9,
      subject: 'Test',
      start_time: '2015-01-14T01:00:00.000Z',
      reminder_seconds: 600
    },
    validationErrors: function () {
      return null;
    },
    assert: function () {
      return {
        notEmpty: function () {
          return null;
        },
        isInt: function () {
          return null;
        },
        len: function () {
          return null;
        }
      };
    }
  }, {}, {}).then(
    function () {
      reminders.get({
        params: {
          id: id
        },
        validationErrors: function () {
          return null;
        },
        assert: function () {
          return {
            notEmpty: function () {
              return null;
            },
            isInt: function () {
              return null;
            },
            len: function () {
              return null;
            }
          };
        }
      }, {
        json: function (result) {
          test.ok(result.subject === 'Test', "bad updated value");
          test.ok(result.original_time === '2015-01-14T01:00:00.000Z', "bad updated value");
          reminders.del(
            {
              params: {
                id: id
              },
              validationErrors: function () {
                return null;
              },
              assert: function () {
                return {
                  notEmpty: function () {
                    return null;
                  },
                  isInt: function () {
                    return null;
                  },
                  len: function () {
                    return null;
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
      });
    }
  );
};

exports.get = function (test) {
  var id = 245;
  appointment.get(
    {
      params: {id: id},
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '{}', "empty list");
        test.ok(parseInt(result.id, 10) === id, "invalid record");
        test.done();
      }
    }
  );
};

exports.listForCalendar = function (test) {
  appointment.listForCalendar(
    {
      params: {person: 9},
      query: {
        startTime: '1.1.2000',
        endTime: '1.1.2100'
      },
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      }
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) !== '[]', "empty list");
        test.ok(result.length > 0, "records not found");
        test.done();
      }
    }
  );
};

exports.putFromCalendar = function (test) {
  var id = 245;
  appointment.putFromCalendar(
    {
      body: {
        id: id,
        start_time: '2015-01-14T02:00:00.000Z',
        end_time: '2015-01-14T04:00:00.000Z'
      },
      validationErrors: function () {
        return null;
      },
      assert: function () {
        return {
          notEmpty: function () {
            return null;
          },
          isInt: function () {
            return null;
          },
          len: function () {
            return null;
          }
        };
      }
    },
    {
      json: function (result) {
        appointment.get(
          {
            params: {id: id},
            validationErrors: function () {
              return null;
            },
            assert: function () {
              return {
                notEmpty: function () {
                  return null;
                },
                isInt: function () {
                  return null;
                },
                len: function () {
                  return null;
                }
              };
            }
          },
          {
            json: function (result) {
              test.ok(JSON.stringify(result) !== '{}', "empty list");
              test.ok(parseInt(result.id, 10) === id, "invalid record");
              test.ok((new Date(result.start_time)).toISOString() === '2015-01-14T03:00:00.000Z', "invalid value"); // for timezone Europe/Prague from record
              test.ok((new Date(result.end_time)).toISOString() === '2015-01-14T05:00:00.000Z', "invalid value"); // for timezone Europe/Prague from record
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.list = function (test) {
  appointment.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id not found");
        test.ok(result[0].subject !== undefined, "property subject not found");
        test.done();
      }
    }
  );
};

exports.createProject = function (test) {
  var id = 999999999, reqGet, tempName = 'TESTING PROJECT ' + Math.random();
  reqGet = {
    params: {
      id: id
    },
    validationErrors: function () {
      return null;
    },
    assert: function () {
      return {
        notEmpty: function () {
          return null;
        },
        isInt: function () {
          return null;
        },
        len: function () {
          return null;
        }
      };
    }
  };
  appointment.createProject(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        testId: id,
        projects: [{id: 'id_Test', name: tempName}]
      }
    },
    {},
    {}
  ).then(
    function () {
      projects.get(reqGet, {
        json: function (result) {
          projects.delete(reqGet, {
            json: function () {
              test.ok(result.subject === tempName, "bad updated value");
              test.done();
            }
          });
        }
      });
    }
  );
};

exports.addProject = function (test) {
  var id = 245, appointmentReq, appointmentRes;
  appointmentReq = {
    params: {id: id},
    validationErrors: function () {
      return null;
    },
    assert: function () {
      return {
        notEmpty: function () {
          return null;
        },
        isInt: function () {
          return null;
        },
        len: function () {
          return null;
        }
      };
    }
  };
  appointmentRes = {
    json: function (result) {
      test.ok(JSON.stringify(result) !== '{}', "empty list");
      test.ok(parseInt(result.projects.length, 10) > 0, "bad updated value");
      test.ok(parseInt(result.projects[0].id, 10) === 1, "bad updated value");
      test.ok(parseInt(result.id, 10) === id, "invalid record");
      appointment.deleteProjects({
        body: {id: id}
      }, {}, {}).then(
        function () {
          test.done();
        }
      );
    }
  };

  appointment.addProjects({
    body: {
      id: id,
      projects: [{id: 1}]
    }
  }, {}, {}).then(
    function () {
      appointment.get(appointmentReq, appointmentRes);
    }
  );
};
