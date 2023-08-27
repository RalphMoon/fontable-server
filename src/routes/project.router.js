const router = require("express").Router();

const {
  createProject,
  updateProject,
} = require("../controllers/project.controller");

router.route("/").post(createProject).put(updateProject);

module.exports = router;
