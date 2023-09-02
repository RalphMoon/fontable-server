const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");

const User = require("../models/User.model");
const Project = require("../models/Project.model");
const { connectDB, disconnectDB } = require("../configs/memorydb.config");

describe("Project Controller Test Suite", () => {
  beforeAll(() => connectDB());
  afterAll(() => disconnectDB());

  describe("GET `/users/:user_id/projects/:project_id`", () => {
    let userId;
    let projectId;

    beforeEach(async () => {
      const user = new User({
        uid: "test-uid",
        name: "test",
        email: "test@example.com",
      });

      await user.save();
      userId = user.uid;

      const project = new Project({
        name: "Test Project",
        createdBy: user._id,
      });

      await project.save();
      user.projects.push(project._id);
      await user.save();
      projectId = project._id;
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Project.deleteMany({});
    });

    it("should return the project", (done) => {
      request(app)
        .get(`/users/${userId}/projects/${projectId}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty("result");
          expect(res.body.result.unicodePaths).toHaveLength(94);
          return done();
        });
    });

    it("should return a 401 error for an invalid user_id", (done) => {
      request(app)
        .get(`/users/invalid-user-id/projects/${projectId}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "You are not authorized to access this resource."
          );
          return done();
        });
    });

    it("should return a 404 error for an invalid project_id", (done) => {
      request(app)
        .get(`/users/${userId}/projects/invalid-project-id`)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "The specified project_id is invalid."
          );

          return done();
        });
    });
  });
});
