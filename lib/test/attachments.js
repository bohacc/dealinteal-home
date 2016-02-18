/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  attachments = require('../controllers/attachments'),
  constants = require('../controllers/constants');

conn.setEnv('development');

exports.list = function (test) {
  attachments.list(
    {query: {
      count: 0,
      table: constants.ATTACHMENTS_TYPES.ANY,
      tableId: 999999
    }},
    {
      json: function (result) {
        test.ok(result.length > 0, "empty list");
        test.ok(result[0].id !== undefined, "property id found");
        test.ok(result[0].file !== undefined, "property file not found");
        test.ok(result[0].description !== undefined, "property description not found");
        test.done();
      }
    }
  );
};

exports.post = function (test) {
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
  attachments.post(
    {
      files: files,
      params: {
        table: 'PEOPLE',
        tableId: 7
      },
      body: {data: ''}
    }
  ).then(
    function (result) {
      id = result.id;
      test.ok(result !== undefined && result !== null && id !== 0, "post file error");
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
  );
};

/*
exports.get = function (test) {
  attachments.get(
    {params: {id: 15}},
    {
      json: function (result) {
        console.log(result);
        test.ok(JSON.stringify(result) !== '{}', "get file error");
        test.done();
      }
    }
  );
};
*/
