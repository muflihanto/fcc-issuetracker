"use strict";

const { ObjectId } = require("mongodb");

/**
 * @param {import('express').Express} app - Express app instance
 * @param {import('mongodb').Db} myDataBase - Database instance
 */
module.exports = function (app, myDataBase) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const fields = ["_id", "issue_title", "issue_text", "assigned_to", "status_text", "created_by", "open", "created_on", "updated_on"];
      const queries = Object.fromEntries(Object.entries(req.query).filter(([key, value]) => fields.includes(key) && key !== "open" && value));

      if (queries._id !== undefined) {
        queries._id = new ObjectId(queries._id);
      }
      if (queries.open === "" || queries.open === "true") {
        queries.open = true;
      } else if (queries.open === "false") {
        queries.open = false;
      }

      const collection = myDataBase.collection(req.params.project);
      collection
        .find(queries)
        .toArray()
        .then((docs) => {
          res.json(docs);
        })
        .catch((er) => {
          res.send(er);
        });
    })

    .post(function (req, res) {
      const collection = myDataBase.collection(req.params.project);
      const { issue_title, issue_text, assigned_to = "", status_text = "", created_by } = req.body;
      const defaultTime = new Date().toJSON();

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
        res.send({ error: "required field(s) missing" });
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
