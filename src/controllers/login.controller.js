const createError = require("http-errors");
const User = require("../models/User.model");

exports.createUser = async (req, res, next) => {
  try {
    const { uid, name, email } = req.body.decodedToken;
    let user = await User.findOne({ email }).select("-createdAt");

    if (!user) {
      user = new User({
        uid,
        name,
        email,
      }).save();
    }

    res.sendStatus(200);
  } catch (err) {
    next(createError(500, "An unexpected error occurred on the server."));
  }
};
