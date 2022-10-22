var createError = require("http-errors");
var express = require("express");
const knex = require("../db");

const { body, validationResult } = require("express-validator");
const { response } = require("../app");
const { json } = require("express");

var router = express.Router();

router.get("/", function (req, res, next) {
  var query = knex.select().table("items");
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
      next(createError(500));
    });
});

router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  knex("items")
    .where("id", id)
    .then((items) => {
      return res.json({
        status: "Success",
        message: "Success",
        data: items,
      });
    })
    .catch((err) => {
      next(createError(500));
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
      next(
        createError(400, {
          data: errors.array(),
        })
      );
    }

    var insert = {
      activity_group_id: req.body.activity_group_id,
      title: req.body.title,
    };
    if (req.body.priority) insert.priority = req.body.priority;

    knex("activities")
      .where("id", "=", req.body.activity_group_id)
      .first()
      .then((items) => {
        if (!items) {
          next(
            createError(404, {
              message: "Activity not found",
              data: {},
            })
          );
        }
      })
      .catch((err) => {
        next(createError(500));
      });

    knex("items")
      .insert(insert)
      .returning("id")
      .then((id) => {
        knex("items")
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
            next(createError(500));
          });
      })
      .catch((err) => {
        next(createError(500));
      });
  }
);

router.delete("/:id", function (req, res, next) {
  var id = req.params.id;

  knex("items")
    .where("id", "=", id)
    .first()
    .then((items) => {
      if (!items)
        next(
          createError(404, {
            message: "Item with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("items")
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
          next(createError[500]);
        });
    })
    .catch((err) => {
      next(createError(500));
    });
});

router.patch("/:id", function (req, res, next) {
  var id = req.params.id;
  var update = {};
  if (req.body.title) update.title = req.body.title;
  if (!isNaN(req.body.is_active))
    update.is_active = req.body.is_active.toString();
  if (req.body.priority) update.priority = req.body.priority;

  knex("items")
    .where("id", "=", id)
    .first()
    .then((items) => {
      if (!items)
        next(
          createError(404, {
            message: "Item with ID " + id + " Not Found",
            data: {},
          })
        );

      knex("items")
        .where("id", "=", id)
        .update(update)
        .then((response) => {
          knex("items")
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
              return res.status(201).json({
                status: "Success",
                message: "Success",
                data: items,
              });
            })
            .catch((err) => {
              next(createError(500));
            });
        })
        .catch((err) => {
          next(createError[500]);
        });
    })
    .catch((err) => {
      next(createError(500));
    });
});

module.exports = router;
