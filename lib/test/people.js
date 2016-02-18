/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  people = require('../controllers/people'),
  attachments = require('../controllers/attachments');

conn.setEnv('development');

exports.list = function (test) {
  people.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].first_name !== undefined, "property FIRST_NAME not found");
        test.done();
      }
    }
  );
};

exports.listSearch = function (test) {
  people.listSearch(
    {
      query: {searchStr: 'Kolomazník'},
      params: {search: null}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.listWithoutTeam = function (test) {
  people.listWithoutTeam(
    {
      query: {searchStr: 'Kolomazník'},
      params: {search: null}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.searchStr = function (test) {
  people.searchStr(
    {
      params: {str: 'boháč'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.get = function (test) {
  people.get(
    {
      params: {id: 51330},
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
        test.ok(result.title !== undefined, "property TITLE not found");
        test.ok(result.first_name !== undefined, "property FIRST_NAME not found");
        test.ok(result.middle_name !== undefined, "property MIDDLE_NAME not found");
        test.ok(result.last_name !== undefined, "property LAST_NAME not found");
        test.ok(result.suffix !== undefined, "property SUFFIX not found");
        test.ok(result.nickname !== undefined, "property NICKNAME not found");
        test.ok(result.gender !== undefined, "property GENDER not found");
        test.ok(result.birthday !== undefined, "property BIRTHDAY not found");
        test.ok(result.anniversary !== undefined, "property ANNIVERSARY not found");
        test.ok(result.anniversary_name !== undefined, "property ANNIVERSARY_NAME not found");
        test.ok(result.spouse !== undefined, "property SPOUSE not found");
        test.ok(result.children !== undefined, "property CHILDREN not found");
        test.ok(result.hobbies !== undefined, "property HOBBIES not found");
        test.ok(result.company_name !== undefined, "property COMPANY_NAME not found");
        test.ok(result.position !== undefined, "property POSITION not found");
        test.ok(result.role !== undefined, "property ROLE not found");
        test.ok(result.work_since !== undefined, "property WORK_SINCE not found");
        test.ok(result.manager_name !== undefined, "property MANAGER_NAME not found");
        test.ok(result.assistant_name !== undefined, "property ASSISTANT_NAME not found");
        test.ok(result.home_addr_street !== undefined, "property HOME_ADDR_STREET not found");
        test.ok(result.home_addr_city !== undefined, "property HOME_ADDR_CITY not found");
        test.ok(result.home_addr_region !== undefined, "property HOME_ADDR_REGION not found");
        test.ok(result.home_addr_zip !== undefined, "property HOME_ADDR_ZIP not found");
        test.ok(result.home_addr_country !== undefined, "property HOME_ADDR_COUNTRY not found");
        test.ok(result.email !== undefined, "property EMAIL not found");
        test.ok(result.email2 !== undefined, "property EMAIL2 not found");
        test.ok(result.mobile_phone !== undefined, "property MOBILE_PHONE not found");
        test.ok(result.business_phone !== undefined, "property BUSINESS_PHONE not found");
        test.ok(result.home_phone !== undefined, "property HOME_PHONE not found");
        test.ok(result.assistant_phone !== undefined, "property ASSISTANT_PHONE not found");
        test.ok(result.other_phone !== undefined, "property OTHER_PHONE not found");
        test.ok(result.fax !== undefined, "property FAX not found");
        test.ok(result.skype !== undefined, "property SKYPE not found");
        test.ok(result.other_im !== undefined, "property OTHER_IM not found");
        test.ok(result.twitter !== undefined, "property TWITTER not found");
        test.ok(result.facebook !== undefined, "property FACEBOOK not found");
        test.ok(result.google_plus !== undefined, "property GOOGLE_PLUS not found");
        test.ok(result.linkedin !== undefined, "property LINKEDIN not found");
        test.done();
      }
    }
  );
};

exports.put = function (test) {
  var tempId = 36, ran = 'TEST' + Math.random();
  people.put(
    {
      params: {id: tempId},
      body: {
        title: 'pí',
        first_name: 'xJana',
        middle_name: null,
        last_name: 'xTesterová',
        suffix: 'Dr.',
        nickname: null,
        gender: null,
        birthday: null,
        anniversary: null,
        anniversary_name: null,
        spouse: 'Jarda',
        children: 'Pepa, Milada, Karel, Ferda',
        hobbies: ran,
        company_name: null,
        position: null,
        role: null,
        work_since: null,
        manager_name: null,
        assistant_name: null,
        home_addr_street: null,
        home_addr_city: null,
        home_addr_region: null,
        home_addr_zip: null,
        home_addr_country: null,
        email: 'testerova@seznam.cz',
        email2: null,
        mobile_phone: '667 123 552',
        business_phone: null,
        home_phone: null,
        assistant_phone: '777 548 996',
        other_phone: null,
        fax: null,
        skype: null,
        other_im: null,
        twitter: null,
        facebook: null,
        google_plus: null,
        linkedin: null
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
          },
          isNull: function () {
            test.throws({}, 'assert', msg);
          }
        };
      }
    },
    {
      json: function (result) {
        people.get(
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
              test.equal(result.hobbies, ran, "put record error");
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
  people.post(
    {
      body: {
        title: 'pí',
        first_name: 'xJana',
        middle_name: null,
        last_name: 'xTesterová',
        suffix: 'Dr.',
        nickname: null,
        gender: null,
        birthday: null,
        anniversary: null,
        anniversary_name: null,
        spouse: 'Jarda',
        children: 'Pepa, Milada, Karel, Ferda',
        hobbies: null,
        company_name: null,
        position: null,
        role: null,
        work_since: null,
        manager_name: null,
        assistant_name: null,
        home_addr_street: null,
        home_addr_city: null,
        home_addr_region: null,
        home_addr_zip: null,
        home_addr_country: null,
        email: 'testerova@seznam.cz',
        email2: null,
        mobile_phone: '667 123 552',
        business_phone: null,
        home_phone: null,
        assistant_phone: '777 548 996',
        other_phone: null,
        fax: null,
        skype: null,
        other_im: null,
        twitter: null,
        facebook: null,
        google_plus: null,
        linkedin: null
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
        people.get(
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
              test.ok(result.first_name === 'xJana', "post record error");
              test.ok(result.last_name === 'xTesterová', "post record error");
              people.delete(
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

exports.delete = function (test) {
  var tempId;
  people.post(
    {
      body: {
        title: 'pí',
        first_name: 'Jan',
        last_name: 'Testerov'
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
        people.delete(
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
              people.get(
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
                    test.equal(result.id, null, "delete record error");
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

exports.companyPeople = function (test) {
  people.companyPeople(
    {
      query: {
        count: 0,
        id: 1
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
        test.ok(result.length > 0, "empty list");
        test.done();
      }
    }
  );
};

exports.homeAddress = function (test) {
  people.homeAddress(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) === '{"id":"22","home_addr_street":null,"home_addr_city":null,"home_addr_zip":null,"home_addr_country":null}', 'data is not valid');
        test.done();
      }
    }
  );
};

exports.businessAddress = function (test) {
  people.businessAddress(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(JSON.stringify(result) === '{"id":"22","business_addr_street":null,"business_addr_city":null,"business_addr_zip":null,"business_addr_country":null}', 'data is not valid');
        test.done();
      }
    }
  );
};

exports.latestAddress = function (test) {
  people.latestAddress(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'}
    },
    {
      json: function (result) {
        test.ok(result.length > 0, 'data is loaded');
        test.ok(typeof result[0] === 'object', 'id exists');
        test.done();
      }
    }
  );
};

exports.search = function (test) {
  people.search(
    {
      params: {search: 'rákos'},
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
        test.done();
      }
    }
  );
};

exports.smartInsert = function (test) {
  var tempId, testPerson = [];
  testPerson[0] = {
    id: null,
    name: 'TESTING PERSON' + Math.random()
  };
  people.smartInsert(
    {body: {testId: null}},
    {},
    {person: testPerson},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      test.ok(tempId > 0, "smartInsert error");
      people.delete(
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
          json: function () {
            test.done();
          }
        }
      );
    }
  );
};

exports.loginUser = function (test) {
  people.loginUser(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.id !== undefined, "property id not found");
        test.ok(result.last_name !== undefined, "property last_name not found");
        test.done();
      }
    }
  );
};

exports.loginUserEmails = function (test) {
  people.loginUserEmails(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      validationErrors: function () {
        return null;
      }
    },
    {
      json: function (result) {
        test.ok(result.email !== undefined, "property email not found");
        test.ok(result.email2 !== undefined, "property email2 not found");
        test.done();
      }
    }
  );
};

exports.teamMembersList = function (test) {
  people.teamMembersList(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].first_name !== undefined, "property FIRST_NAME not found");
        test.done();
      }
    }
  );
};

exports.searchGlobal = function (test) {
  people.searchGlobal(
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

exports.searchGlobalTeam = function (test) {
  people.searchGlobalTeam(
    {
      params: {str: 'boháč'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
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
  people.uploadPicture(
    {
      files: files,
      params: {
        table: 'PEOPLE',
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

exports.anniversaryCount = function (test) {
  people.anniversaryCount(
    {},
    {
      json: function (result) {
        test.ok(result.message.type === 'SUCCESS', "anniversaryCount error");
        test.done();
      }
    }
  );
};

exports.anniversaryToday = function (test) {
  people.anniversaryToday(
    {},
    {
      json: function (result) {
        test.ok(result.records, "anniversaryToday error");
        test.done();
      }
    }
  );
};

exports.anniversaryTomorrow = function (test) {
  people.anniversaryTomorrow(
    {},
    {
      json: function (result) {
        test.ok(result.records, "anniversaryTomorrow error");
        test.done();
      }
    }
  );
};

exports.anniversaryAfterTomorrow = function (test) {
  people.anniversaryAfterTomorrow(
    {},
    {
      json: function (result) {
        test.ok(result.records, "anniversaryAfterTomorrow error");
        test.done();
      }
    }
  );
};

exports.anniversaryNextDays = function (test) {
  people.anniversaryNextDays(
    {},
    {
      json: function (result) {
        test.ok(result.records, "anniversaryNextDays error");
        test.done();
      }
    }
  );
};
