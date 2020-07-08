const { Pool } = require("pg");
//connect db
pool = new Pool({
  connectionString: "postgres://postgres:root@localhost/grababite",
});
module.exports = { pool };
