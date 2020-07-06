//The pool connection should be reviewed,
//we should establish pools or a singleton that is instantiated once.
//For local testing
//Guarded include for dotenv as it is not a production dependency
if(process.env.NODE_ENV!="production"){
    console.log(`Running locally in ${process.env.NODE_ENV}`);
    const env = require('dotenv');
    env.config();
    if(env.error) throw env.error;
  }

const { Pool } = require('pg');
//add DB_USER, DB_PASS, DB_NAME for your localhost config in .env file
const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: constring
});

exports.getByUserId = async (uid) => {
    const getEvents = `SELECT 
                          u.login, 
                          u.firstname, 
                          u.lastname, 
                          u.city AS usercity, 
                          res.*, 
                          ev.starttime, 
                          ev.endtime 
                        FROM events ev 
                        INNER JOIN users u ON u.login = ev.userid 
                        INNER JOIN restaurants res ON ev.restid = res.id 
                        WHERE u.login = $1`;
    let events;
    await pool.query(getEvents, [uid])
        .then(res => events = {items: res.rows})
        .catch(err => console.log(error));

    return events;
}