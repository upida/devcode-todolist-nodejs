var createError = require("http-errors");
var express = require("express");
const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME,
  },
});
const { body, validationResult } = require("express-validator");
const { response } = require("../app");
const { json } = require("express");

var router = express.Router();

/* activity */

router.get("/activity-groups", function (req, res, next) {
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
      next(createError(500));
    });
});

router.get("/activity-groups/:id", function (req, res, next) {
  var id = req.params.id;
  knex("activities")
    .where("id", id)
    .then((activities) => {
      return res.json({
        status: "Success",
        message: "Success",
        data: activities,
      });
    })
    .catch((err) => {
      next(createError(500));
    });
});

router.post(
  "/activity-groups",
  body("title").isLength({ min: 1 }).withMessage("Title cannot be null"),
  body("email").isEmail().withMessage("Invalid value"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    var title = req.body.title;
    var email = req.body.email;

    knex("activities")
      .insert({ title, email })
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
            next(createError(500));
          });
      })
      .catch((err) => {
        next(createError(500));
      });
  }
);

router.delete("/activity-groups/:id", function (req, res, next) {
  var id = req.params.id;

  knex("activities")
    .where("id", "=", id)
    .first()
    .then((activities) => {
      if (!activities)
        return res.status(404).json({
          status: "Not found",
          message: "Activity with ID " + id + " Not Found",
          data: {},
        });

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
          next(createError[500]);
        });
    })
    .catch((err) => {
      next(createError(500));
    });
});

router.patch("/activity-groups/:id", function (req, res, next) {
  var id = req.params.id;
  var update = {};
  if (req.body.title) update.title = req.body.title;
  if (req.body.email) update.email = req.body.email;

  knex("activities")
    .where("id", "=", id)
    .first()
    .then((activities) => {
      if (!activities)
        return res.status(404).json({
          status: "Not found",
          message: "Activity with ID " + id + " Not Found",
          data: {},
        });

      knex("activities")
        .where("id", "=", id)
        .update(update)
        .then((response) => {
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

/* items */

router.get("/todo-items", function (req, res, next) {
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

router.get("/todo-items/:id", function (req, res, next) {
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
  "/todo-items",
  body("activity_group_id")
    .isLength({ min: 1 })
    .withMessage("Activity group cannot be null"),
  body("title").isLength({ min: 1 }).withMessage("Title cannot be null"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
          return res.status(404).json({
            status: "Bad request",
            message: "Activity not found",
            data: {},
          });
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

router.delete("/todo-items/:id", function (req, res, next) {
  var id = req.params.id;

  knex("items")
    .where("id", "=", id)
    .first()
    .then((items) => {
      if (!items)
        return res.status(404).json({
          status: "Not found",
          message: "Item with ID " + id + " Not Found",
          data: {},
        });

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

router.patch("/todo-items/:id", function (req, res, next) {
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
        return res.status(404).json({
          status: "Not found",
          message: "Item with ID " + id + " Not Found",
          data: {},
        });

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
