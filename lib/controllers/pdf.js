/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 03.06.2014.
 */
/*jslint node: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_PDF
 */

/**
 * @namespace __Server_PDF
 * @author Martin Boháč
 */

var PDFDocument = require('pdfkit'),
  fs = require('fs');

exports.create = function (req, res) {
  var doc = new PDFDocument(),
    lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit' +
      'purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere' +
      'cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia.' +
      '  Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus' +
      'nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus' +
      'ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae' +
      'tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean' +
      'velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed' +
      'vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed' +
      'neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum' +
      'ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;';
  doc.pipe(fs.createWriteStream('app/download/file.pdf'));
  doc
    .fontSize(18)
    .text('Hello world!', 100, 100)
    .fontSize(10)
    .text(lorem, {columns: 3, columnGap: 15, height: 100, width: 465, align: 'justify'});
  doc.end();
  //res.redirect('download/file.pdf');
  //res.sendfile('app/download/file.pdf');
  res.download('app/download/file.pdf');
};
