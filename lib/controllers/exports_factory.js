/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 08.01.2015.
 */

/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file exports_factory
 * @fileOverview __Server_TOOLS_API_ExportsFactory
 */

/**
 * @namespace __Server_TOOLS_API_ExportsFactory
 * @author Martin Boháč
 */

var nodeExcel = require('excel-export');

/**
 * @memberof __Server_REST_API_Companies
 * @method
 * @name getContent
 * @description content for export
 * @param data {Object} data for export
 * @returns String
 */
exports.getContent = function (data) {
  var conf = {}, result, tmp;
  try {
    conf.stylesXmlFile = "excel_styles.xml";
    conf.cols = [
      {
        caption: 'string',
        type: 'string',
        beforeCellWrite: function (row, cellData) {
          return cellData.toUpperCase();
        },
        width: 28.7109375
      },
      {
        caption: 'date',
        type: 'date',
        beforeCellWrite: function () {
          var originDate = new Date(Date.UTC(1899, 11, 30));
          return function (row, cellData, eOpt) {
            if (eOpt.rowNum % 2) {
              eOpt.styleIndex = 1;
            } else {
              eOpt.styleIndex = 2;
            }
            if (cellData === null) {
              eOpt.cellType = 'string';
              tmp = 'N/A';
            } else {
              tmp = (cellData - originDate) / (24 * 60 * 60 * 1000);
            }
            return tmp;
          };
        }()
      },
      {
        caption: 'bool',
        type: 'bool'
      },
      {
        caption: 'number',
        type: 'number'
      }
    ];
    conf.rows = [
      ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
      ["e", new Date(2012, 4, 1), false, 2.7182],
      ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
      ["null date", null, true, 1.414]
    ];
    result = nodeExcel.execute(conf);
    return result;
  } catch (e) {
    console.log(e);
  }
};
