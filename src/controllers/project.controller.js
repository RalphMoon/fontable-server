const createError = require("http-errors");
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Project = require("../models/Project.model");
const {
  convertPathToOtfBuffer,
  convertOtfBufferToTtfBuffer,
} = require("../services/project.service");

exports.getProject = async (req, res, next) => {
  try {
    const { user_id: userId, project_id: projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      next(createError(404, "The specified project_id is invalid."));
      return;
    }

    const user = await User.findOne({ uid: userId }).populate({
      path: "projects",
      match: { _id: projectId },
    });

    if (!user) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    const project = user.projects[0];

    if (!project) {
      next(
        createError(
          404,
          "The specified project_id does not exist or is not accessible."
        )
      );
      return;
    }

    res.status(200).json({ result: project });
  } catch (err) {
    console.error(err);
    next(createError(500, "An unexpected error occurred on the server."));
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const { fontFamilyName } = req.body;
    const user = await User.findOne({ uid: userId }).populate({
      path: "projects",
      match: { name: fontFamilyName },
    });

    if (!user) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    if (!fontFamilyName) {
      next(createError(400, "Field 'fontFamilyName' is required"));
      return;
    }

    const { projects } = user;
    const isFontFamilyNameExists = projects.some(
      ({ name }) => name === fontFamilyName
    );

    if (isFontFamilyNameExists) {
      next(createError(400, "Font family name already exists."));
      return;
    }

    const project = new Project({
      name: fontFamilyName,
      createdBy: user._id,
    });

    await project.save();
    projects.push(project._id);
    await user.save();

    const projectId = project._id.toString();

    res.set("Location", `projects/${projectId}`);
    res.status(201).json({ result: projectId });
  } catch (err) {
    console.error(err);
    next(createError(500, "An unexpected error occurred on the server."));
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { user_id: userId, project_id: projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      next(createError(404, "The specified project_id is invalid."));
      return;
    }

    const { export_type: exportType } = req.query;
    const { char } = req.body;
    const user = await User.findOne({ uid: userId });
    const project = await Project.findById(projectId);

    if (!user) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    if (!char) {
      next(createError(400, "Field 'char' is required"));
      return;
    }

    if (!project) {
      next(
        createError(
          404,
          "The specified project_id does not exist or is not accessible."
        )
      );
      return;
    }

    const { name, unicodePaths } = project;

    if (exportType === "otf") {
      const otfBuffer = await convertPathToOtfBuffer(name, unicodePaths);

      res.send(otfBuffer);
      return;
    }

    if (exportType === "ttf") {
      const otfBuffer = await convertPathToOtfBuffer(name, unicodePaths);
      const ttfBuffer = await convertOtfBufferToTtfBuffer(otfBuffer);

      res.send(ttfBuffer);
      return;
    }

    const unicodeData = unicodePaths.find(
      (unicodePath) => unicodePath.unicode === char.unicode
    );

    unicodeData.pathString = char.pathString;
    await project.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    next(createError(500, "An unexpected error occurred on the server."));
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { user_id: userId, project_id: projectId } = req.params;
    const userExists = await User.exists({ uid: userId });

    if (!userExists) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      next(
        createError(
          404,
          "The specified project_id does not exist or is not accessible."
        )
      );
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getProjectList = async (req, res, next) => {
  try {
    const { user_id: userId } = req.params;
    const user = await User.findOne({ uid: userId }).populate({
      path: "projects",
    });

    if (!user) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    const { projects } = user;

    res.status(200).json({ result: projects });
  } catch (err) {
    console.error(err);
    next(createError(500, "An unexpected error occurred on the server."));
  }
};
