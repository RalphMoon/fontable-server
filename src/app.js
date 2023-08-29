require("dotenv").config();

const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const logger = require("morgan");

const connectDB = require("./configs/db.config");
const login = require("./routes/login.router");
const project = require("./routes/project.router");
const { corsOptions } = require("./configs/cors.config");

const app = express();

connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));

app.use("/users", login);
app.use("/users/:user_id/projects", project);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({
    status: err.status,
    error: err.name,
    message: err.message,
  });
});

module.exports = app;
