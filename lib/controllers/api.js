/*jslint node: true, unparam: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_REST_API
 */

/**
 * @namespace __Server_REST_API
 * @author Martin Boháč
 */

var flow = require('./flow-node')('upload');

/**
 * @memberof __Server_REST_API
 * @method
 * @name getUpload
 * @description upload file to server GET
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.getUpload = function (req, res) {
  flow.get(req, function (status, filename, original_filename, identifier) {
    console.log('GET', status);
    res.send(200, (status === 'found' ? 200 : 404));
  });
};

/**
 * @memberof __Server_REST_API
 * @method
 * @name postUpload
 * @description upload file to server POST
 * @returns void
 */
exports.postUpload = function (req, res) {
  flow.post(req, function (status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier);
    res.send(200, {
      // NOTE: Uncomment this funciton to enable cross-domain request.
      //'Access-Control-Allow-Origin': '*'
    });
  });
};

/**
 * @memberof __Server_REST_API
 * @method
 * @name getDownload
 * @description download file via Flow
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.getDownload = function (req, res) {
  flow.write(req.params.identifier, res);
};
