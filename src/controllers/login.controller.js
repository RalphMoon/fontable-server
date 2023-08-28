const createError = require("http-errors");

const loginService = require("../services/login.service");

exports.createUser = async (req, res, next) => {
  try {
    const { uid, name, email } = req.body.decodedToken;

    await loginService.createUser({ uid, name, email });

    res.sendStatus(200);
  } catch (err) {
    next(createError(500, "An unexpected error occurred on the server."));
  }
};
