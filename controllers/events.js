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
                          ev.starttime,
                          ev.eventid
                        FROM events ev 
                        INNER JOIN users u ON u.login = ev.userid 
                        INNER JOIN restaurants res ON ev.restid = res.id 
                        WHERE u.login = $1 AND ev.startdate>=CURRENT_DATE
                        ORDER BY startdate ASC, starttime ASC`;
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
 
    followList = followList.map(rowobj => rowobj.destinationfriend);
    
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
                                ev.starttime,
                                ev.eventid
                            FROM events ev 
                            INNER JOIN users u ON u.login = ev.userid 
                            INNER JOIN restaurants res ON ev.restid = res.id 
                            WHERE u.login = ANY ($1) AND ev.startdate>=CURRENT_DATE
                            ORDER BY startdate ASC, starttime ASC`;

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
                          ev.eventid,
                          ev.startdate, 
                          ev.starttime
                        FROM events ev 
                        INNER JOIN users u ON u.login = ev.userid 
                        INNER JOIN restaurants res ON ev.restid = res.id 
                        WHERE ev.restid = $1 AND ev.startdate>=CURRENT_DATE
                        ORDER BY startdate ASC, starttime ASC`;
    let events;
    await pool.query(getEvents, [uid])
        .then(res => events = res.rows)
        .catch(err => console.log(err));

    return events;
}

const addAttendanceInfo = async(eventslist, pool) => {
  if(eventslist.length===0){
    return [];
  }
  let eventsids = eventslist.map(obj => obj.eventid);

  //batch query for performance
  const getAttendanceList = `SELECT * FROM eventsattendance WHERE eventid = ANY ($1)`;
    let attendanceList;
    await pool.query(getAttendanceList, [eventsids])
        .then(res => attendanceList=res.rows)
        .catch(err => console.log(err));

    let eventsplus = {};

    attendanceList.forEach( (eventobj) => {
      if( eventobj.eventid in eventsplus){
        eventsplus[eventobj.eventid].count++;
        eventsplus[eventobj.eventid].attendees.push(eventobj.userid);
      } else {
        eventsplus[eventobj.eventid] = {
          count: 1,
          attendees: [eventobj.userid]
        };
      }
    });

    eventslist = eventslist.map( (eventobj) => {
      if(eventobj.eventid in eventsplus){
        return {
          ...eventobj,
          count: eventsplus[eventobj.eventid].count,
          attendees: eventsplus[eventobj.eventid].attendees
        }
      } else {
        return {
          ...eventobj,
          count: 0,
          attendees: []
        }
      }
    });
    //at this stage we have the logins of the attendess but that is not enough
    return eventslist;
  //array reduce to extract login firstname, lastname of attending and count
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

          await addAttendanceInfo(events, pool)
            .then(modified => events=modified)
            .catch(err => console.log(err));

          break;
        case REST:
            await getByRestId(userdata.id, pool)
              .then(restevents => events = events.concat(restevents))
              .catch(err => console.log(err));
              
            await addAttendanceInfo(events, pool)
              .then(modified => events=modified)
              .catch(err => console.log(err));

          break;
        default:
          console.log("events.js:162 Something has gone terribly wrong here");
      }

    return events;
}