const loginService = require("../services/login.service");

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, picture } = req.body.decodedToken;
    const user = await loginService.createUser({ name, email, picture });

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
