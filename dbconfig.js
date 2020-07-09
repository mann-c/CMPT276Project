const { Pool } = require("pg");
//connect db
pool = new Pool({
  connectionString:  process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`
});
module.exports = { pool };
