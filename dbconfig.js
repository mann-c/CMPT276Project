const { Pool } = require("pg");
//connect db
pool = new Pool({
  connectionString: "postgres://postgres:abcde@localhost/grababite",
});
module.exports = { pool };
