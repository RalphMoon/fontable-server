require("dotenv").config();

const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const logger = require("morgan");

const connectDB = require("./configs/db.config");

const app = express();

connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CLIENT_LOCAL_URI,
    credentials: true,
  })
);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
