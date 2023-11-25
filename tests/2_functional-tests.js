const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { randomInt } = require("crypto");
const { ObjectId } = require("mongodb");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(5000);
  let url = `/api/issues/api_test_${randomInt(1000, 10000)}`;
  let registeredIssues;
  // Create an issue with every field: POST request to /api/issues/{project}
  test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
    const input = {
      issue_title: "title",
      issue_text: "text",
      assigned_to: "name",
      status_text: "status",
      created_by: "name2",
    };
    chai
      .request(server)
      .keepOpen()
      .post(url)
      .send(input)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result.issue_title, input.issue_title);
        assert.strictEqual(result.issue_text, input.issue_text);
        assert.strictEqual(result.assigned_to, input.assigned_to);
        assert.strictEqual(result.status_text, input.status_text);
        assert.strictEqual(result.created_by, input.created_by);
        assert.strictEqual(result.open, true);
        assert.strictEqual(result.created_on, result.updated_on);
        assert.isString(result._id);
        assert.equal(result._id.length, 24);
        assert.doesNotThrow(() => new ObjectId(result._id));
        done();
      });
  });
  // Create an issue with only required fields: POST request to /api/issues/{project}
  test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
    const input = {
      issue_title: "title-required",
      issue_text: "text-required",
      created_by: "name2-required",
    };
    chai
      .request(server)
      .keepOpen()
      .post(url)
      .send(input)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result.issue_title, input.issue_title);
        assert.strictEqual(result.issue_text, input.issue_text);
        assert.strictEqual(result.created_by, input.created_by);
        assert.strictEqual(result.open, true);
        assert.strictEqual(result.created_on, result.updated_on);
        assert.isString(result._id);
        assert.strictEqual(result._id.length, 24);
        assert.doesNotThrow(() => new ObjectId(result._id));
        done();
      });
  });
  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post(url)
      .send({
        issue_title: "title",
        issue_text: "text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.deepEqual(result, {
          error: "required field(s) missing",
        });
        done();
      });
  });
  // View issues on a project: GET request to /api/issues/{project}
  test("View issues on a project: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get(url)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.isArray(result, "Result is not an array");
        assert.strictEqual(result.length, 2, "Result should contain 2 issue");
        if (result.length > 0) {
          for (const issue of result) {
            assert.isString(issue._id);
            assert.strictEqual(issue._id.length, 24);
            assert.doesNotThrow(() => new ObjectId(issue._id));
            assert.isString(issue.issue_title, issue.issue_title + " is not a string");
            assert.isString(issue.issue_text, issue.issue_text + " is not a string");
            assert.isString(issue.assigned_to, issue.assigned_to + " is not a string");
            assert.isString(issue.status_text, issue.status_text + " is not a string");
            assert.isString(issue.created_by, issue.created_by + " is not a string");
            assert.strictEqual(issue.open, true, issue.open + " is not 'true'");
            assert.isString(issue.created_on, issue.created_on + " is not a string");
            assert.isString(issue.updated_on, issue.updated_on + " is not a string");
          }
        }
        registeredIssues = result;
        done();
      });
  });
  // View issues on a project with one filter: GET request to /api/issues/{project}
  test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get(url + "?issue_title=title-required")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.isArray(result, "Result is not an array");
        assert.strictEqual(result.length, 1, "Result should contain 1 issue");
        assert.isString(result[0]._id);
        assert.strictEqual(result[0]._id.length, 24);
        assert.doesNotThrow(() => new ObjectId(result[0]._id));
        assert.strictEqual(result[0].issue_title, "title-required", result[0].issue_title + " is not 'title-required'");
        assert.strictEqual(result[0].issue_text, "text-required", result[0].issue_text + " is not 'text-required'");
        assert.strictEqual(result[0].created_by, "name2-required", result[0].created_by + " is not 'name2-required'");
        assert.isString(result[0].assigned_to, result[0].assigned_to + " is not a string");
        assert.isString(result[0].status_text, result[0].status_text + " is not a string");
        assert.strictEqual(result[0].open, true, result[0].open + " is not 'true'");
        assert.isString(result[0].created_on, result[0].created_on + " is not a string");
        assert.isString(result[0].updated_on, result[0].updated_on + " is not a string");
        done();
      });
  });
  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get(url + "?issue_title=title&issue_text=text")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.isArray(result, "Result is not an array");
        assert.strictEqual(result.length, 1, "Result should contain 1 issue");
        assert.isString(result[0]._id);
        assert.strictEqual(result[0]._id.length, 24);
        assert.doesNotThrow(() => new ObjectId(result[0]._id));
        assert.strictEqual(result[0].issue_title, "title", result[0].issue_title + " is not 'title'");
        assert.strictEqual(result[0].issue_text, "text", result[0].issue_text + " is not 'text'");
        assert.strictEqual(result[0].created_by, "name2", result[0].created_by + " is not 'name2'");
        assert.strictEqual(result[0].assigned_to, "name", result[0].assigned_to + " is not 'name'");
        assert.strictEqual(result[0].status_text, "status", result[0].status_text + " is not 'status'");
        assert.strictEqual(result[0].open, true, result[0].open + " is not 'true'");
        assert.isString(result[0].created_on, result[0].created_on + " is not a string");
        assert.isString(result[0].updated_on, result[0].updated_on + " is not a string");
        done();
      });
  });
  // Update one field on an issue: PUT request to /api/issues/{project}
  test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
    const _id = registeredIssues.filter((issue) => issue.issue_title === "title")[0]._id;
    chai
      .request(server)
      .keepOpen()
      .put(url)
      .send({
        _id,
        open: "false",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.result, "successfully updated");
        done();
      });
  });
  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    const _id = registeredIssues.filter((issue) => issue.issue_title === "title-required")[0]._id;
    chai
      .request(server)
      .keepOpen()
      .put(url)
      .send({
        _id,
        assigned_to: "assigned_to",
        status_text: "status_text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.result, "successfully updated");
        done();
      });
  });
  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put(url)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result.error, "missing _id");
        done();
      });
  });
  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    const _id = registeredIssues.filter((issue) => issue.issue_title === "title-required")[0]._id;
    chai
      .request(server)
      .keepOpen()
      .put(url)
      .send({ _id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.error, "no update field(s) sent");
        done();
      });
  });
  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    const _id = "an-invalid-id";
    chai
      .request(server)
      .keepOpen()
      .put(url)
      .send({ _id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.error, "could not update");
        done();
      });
  });
  // Delete an issue: DELETE request to /api/issues/{project}
  test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
    const _id = registeredIssues.filter((issue) => issue.issue_title === "title-required")[0]._id;
    chai
      .request(server)
      .keepOpen()
      .delete(url)
      .send({ _id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.result, "successfully deleted");
        done();
      });
  });
  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
    const _id = "an_invalid_id";
    chai
      .request(server)
      .keepOpen()
      .delete(url)
      .send({ _id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result._id, _id, `${result._id} is not equal ${_id}`);
        assert.strictEqual(result.error, "could not delete");
        done();
      });
  });
  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete(url)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const result = JSON.parse(res.text);
        assert.strictEqual(result.error, "missing _id");
        done();
      });
  });
});
