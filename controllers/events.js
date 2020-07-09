//The pool connection should be reviewed,
//we should establish pools or a singleton that is instantiated once.
//For local testing
//Guarded include for dotenv as it is not a production dependency

exports.getByUserId = async (uid, pool) => {
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