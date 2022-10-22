const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME,
  },
  log: {
    warn(message) {},
    error(message) {
      console.error(message);
    },
    deprecate(message) {},
    debug(message) {},
  },
});

module.exports = knex;
