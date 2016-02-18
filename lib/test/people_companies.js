/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  people_companies = require('../controllers/people_companies'),
  people = require('../controllers/people'),
  peopleId = 7,
  peopleId2 = 6,
  companyId = 393729,
  newCompanyId = 3;

conn.setEnv('development');
exports.exists = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      people_companies.exists(req, res).then(
        function (result) {
          test.ok(result.exists, "exists record error");
          test.done();
        }
      );
    }
  );
};

exports.insert = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.exists(req, res);
    }
  ).then(
    function (result) {
      test.ok(!result.exists, "insert record error - record exists");
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      people_companies.exists(req, res).then(
        function (result) {
          test.ok(result.exists, "insert record error");
          test.done();
        }
      );
    }
  );
};

exports.delete = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      return people_companies.exists(req, res);
    }
  ).then(
    function (result) {
      test.ok(result.exists, "delete record error after insert");
      return people_companies.delete(req, res);
    }
  ).then(
    function () {
      people_companies.exists(req, res).then(
        function (result) {
          test.ok(!result.exists, "delete record error");
          test.done();
        }
      );
    }
  );
};

exports.updateCompany = function (test) {
  var req = {}, req2 = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId};
  req2.body = {people_id: peopleId, companies_id: newCompanyId};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.delete(req2, res);
    }
  ).then(
    function () {
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      people.get(
        {
          params: {id: peopleId},
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
            test.equal(result.companies_id, companyId, "updateCompany error in companies_id");
            req.body = {people_id: peopleId, companies_id: companyId, newCompanyId: newCompanyId};// + datumy ?
            people_companies.updateCompany(req, res).then(
              function () {
                people.get(
                  {
                    params: {id: peopleId},
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
                      test.equal(result.companies_id, newCompanyId, "updateCompany error");
                      people_companies.delete(req2, res).then(
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
        }
      );
    }
  );
};

exports.updatePosition = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId, position_id: 1};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      people.get(
        {
          params: {id: peopleId},
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
            test.equal(result.position_id, 1, "updatePosition error in position_id");
            req.body = {people_id: peopleId, companies_id: companyId, position_id: 6};
            people_companies.updatePosition(req, res).then(
              function () {
                people.get(
                  {
                    params: {id: peopleId},
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
                      test.equal(result.position_id, 6, "updatePosition error");
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
};

exports.updateRole = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId, role_id: 2};
  req.assert = function (arg, msg) {
    return {
      notEmpty: function () {
        test.throws({}, 'assert', msg);
      }
    };
  };
  people_companies.delete(req, res).then(
    function () {
      return people_companies.insert(req, res);
    }
  ).then(
    function () {
      people.get(
        {
          params: {id: peopleId},
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
            test.equal(result.role_id, 2, "updateRole error in role_id");
            req.body = {people_id: peopleId, companies_id: companyId, role_id: 9};
            people_companies.updateRole(req, res).then(
              function () {
                people.get(
                  {
                    params: {id: peopleId},
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
                      test.equal(result.role_id, 9, "updateRole error");
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
};

exports.updateAll = function (test) {
  var req = {}, res = {};
  req.body = {people_id: peopleId, companies_id: companyId};
  people_companies.delete(req, res).then(
    function () {
      return people_companies.exists(req, res);
    }
  ).then(
    function (result) {
      test.ok(!result.exists, "updateAll error - record exists");
      people_companies.updateAll(
        {
          body: {
            people_id: peopleId,
            company_name: 'Notia Informační systémy, spol. s r. o.', // ID=1
//            position: 'Ředitel', // ID=1
            positionBox: [{name: 'Ředitel'}],
//            role: 'Pracuje tu' // ID=2
            roleBox: [{name: 'Pracuje tu'}]
          },
          validationErrors: function () {
            return null;
          },
          assert: function (arg, msg) {
            return {
              notEmpty: function () {
                test.throws({}, 'assert', msg);
              },
              len: function (from, to) {
                return arg.length >= from && arg.length <= to;
              },
              isNull: function () {
                return arg === null;
              }
            };
          }
        },
        {
          json: function () {
            people.get(
              {
                params: {id: peopleId},
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
                  test.equal(result.companies_id, companyId, "updateAll error - companies_id");
                  test.equal(result.position_id, 1, "updateAll error - position_id");
                  test.equal(result.role_id, 2, "updateAll error - role_id");
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

exports.deletePeople = function (test) {
  var reqPerson1 = {}, reqPerson2 = {}, reqPeople = {}, arrPeople = peopleId + ',' + peopleId2, res = {};

  reqPerson1 = {
    body: {people_id: peopleId, companies_id: companyId},
    assert: function (arg, msg) {
      return {
        notEmpty: function () {
          test.throws({}, 'assert', msg);
        }
      };
    }
  }

  reqPerson2 = {
    body: {people_id: peopleId2, companies_id: companyId},
    assert: function (arg, msg) {
      return {
        notEmpty: function () {
          test.throws({}, 'assert', msg);
        }
      };
    }
  }

  reqPeople = {
    params: {people: arrPeople, id: companyId},
    validationErrors: function () {
      return null;
    },
    assert: function (arg, msg) {
      return {
        notEmpty: function () {
          test.throws({}, 'assert', msg);
        },
        isNull: function () {
          test.throws({}, 'assert', msg);
        }
      };
    }
  }

  people_companies.delete(reqPerson1, res).then(
    function () {
      return people_companies.insert(reqPerson1, res);
    }
  ).then(
    function () {
      return people_companies.exists(reqPerson1, res);
    }
  ).then(
    function (result) {
      test.ok(result.exists, "error after insert person1");
      return people_companies.delete(reqPerson2, res);
    }
  ).then(
    function () {
      return people_companies.insert(reqPerson2, res);
    }
  ).then(
    function () {
      return people_companies.exists(reqPerson2, res);
    }
  ).then(
    function (result) {
      test.ok(result.exists, "error after insert person2");
      people_companies.deletePeople(
        reqPeople,
        {
          json: function () {
            people_companies.exists(reqPerson1, res).then(
              function (result) {
                test.ok(!result.exists, "person1 exists");
              }
            ).then(
              function () {
                people_companies.exists(reqPerson2, res).then(
                  function (result) {
                    test.ok(!result.exists, "person2 exists");
                    test.done();
                  }
                );
              }
            );
          }
        }
      );
    }
  );
};
