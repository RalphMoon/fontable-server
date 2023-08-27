const fs = require("fs");
const createError = require("http-errors");

const {
  detectText,
  convertPathToFontBuffer,
  convertBufferToTtf,
  readFileToBuffer,
  convertTtfToWoff,
} = require("../services/project.service");

exports.createProject = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    const result = await detectText(imageUrl);

    res.json({ result });
  } catch (err) {
    next(createError(500, "Error saving the file."));
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { query } = req;
    const { unicodePaths } = req.body;
    let buffer = await convertPathToFontBuffer(unicodePaths);

    if (query.export === "ttf") {
      const filePath = await convertBufferToTtf(buffer);
      buffer = await readFileToBuffer(filePath);
      fs.unlinkSync(filePath);
    }

    if (query.export === "woff") {
      const filePath = await convertBufferToTtf(buffer);
      buffer = await convertTtfToWoff(filePath);
      fs.unlinkSync(filePath);
    }

    res.send(buffer);
  } catch (err) {
    next(createError(500, "Error updating the file."));
  }
};
