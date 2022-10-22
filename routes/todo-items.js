var createError = require("http-errors");
var express = require("express");
const knex = require("../db");
const { dateformat_current } = require("../utils");

const { body, validationResult } = require("express-validator");
const { response } = require("../app");
const { json } = require("express");

var router = express.Router();

router.get("/", function (req, res, next) {
  var query = knex.select().table("todos");
  if (Object.keys(req.query).length) query = query.where(req.query);

  query
    .then((items) => {
      return res.json({
        status: "Success",
        message: "Success",
        data: items,
      });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  knex("todos")
    .where("id", id)
    .first()
    .then((items) => {
      if (!items)
        return next(
          createError(404, {
            message: "Todo with ID " + id + " Not Found",
            data: {},
          })
        );

      return res.json({
        status: "Success",
        message: "Success",
        data: items,
      });
    })
    .catch((err) => {
      return next(createError(500, { err }));
    });
});

router.post(
  "/",
  body("activity_group_id")
    .isLength({ min: 1 })
    .withMessage("activity_group_id cannot be null"),
  body("title").isLength({ min: 1 }).withMessage("title cannot be null"),
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

    var created_at = req.body.created_at
      ? req.body.created_at
      : dateformat_current();
    var updated_at = req.body.updated_at
      ? req.body.updated_at
      : dateformat_current();
    var priority = req.body.priority ? req.body.priority : "very-high";

    var insert = {
      activity_group_id: req.body.activity_group_id,
      title: req.body.title,
      priority,
      created_at,
      updated_at,
    };

    knex("activities")
      .where("id", "=", req.body.activity_group_id)
      .first()
      .then((items) => {
        if (!items) {
          return next(
            createError(404, {
              message: "Activity not found",
              data: {},
            })
          );
        }
      })
      .catch((err) => {
        return next(createError(500, { err }));
      });

    knex("todos")
      .insert(insert)
      .returning("id")
      .then((id) => {
        knex("todos")
          .select(
            "id",
            "title",
            "activity_group_id",
            "is_active",
            "priority",
            "created_at",
            "updated_at"
          )
          .where("id", "=", id)
          .first()
          .then((items) => {
            items.is_active = items.is_active ? true : false;
            return res.status(201).json({
              status: "Success",
              message: "Success",
              data: items,
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

  knex("todos")
    .where("id", "=", id)
    .first()
    .then((items) => {
      if (!items)
        return next(
          createError(404, {
            message: "Todo with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("todos")
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
  if (!isNaN(req.body.is_active))
    update.is_active = req.body.is_active.toString();
  if (typeof req.body.is_active == "boolean") {
    update.is_active = req.body.is_active ? "1" : "0";
  }
  if (req.body.priority) update.priority = req.body.priority;

  update.updated_at = dateformat_current();

  knex("todos")
    .where("id", "=", id)
    .first()
    .then((items) => {
      if (!items)
        return next(
          createError(404, {
            message: "Todo with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("todos")
        .where("id", "=", id)
        .update(update)
        .then((response) => {
          knex("todos")
            .select(
              "id",
              "title",
              "activity_group_id",
              "is_active",
              "priority",
              "created_at",
              "updated_at"
            )
            .where("id", "=", id)
            .first()
            .then((items) => {
              return res.status(200).json({
                status: "Success",
                message: "Success",
                data: items,
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
