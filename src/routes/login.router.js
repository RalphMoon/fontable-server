const router = require("express").Router();

const { authenticate } = require("../middlewares/authenticate");
const { createUser } = require("../controllers/login.controller");

router.post("/", authenticate, createUser);

module.exports = router;
