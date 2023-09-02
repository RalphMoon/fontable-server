const router = require("express").Router({ mergeParams: true });
const createError = require("http-errors");

const {
  getProjectList,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

router
  .route("/")
  .all((req, res, next) => {
    const { user_id: userId } = req.params;

    if (!userId) {
      next(createError(401, "You are not authorized to access this resource."));
    }

    next();
  })
  .get(getProjectList)
  .post(createProject);

router
  .route("/:project_id")
  .all((req, res, next) => {
    const { user_id: userId, project_id: projectId } = req.params;

    if (!userId) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    if (!projectId) {
      next(
        createError(
          404,
          "The specified project_id does not exist or is not accessible."
        )
      );
      return;
    }

    next();
  })
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
