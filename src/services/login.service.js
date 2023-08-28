const User = require("../models/User.model");

exports.createUser = async ({ uid, name, email }) => {
  let user = await User.findOne({ email }).select("-createdAt");

  if (!user) {
    user = new User({
      uid,
      name,
      email,
    }).save();
  }
};
