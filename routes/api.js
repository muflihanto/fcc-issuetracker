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
      const queries = Object.fromEntries(Object.entries(req.query).filter(([key, value]) => fields.includes(key) && (key === "open" || (key !== "open" && value !== ""))));

      if (queries._id !== undefined) {
        queries._id = new ObjectId(queries._id);
      }
      switch (queries.open) {
        case "":
        case "true":
          queries.open = true;
          break;
        case "false":
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
      if (req.body._id === undefined) return res.send({ error: "missing _id" });

      const collection = myDataBase.collection(req.params.project);
      let { _id = "", issue_title = "", issue_text = "", created_by = "", assigned_to = "", status_text = "", open = "" } = req.body;

      switch (open) {
        case "true":
          open = true;
          break;
        case "false":
          open = false;
          break;
        default:
          open = "";
      }

      const updatedIssue = Object.fromEntries(Object.entries({ issue_title, issue_text, created_by, assigned_to, status_text, open }).filter(([_, value]) => value !== ""));

      if (Object.keys(updatedIssue).length === 0) return res.send({ error: "no update field(s) sent", _id: _id });

      const noUpdate = () => {
        res.send({ error: "could not update", _id: _id });
      };

      // Check for invalid id input
      try {
        _id = new ObjectId(_id);
      } catch {
        return noUpdate();
      }

      collection
        .findOneAndUpdate(
          { _id },
          {
            $set: {
              ...updatedIssue,
              updated_on: new Date().toJSON(),
            },
          }
        )
        .then((doc) => {
          if (doc !== null) {
            res.send({ result: "successfully updated", _id: doc._id });
          } else {
            noUpdate();
          }
        })
        .catch((er) => {
          noUpdate();
        });
    })

    .delete(function (req, res) {
      if (req.body._id === undefined) return res.send({ error: "missing _id" });

      const collection = myDataBase.collection(req.params.project);
      let _id;
      const noDelete = () => {
        res.send({ error: "could not delete", _id: req.body._id });
      };
      try {
        _id = new ObjectId(req.body._id);
      } catch {
        return noDelete();
      }
      collection
        .deleteOne({ _id })
        .then((result) => {
          if (result.deletedCount === 1) {
            res.send({ result: "successfully deleted", _id: _id });
          } else {
            noDelete();
          }
        })
        .catch(() => {
          noDelete();
        });
    });
};
