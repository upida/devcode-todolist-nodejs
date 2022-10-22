require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

var activityGroupsRouter = require("./routes/activity-groups");
var todoItemsRouter = require("./routes/todo-items");

var app = express();

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/activity-groups", activityGroupsRouter);
app.use("/todo-items", todoItemsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // console.error(err.status);

  // render the error page
  res.status(err.status || 500);
  res.json({
    status: getReasonPhrase(err.status),
    message: err.message,
    data: err.data,
  });
});

module.exports = app;
