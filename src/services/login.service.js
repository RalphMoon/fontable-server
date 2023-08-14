const User = require("../models/User.model");

exports.createUser = async ({ name, email, picture }) => {
  let user = await User.findOne({ email }).select("-createdAt");

  if (!user) {
    user = new User({
      name,
      email,
      picture,
    }).save();
  }

  return user;
};
