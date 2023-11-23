"use strict";

/**
 * @param {import('express').Express} app - Express app instance
 * @param {import('mongodb').Db} myDataBase - Database instance
 */
module.exports = function (app, myDataBase) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      const collection = myDataBase.collection(req.params.project);
      const { issue_title, issue_text, assigned_to = "", status_text = "", created_by } = req.body;
      const defaultTime = Date.now();

      if (issue_title && issue_text && created_by) {
        const newIssue = {
          issue_title,
          issue_text,
          assigned_to,
          status_text,
          created_by,
          open: true,
          created_on: defaultTime,
          updated_on: defaultTime,
        };
        collection
          .insertOne(newIssue)
          .then((doc) => {
            newIssue._id = doc.insertedId;
            res.json(newIssue);
          })
          .catch((error) => res.send(error));
      } else {
        res.send('Sorry, but "issue_title", "issue_text" and "created_by" are all required');
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
