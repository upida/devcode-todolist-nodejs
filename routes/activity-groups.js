var createError = require("http-errors");
var express = require("express");
const knex = require("../db");
const { dateformat_current } = require("../utils");

const { body, validationResult } = require("express-validator");
const { response } = require("../app");
const { json } = require("express");

var router = express.Router();

router.get("/", function (req, res, next) {
  knex
    .select()
    .table("activities")
    .then((activities) => {
      return res.json({
        status: "Success",
        message: "Success",
        data: activities,
      });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  knex("activities")
    .where("id", id)
    .first()
    .then((activities) => {
      if (!activities)
        return next(
          createError(404, {
            message: "Activity with ID " + id + " Not Found",
            data: {},
          })
        );

      return res.json({
        status: "Success",
        message: "Success",
        data: activities,
      });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

router.post(
  "/",
  body("title").isLength({ min: 1 }).withMessage("title cannot be null"),
  body("email").isEmail().withMessage("Invalid value"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        createError(400, {
          message: errors.array()[0].msg,
          data: {},
        })
      );
    }

    var title = req.body.title;
    var email = req.body.email;
    var created_at = req.body.created_at
      ? req.body.created_at
      : dateformat_current();
    var updated_at = req.body.updated_at
      ? req.body.updated_at
      : dateformat_current();

    knex("activities")
      .insert({ title, email, created_at, updated_at })
      .returning("id")
      .then((id) => {
        knex("activities")
          .select("id", "title", "email", "created_at", "updated_at")
          .where("id", "=", id)
          .first()
          .then((activities) => {
            return res.status(201).json({
              status: "Success",
              message: "Success",
              data: activities,
            });
          })
          .catch((err) => {
            return next(createError(500, { err }));
          });
      })
      .catch((err) => {
        return next(createError(500, { err }));
      });
  }
);

router.delete("/:id", function (req, res, next) {
  var id = req.params.id;

  knex("activities")
    .where("id", "=", id)
    .first()
    .then((activities) => {
      if (!activities)
        return next(
          createError(404, {
            message: "Activity with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("activities")
        .where("id", "=", id)
        .del()
        .then((response) => {
          return res.json({
            status: "Success",
            message: "Deleted successfully",
            data: {},
          });
        })
        .catch((err) => {
          return next(createError(500, { err }));
        });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

router.patch("/:id", function (req, res, next) {
  var id = req.params.id;
  var update = {};
  if (req.body.title) update.title = req.body.title;
  if (req.body.email) update.email = req.body.email;

  update.updated_at = dateformat_current();

  knex("activities")
    .where("id", "=", id)
    .first()
    .then((activities) => {
      if (!activities)
        return next(
          createError(404, {
            message: "Activity with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("activities")
        .where("id", "=", id)
        .update(update)
        .then((response) => {
          knex("activities")
            .select("id", "title", "email", "created_at", "updated_at")
            .where("id", "=", id)
            .first()
            .then((activities) => {
              return res.status(200).json({
                status: "Success",
                message: "Success",
                data: activities,
              });
            })
            .catch((err) => {
              return next(createError(500, { err }));
            });
        })
        .catch((err) => {
          return next(createError(500, { err }));
        });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

module.exports = router;
