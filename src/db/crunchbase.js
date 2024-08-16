const {
  CRUNCHBASE_DB_CLIENT,
  CRUNCHBASE_DB_HOST,
  CRUNCHBASE_DB_USER,
  CRUNCHBASE_DB_PASSWORD,
  CRUNCHBASE_DB_PORT,
  CRUNCHBASE_DB_DATABASE,
} = process.env;

const db = require("knex")({
  client: CRUNCHBASE_DB_CLIENT,
  connection: {
    host: CRUNCHBASE_DB_HOST,
    user: CRUNCHBASE_DB_USER,
    password: CRUNCHBASE_DB_PASSWORD,
    port: CRUNCHBASE_DB_PORT,
    database: CRUNCHBASE_DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  },
});

module.exports = db;
