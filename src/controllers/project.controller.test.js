const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");

const User = require("../models/User.model");
const Project = require("../models/Project.model");
const { connectDB, disconnectDB } = require("../configs/memorydb.config");

describe("Project Controller Test Suite", () => {
  let userId;
  let projectId;

  const createUserAndProject = async () => {
    const user = new User({
      uid: "test-uid",
      name: "test",
      email: "test@example.com",
    });

    await user.save();
    userId = user.uid;

    const project = new Project({ name: "Test Project", createdBy: user._id });

    await project.save();
    user.projects.push(project);
    await user.save();
    projectId = project._id;
  };

  const removeAllUsersAndProjects = async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
  };

  beforeAll(() => connectDB());
  afterAll(() => disconnectDB());

  describe("GET `/users/:user_id/projects", () => {
    beforeEach(() => createUserAndProject());
    afterEach(() => removeAllUsersAndProjects());

    it("should return all projects", (done) => {
      request(app)
        .get(`/users/${userId}/projects`)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty("result");
          expect(Array.isArray(res.body.result)).toBe(true);

          const { projects } = await User.findOne({ uid: userId }).populate({
            path: "projects",
          });

          expect(res.body.result).toHaveLength(projects.length);

          return done(err);
        });
    });

    it("should return a 401 error for an invalid user_id", (done) => {
      request(app)
        .get(`/users/invalid-user-id/projects`)
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
  });

  describe("POST `/users/:user_id/projects", () => {
    beforeEach(async () => {
      const user = new User({
        uid: "test-uid",
        name: "test",
        email: "test@example.com",
      });

      await user.save();
      userId = user.uid;
    });
    afterEach(() => removeAllUsersAndProjects());

    it("should add a new project into the database", (done) => {
      request(app)
        .post(`/users/${userId}/projects`)
        .send({ fontFamilyName: "Test Sans" })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);

          return done(err);
        });
    });

    it("should NOT add a new project with invalid user_id", (done) => {
      request(app)
        .post("/users/invalid-user-id/projects")
        .send({ fontFamilyName: "Test Sans" })
        .expect(401)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "You are not authorized to access this resource."
          );

          const projectCount = await Project.countDocuments();

          expect(projectCount).toStrictEqual(0);
          return done();
        });
    });

    it("should NOT add a new project without font family name", (done) => {
      request(app)
        .post(`/users/${userId}/projects`)
        .expect(400)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "Field 'fontFamilyName' is required"
          );

          const projectCount = await Project.countDocuments();

          expect(projectCount).toStrictEqual(0);
          return done();
        });
    });
  });

  describe("GET `/users/:user_id/projects/:project_id`", () => {
    beforeEach(() => createUserAndProject());
    afterEach(() => removeAllUsersAndProjects());

    it("should return the project", (done) => {
      request(app)
        .get(`/users/${userId}/projects/${projectId}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty("result");
          expect(res.body.result).toHaveProperty("unicodePaths");
          expect(Array.isArray(res.body.result.unicodePaths)).toBe(true);
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

    it("should NOT update a project with irrelevant ObjectId", (done) => {
      const mongooseId = new mongoose.Types.ObjectId();

      request(app)
        .get(`/users/${userId}/projects/${mongooseId}`)
        .expect(404)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "The specified project_id does not exist or is not accessible."
          );

          return done();
        });
    });
  });

  describe("PUT `/users/:user_id/projects/:project_id`", () => {
    beforeEach(() => createUserAndProject());
    afterEach(() => removeAllUsersAndProjects());

    const char = {
      unicode: 65,
      pathString: "path for the test",
    };

    it("should update a project with a char property for request body", (done) => {
      request(app)
        .put(`/users/${userId}/projects/${projectId}`)
        .send({ char })
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err);

          const { unicodePaths } = await Project.findOne({});
          const unicodeData = unicodePaths.find(
            ({ unicode }) => unicode === char.unicode
          );

          expect(unicodeData.pathString).toStrictEqual(char.pathString);

          return done(err);
        });
    });

    it("should NOT update a project without a char property for request body", (done) => {
      request(app)
        .put(`/users/${userId}/projects/${projectId}`)
        .expect(400)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "Field 'char' is required"
          );

          const { unicodePaths } = await Project.findOne({});
          const unicodeData = unicodePaths.find(
            ({ unicode }) => unicode === char.unicode
          );

          expect(unicodeData.pathString).toStrictEqual("");

          return done(err);
        });
    });

    it("should NOT update a project with invalid user_id", (done) => {
      request(app)
        .put(`/users/invalid-user-id/projects/${projectId}`)
        .send({ char })
        .expect(401)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "You are not authorized to access this resource."
          );

          const { unicodePaths } = await Project.findOne({});
          const unicodeData = unicodePaths.find(
            ({ unicode }) => unicode === char.unicode
          );

          expect(unicodeData.pathString).not.toEqual(char.pathString);

          return done();
        });
    });

    it("should NOT update a project with invalid project_id", (done) => {
      request(app)
        .put(`/users/${userId}/projects/invalid-project-id`)
        .send({ char })
        .expect(404)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "The specified project_id is invalid."
          );

          return done();
        });
    });

    it("should NOT update a project with irrelevant ObjectId", (done) => {
      const mongooseId = new mongoose.Types.ObjectId();

      request(app)
        .put(`/users/${userId}/projects/${mongooseId}`)
        .send({ char })
        .expect(404)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body).toHaveProperty(
            "message",
            "The specified project_id does not exist or is not accessible."
          );

          return done();
        });
    });
  });
});
