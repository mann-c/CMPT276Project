const { Pool } = require("pg");

if(process.env.NODE_ENV!="production"){
  console.log(`Running locally in ${process.env.NODE_ENV}`);
  const env = require('dotenv');
  env.config();
  if(env.error) throw env.error;
}

//connect db
const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;
pool = new Pool({
  connectionString: constring,
});
module.exports = { pool };
