/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  aTexts = require('../controllers/texts'), // MUST NOT be defined as texts
  constants = require('../controllers/constants');

conn.setEnv('development');

exports.saveText = function (test) {
  var tempId,
    text = {text: 'něco'},
    texts = {
      tableName: constants.ATTACHMENTS_TYPES.APPOINTMENT,
      tableId: 1
    };
  aTexts.saveText(
    {body: {
      text: text
    }},
    {},
    {texts: texts}
  ).then(
    function (result) {
      console.log(result);
      tempId = result.textId;
      test.ok(tempId > 0, "saveText error");
      aTexts.delete(
        {params: {id: tempId}},
        {
          json: function () {
            console.log('end');
            test.done();
          }
        }
      );
    }
  );
};
