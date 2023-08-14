const createError = require("http-errors");

const admin = require("../configs/firebase.config");

exports.authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      next(createError(400, "Header 'Authorization' is required."));
      return;
    }

    const token = authorization.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.body.decodedToken = decodedToken;
    next();
  } catch (err) {
    if (err.code?.startsWith("auth/")) {
      next(createError(401, "You are not authorized to access this resource."));
      return;
    }

    next(err);
  }
};
