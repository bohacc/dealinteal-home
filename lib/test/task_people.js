/*jslint node: true, unparam: true */
'use strict';

var conn = require('../controllers/connections'),
  task_people = require('../controllers/task_people');

conn.setEnv('development');

exports.delete = function (test) {
  var taskID = 1, peopleId = 51330;
  task_people.delete(
    {},
    {},
    {taskId: taskID},
    {}
  ).then(
    function () {
      task_people.smartInsert(
        {},
        {},
        {taskId: taskID, peopleId: peopleId},
        {}
      ).then(
        function () {
          task_people.delete(
            {},
            {},
            {taskId: taskID},
            {}
          ).then(
            function () {
              test.done();
            }
          );
        }
      );
    }
  );
};

exports.smartInsert = function (test) {
  var taskID = 1, peopleId = 51330;
  task_people.delete(
    {},
    {},
    {taskId: taskID},
    {}
  ).then(
    function () {
      task_people.smartInsert(
        {},
        {},
        {taskId: taskID, peopleId: peopleId},
        {}
      ).then(
        function (result) {
          test.ok(result.taskId === taskID, "smartInsert error");
          test.ok(result.peopleId === peopleId, "smartInsert error");
          test.done();
        }
      );
    }
  );
};
