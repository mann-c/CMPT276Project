//The pool connection should be reviewed,
//we should establish pools or a singleton that is instantiated once.


const { Pool } = require('pg');

const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;

const pool = new Pool({
    connectionString: constring
});

exports.getByUserId = async (uid) => {
    const getEvents = `SELECT * FROM events WHERE userID=$1`;
    let events;
    await pool.query(getEvents, [uid])
        .then(res => events = {items: res.rows})
        .catch(err => console.log(error));

    return events;
}