/*jslint node: true, unparam: true */
'use strict';

var companies = require('../controllers/companies'),
  conn = require('../controllers/connections'),
  constants = require('../controllers/constants'),
  express = require('express');

conn.setEnv('development');

exports.list = function (test) {
  test.expect(3);
  companies.list(
    {query: {count: 0}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].companyname !== undefined, "property COMPANYNAME not found");
        test.done();
      }
    }
  );
};

exports.get = function (test) {
  test.expect(89);
  companies.get(
    {
      params: {id: 25589},
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
        test.ok(result.reg_id !== undefined, "property REG_ID not found");
        test.ok(result.vat_id !== undefined, "property vat_id not found");
        test.ok(result.company_name !== undefined, "property company_name not found");
        test.ok(result.company_group !== undefined, "property company_group not found");
        test.ok(result.address_tag_1 !== undefined, "property address_tag_1 not found");
        test.ok(result.address_street_1 !== undefined, "property address_street_1 not found");
        test.ok(result.address_city_1 !== undefined, "property address_city_1 not found");
        test.ok(result.address_zip_1 !== undefined, "property address_zip_1 not found");
        test.ok(result.address_region_1 !== undefined, "property address_region_1 not found");
        test.ok(result.phone_1_1 !== undefined, "property phone_1_1 not found");
        test.ok(result.phone_1_1_tag !== undefined, "property phone_1_1_tag not found");
        test.ok(result.phone_1_2 !== undefined, "property phone_1_2 not found");
        test.ok(result.phone_1_2_tag !== undefined, "property phone_1_2_tag not found");
        test.ok(result.phone_1_3 !== undefined, "property phone_1_3 not found");
        test.ok(result.phone_1_3_tag !== undefined, "property phone_1_3_tag not found");
        test.ok(result.email_1_1 !== undefined, "property email_1_1 not found");
        test.ok(result.email_1_1_tag !== undefined, "property email_1_1_tag not found");
        test.ok(result.email_1_2 !== undefined, "property email_1_2 not found");
        test.ok(result.email_1_2_tag !== undefined, "property email_1_2_tag not found");
        test.ok(result.email_1_3 !== undefined, "property email_1_3 not found");
        test.ok(result.email_1_3_tag !== undefined, "property email_1_3_tag not found");
        test.ok(result.fax_1_1 !== undefined, "property fax_1_1 not found");
        test.ok(result.fax_1_1_tag !== undefined, "property fax_1_1_tag not found");
        test.ok(result.fax_1_2 !== undefined, "property fax_1_2 not found");
        test.ok(result.fax_1_2_tag !== undefined, "property fax_1_2_tag not found");
        test.ok(result.address_tag_2 !== undefined, "property address_tag_2 not found");
        test.ok(result.address_street_2 !== undefined, "property address_street_2 not found");
        test.ok(result.address_city_2 !== undefined, "property address_city_2 not found");
        test.ok(result.address_zip_2 !== undefined, "property address_zip_2 not found");
        test.ok(result.address_region_2 !== undefined, "property address_region_2 not found");
        test.ok(result.phone_2_1 !== undefined, "property phone_2_1 not found");
        test.ok(result.phone_2_1_tag !== undefined, "property phone_2_1_tag not found");
        test.ok(result.phone_2_2 !== undefined, "property phone_2_2 not found");
        test.ok(result.phone_2_2_tag !== undefined, "property phone_2_2_tag not found");
        test.ok(result.phone_2_3 !== undefined, "property phone_2_3 not found");
        test.ok(result.phone_2_3_tag !== undefined, "property phone_2_3_tag not found");
        test.ok(result.email_2_1 !== undefined, "property email_2_1 not found");
        test.ok(result.email_2_1_tag !== undefined, "property email_2_1_tag not found");
        test.ok(result.email_2_2 !== undefined, "property email_2_2 not found");
        test.ok(result.email_2_2_tag !== undefined, "property email_2_2_tag not found");
        test.ok(result.email_2_3 !== undefined, "property email_2_3 not found");
        test.ok(result.email_2_3_tag !== undefined, "property email_2_3_tag not found");
        test.ok(result.fax_2_1 !== undefined, "property fax_2_1 not found");
        test.ok(result.fax_2_1_tag !== undefined, "property fax_2_1_tag not found");
        test.ok(result.fax_2_2 !== undefined, "property fax_2_2 not found");
        test.ok(result.fax_2_2_tag !== undefined, "property fax_2_2_tag not found");
        test.ok(result.address_tag_3 !== undefined, "property address_tag_3 not found");
        test.ok(result.address_street_3 !== undefined, "property address_street_3 not found");
        test.ok(result.address_city_3 !== undefined, "property address_city_3 not found");
        test.ok(result.address_zip_3 !== undefined, "property address_zip_3 not found");
        test.ok(result.address_region_3 !== undefined, "property address_region_3 not found");
        test.ok(result.phone_3_1 !== undefined, "property phone_3_1 not found");
        test.ok(result.phone_3_1_tag !== undefined, "property phone_3_1_tag not found");
        test.ok(result.phone_3_2 !== undefined, "property phone_3_2 not found");
        test.ok(result.phone_3_2_tag !== undefined, "property phone_3_2_tag not found");
        test.ok(result.phone_3_3 !== undefined, "property phone_3_3 not found");
        test.ok(result.phone_3_3_tag !== undefined, "property phone_3_3_tag not found");
        test.ok(result.email_3_1 !== undefined, "property email_3_1 not found");
        test.ok(result.email_3_1_tag !== undefined, "property email_3_1_tag not found");
        test.ok(result.email_3_2 !== undefined, "property email_3_2 not found");
        test.ok(result.email_3_2_tag !== undefined, "property email_3_2_tag not found");
        test.ok(result.email_3_3 !== undefined, "property email_3_3 not found");
        test.ok(result.email_3_3_tag !== undefined, "property email_3_3_tag not found");
        test.ok(result.fax_3_1 !== undefined, "property fax_3_1 not found");
        test.ok(result.fax_3_1_tag !== undefined, "property fax_3_1_tag not found");
        test.ok(result.fax_3_2 !== undefined, "property fax_3_2 not found");
        test.ok(result.fax_3_2_tag !== undefined, "property fax_3_2_tag not found");
        test.ok(result.website_1 !== undefined, "property website_1 not found");
        test.ok(result.website_2 !== undefined, "property website_2 not found");
        test.ok(result.website_3 !== undefined, "property website_3 not found");
        test.ok(result.facebook_1 !== undefined, "property facebook_1 not found");
        test.ok(result.google_1 !== undefined, "property google_1 not found");
        test.ok(result.twitter_1 !== undefined, "property twitter_1 not found");
        test.ok(result.category !== undefined, "property category not found");
        test.ok(result.subcategory !== undefined, "property subcategory not found");
        test.ok(result.address_country_1 !== undefined, "property address_country_1 not found");
        test.ok(result.address_country_2 !== undefined, "property address_country_2 not found");
        test.ok(result.address_country_3 !== undefined, "property address_country_3 not found");
        test.ok(result.facebook_2 !== undefined, "property facebook_2 not found");
        test.ok(result.google_2 !== undefined, "property google_2 not found");
        test.ok(result.twitter_2 !== undefined, "property twitter_2 not found");
        test.ok(result.facebook_3 !== undefined, "property facebook_3 not found");
        test.ok(result.google_3 !== undefined, "property google_3 not found");
        test.ok(result.twitter_3 !== undefined, "property twitter_3 not found");
        test.ok(result.rating !== undefined, "property rating not found");
        test.ok(result.country_1_name !== undefined, "property COUNTRY_1_NAME not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
  var id = 999999999;
  companies.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        reg_id: null,
        vat_id: null,
        company_name: "TEST" + Math.random(),
        company_group: null,
        address_tag_1: "Address1",
        address_street_1: "Praha",
        address_city_1: "bn",
        address_zip_1: "256 01",
        address_region_1: "Praha",
        phone_1_1: "777846191",
        phone_1_1_tag: "df",
        phone_1_2: "+420 777 846 191",
        phone_1_2_tag: "prace",
        phone_1_3: null,
        phone_1_3_tag: null,
        email_1_1: "kjhkjhkjhd@kjk.org",
        email_1_1_tag: null,
        email_1_2: null,
        email_1_2_tag: "sfdsdf",
        email_1_3: null,
        email_1_3_tag: null,
        fax_1_1: null,
        fax_1_1_tag: null,
        fax_1_2: null,
        fax_1_2_tag: null,
        address_tag_2: "asdfaf",
        address_street_2: null,
        address_city_2: null,
        address_zip_2: null,
        address_region_2: null,
        phone_2_1: null,
        phone_2_1_tag: null,
        phone_2_2: null,
        phone_2_2_tag: "dsa",
        phone_2_3: null,
        phone_2_3_tag: null,
        email_2_1: null,
        email_2_1_tag: null,
        email_2_2: null,
        email_2_2_tag: null,
        email_2_3: null,
        email_2_3_tag: null,
        fax_2_1: null,
        fax_2_1_tag: null,
        fax_2_2: null,
        fax_2_2_tag: null,
        address_tag_3: null,
        address_street_3: null,
        address_city_3: null,
        address_zip_3: null,
        address_region_3: null,
        phone_3_1: null,
        phone_3_1_tag: null,
        phone_3_2: null,
        phone_3_2_tag: null,
        phone_3_3: null,
        phone_3_3_tag: null,
        email_3_1: null,
        email_3_1_tag: null,
        email_3_2: null,
        email_3_2_tag: null,
        email_3_3: null,
        email_3_3_tag: null,
        fax_3_1: null,
        fax_3_1_tag: null,
        fax_3_2: null,
        fax_3_2_tag: null,
        website_1: null,
        website_2: null,
        website_3: null,
        facebook_1: null,
        google_1: null,
        twitter_1: "www.twitter.com/twitter",
        category: null,
        subcategory: null,
        address_country_1: "6",
        address_country_2: null,
        address_country_3: null,
        facebook_2: "face",
        google_2: null,
        twitter_2: null,
        facebook_3: null,
        google_3: null,
        twitter_3: null,
        rating: "3",
        country_1_name: "VI"
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
        companies.get(
          {
            params: {id: id},
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
              test.ok(parseInt(result.id, 10) === id, "post record error");
              companies.delete(
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
  var id = 25589, ran = 'TEST' + Math.random();
  companies.put(
    {
      body: {
        id: id,
        reg_id: null,
        vat_id: null,
        company_name: "AAAKočárky-51586",
        company_group: null,
        address_tag_1: ran,
        address_street_1: "Praha",
        address_city_1: "bn",
        address_zip_1: "256 01",
        address_region_1: "Praha",
        phone_1_1: "777846191",
        phone_1_1_tag: "df",
        phone_1_2: "+420 777 846 191",
        phone_1_2_tag: "prace",
        phone_1_3: null,
        phone_1_3_tag: null,
        email_1_1: "kjhkjhkjhd@kjk.org",
        email_1_1_tag: null,
        email_1_2: null,
        email_1_2_tag: "sfdsdf",
        email_1_3: null,
        email_1_3_tag: null,
        fax_1_1: null,
        fax_1_1_tag: null,
        fax_1_2: null,
        fax_1_2_tag: null,
        address_tag_2: "asdfaf",
        address_street_2: null,
        address_city_2: null,
        address_zip_2: null,
        address_region_2: null,
        phone_2_1: null,
        phone_2_1_tag: null,
        phone_2_2: null,
        phone_2_2_tag: "dsa",
        phone_2_3: null,
        phone_2_3_tag: null,
        email_2_1: null,
        email_2_1_tag: null,
        email_2_2: null,
        email_2_2_tag: null,
        email_2_3: null,
        email_2_3_tag: null,
        fax_2_1: null,
        fax_2_1_tag: null,
        fax_2_2: null,
        fax_2_2_tag: null,
        address_tag_3: null,
        address_street_3: null,
        address_city_3: null,
        address_zip_3: null,
        address_region_3: null,
        phone_3_1: null,
        phone_3_1_tag: null,
        phone_3_2: null,
        phone_3_2_tag: null,
        phone_3_3: null,
        phone_3_3_tag: null,
        email_3_1: null,
        email_3_1_tag: null,
        email_3_2: null,
        email_3_2_tag: null,
        email_3_3: null,
        email_3_3_tag: null,
        fax_3_1: null,
        fax_3_1_tag: null,
        fax_3_2: null,
        fax_3_2_tag: null,
        website_1: null,
        website_2: null,
        website_3: null,
        facebook_1: null,
        google_1: null,
        twitter_1: "www.twitter.com/twitter",
        category: null,
        subcategory: null,
        address_country_1: "6",
        address_country_2: null,
        address_country_3: null,
        facebook_2: "face",
        google_2: null,
        twitter_2: null,
        facebook_3: null,
        google_3: null,
        twitter_3: null,
        rating: "3",
        country_1_name: "VI"
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
        companies.get(
          {
            params: {id: id},
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
              test.equal(result.address_tag_1, ran, "put record error");
              test.done();
            }
          }
        );
      }
    }
  );
};

exports.delete = function (test) {
  var id = 999999999;
  companies.post(
    {
      signedCookies: {auth_token: 'TESTOVACITOKEN'},
      body: {
        id: id,
        company_name: "TEST" + Math.random()
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
        companies.delete(
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
                }
              };
            }
          },
          {
            json: function (result) {
              companies.get(
                {
                  params: {id: id},
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
              test.equal(result, constants.OK, "delete record error");
            }
          }
        );
      }
    }
  );
};

exports.exists = function (test) {
  var req = {};
  req = {
    signedCookies: {auth_token: 'TESTOVACITOKEN'},
    params: {id: 999999999},
    body: {id: 999999999, company_name: 'test'},
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
  }

  companies.delete(
    req,
    {
      json: function (result) {
        companies.post(
          req,
          {
            json: function (result) {
              companies.exists(
                req,
                {}
              ).then(
                function (result) {
                  test.ok(result.exists, "exists record error");
                  companies.delete(
                    req,
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
    }
  );
};

exports.search = function (test) {
  companies.search(
    {
      query: {},
      params: {search: 'notia'}
    },
    {
      json: function (result) {
        test.ok(result !== undefined && result !== null && JSON.stringify(result) !== '{}', "empty record");
        test.done();
      }
    }
  );
};

exports.salesPipeline = function (test) {
  companies.salesPipeline(
    {params: {id: 1}},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property ID not found");
        test.ok(result[0].stageId !== undefined, "property stageId not found");
        test.done();
      }
    }
  );
};

exports.smartInsert = function (test) {
  var tempId, testCompany = [];
  testCompany[0] = {
    id: null,
    name: 'TESTING COMPANY' + Math.random()
  };
  companies.smartInsert(
    {signedCookies: {auth_token: 'TESTOVACITOKEN'}},
    {},
    {company: testCompany},
    {}
  ).then(
    function (result) {
      tempId = result.id;
      test.ok(tempId > 0, "smartInsert error");
      companies.delete(
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

exports.searchGlobal = function (test) {
  companies.searchGlobal(
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

exports.companyOpportunities = function (test) {
  companies.companyOpportunities(
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
        test.ok(result[0].id !== undefined, "property ID not found");
        test.done();
      }
    }
  );
};
