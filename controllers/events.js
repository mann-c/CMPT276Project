const USER = 'USER';
const REST = 'REST';

const getByUserId = async (uid, pool) => {
    const getEvents = `SELECT 
                          u.login, 
                          u.firstname, 
                          u.lastname, 
                          u.city AS usercity, 
                          res.*, 
                          ev.startdate, 
                          ev.starttime 
                        FROM events ev 
                        INNER JOIN users u ON u.login = ev.userid 
                        INNER JOIN restaurants res ON ev.restid = res.id 
                        WHERE u.login = $1`;
    let events;
    await pool.query(getEvents, [uid])
        .then(res => events = res.rows)
        .catch(err => console.log(err));

    return events;
}

const getFollowingEvents = async (uid, pool) => {
    let followingEvents = [];
    const getFollowingList =    `SELECT
                                    f.sourceFriend,
                                    f.destinationFriend
                                 FROM friends f
                                 WHERE sourceFriend = $1`;
    let followList;
    await pool.query(getFollowingList, [uid])
        .then(res => followList=res.rows)
        .catch(err => console.log(err));
    
    //mod followlidt to array of string
    followList = followList.map(rowobj => rowobj.followed);
		console.log(followList);
    if(followList.length===0){
        return followingEvents;
    }

    const getEventsByList = `SELECT
                                u.login,
                                u.firstname, 
                                u.lastname, 
                                u.city AS usercity, 
                                res.*, 
                                ev.startdate, 
                                ev.starttime 
                            FROM events ev 
                            INNER JOIN users u ON u.login = ev.userid 
                            INNER JOIN restaurants res ON ev.restid = res.id 
                            WHERE u.login IN $1`;

    await pool.query(getEventsByList, [followList])
        .then(res => followingEvents = res.rows)
        .catch(err => console.log(err));

    return followingEvents;
}

const getByRestId = async (uid, pool) => {
    const getEvents = `SELECT 
                          u.login, 
                          u.firstname, 
                          u.lastname, 
                          u.city AS usercity, 
                          res.*, 
                          ev.startdate, 
                          ev.starttime 
                        FROM events ev 
                        INNER JOIN users u ON u.login = ev.userid 
                        INNER JOIN restaurants res ON ev.restid = res.id 
                        WHERE ev.restid = $1`;
    let events;
    await pool.query(getEvents, [uid])
        .then(res => events = res.rows)
        .catch(err => console.log(err));

    return events;
}

const addAttendanceInfo = async(events, pool) => {

}

exports.getFeedEvents = async (usertype, userdata, pool) => {
    let events = [];
    switch(usertype){
        case USER:
          await getByUserId(userdata.login, pool)
            .then(userevents => events = events.concat(userevents))
            .catch(err => console.log(err));
          await getFollowingEvents(userdata.login, pool)
            .then(followevents => events = events.concat(followevents))
            .catch(err => console.log(err));
          break;
        case REST:
            await getByRestId(userdata.id, pool)
            .then(restevents => events.concat(restevents))
            .catch(err => console.log(err));
          break;
        default:
          console.log("Something has gone terribly wrong here");
      }

    return events;
}