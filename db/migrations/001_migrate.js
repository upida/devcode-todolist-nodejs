exports.up = function (knex) {
  return knex.schema
    .createTable("activities", function (table) {
      table.increments("id").primary();
      table.string("title", 255).notNullable();
      table.string("email", 320).notNullable();
      table.datetime("created_at", { precision: 6 }).defaultTo(knex.fn.now(6));
      table.datetime("updated_at", { precision: 6 }).defaultTo(knex.fn.now(6));
      table.datetime("deleted_at");
    })
    .createTable("todos", function (table) {
      table.increments("id").primary();
      table.integer("activity_group_id", 10).notNullable().unsigned();
      table.string("title", 50).notNullable();
      table.string("is_active", 1).notNullable().defaultTo("1");
      table
        .enu("priority", ["very-high", "high", "medium", "low", "very-low"])
        .notNullable()
        .defaultTo("very-high");
      table.datetime("created_at", { precision: 6 }).defaultTo(knex.fn.now(6));
      table.datetime("updated_at", { precision: 6 }).defaultTo(knex.fn.now(6));
      table.datetime("deleted_at");
    })
    .then(console.log("created table"));
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("activities")
    .dropTable("todos")
    .then(console.log("dropped table"));
};

exports.config = { transaction: false };
