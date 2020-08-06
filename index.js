const express = require("express");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");

const PORT = process.env.PORT || 5000;
const USER = "USER";
const REST = "REST";
const feedSubscribers = {}; //Key-value pairing
const eventsController = require("./controllers/events");
const intiliazePassport = require("./passport-config");
intiliazePassport(passport);

if (process.env.NODE_ENV != "production") {
  console.log(`Running locally in ${process.env.NODE_ENV}`);
  const env = require("dotenv");
  env.config();
  if (env.error) throw env.error;
}
const { Pool } = require("pg");
const { send } = require("process");
const constring =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;
const pool = new Pool({
    connectionString: constring

});

const app = express();
var upload = multer({ dest: 'images/' });
var server = http.createServer(app);
var io = socketIo.listen(server);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => res.redirect("/mainpage"));
app.get("/mainpage", checkAuthenticated, (req, res) => res.render("pages/Mainpage"));
app.get("/registeruser", (req, res) => res.render("pages/registeruser"));
app.get("/logout", (req, res) => {
  let errors = [];
  req.logOut();
  errors.push({ msg: "you have logged out" });
  res.redirect("/mainpage")
});
app.get("/restaurantlogin", checkAuthenticated, (req, res) => res.render("pages/Restaurantloginpage"));
app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("pages/Mainpage", {messages:"THE USERNAME OR PASSWORD IS INCORRECT"}); //This does not work and crashes our app when reached
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/user");
    });
  })(req, res, next);
});

app.post("/logrestaurant", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("pages/Restaurantloginpage", {messages:"THE USERNAME OR PASSWORD IS INCORRECT"});
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/restaurant/" + user.data.id);
    });
  })(req, res, next);
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.user.type == USER) {
      var profile = "/user/"+req.user.data.login;
      return res.redirect(profile);
    }
    else {
      var profile = "/restaurant/"+req.user.data.id;
      return res.redirect(profile);
    }
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/mainpage");
}
app.get("/testgetall",(req,res)=>{
  pool.query(`SELECT * FROM users`,(error, result) => {
    if (error) {
      res.end(error);
    }
    var results = { rows: result.rows };
    var us=[];
    us.push(results)
    res.json(us);
  });
});
app.post("/reguser", (req, res) => {
  var username = req.body.username;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var city = req.body.city;
  var password = req.body.password;
  let errors = [];
  let check = false;
  let inputplaced;
  pool.query(
    `SELECT * FROM users WHERE login= $1`,
    [username],
    (error, result) => {
      if (error) {
        res.end(error);
      }
      if (result.rows.length > 0) {
        errors.push({ msg: "Login is already taken" });
        res.render("pages/registeruser", {
          errors,
          username,
          first_name,
          last_name,
          city,
          password,
        });
      } else {
        pool.query(
          `INSERT INTO users VALUES($1,$2,$3,$4,'',$5)`,//Empty string between $4, $5 is the empty description
          [username, first_name, last_name, city, password],
          (error, result) => {
            if (error) {
              res.end(error);
            }
          }
        );
        res.redirect("mainpage");
      }
    }
  );
});
app.post("/regrest", (req, res) => {
  var id = req.body.id;
  var name = req.body.name;
  var city = req.body.city;
  var password = req.body.password;
  let errors = [];
  let check = false;
  let inputplaced;
  pool.query(`SELECT * FROM restaurants WHERE id='${id}'`, (error, result) => {
    if (error) {
      res.end(error);
    }
    console.log(result.rows.length);
    if (result.rows.length > 0) {
      console.log("same");
      errors.push({ msg: "Login is already taken" });
      console.log(errors[0]);
      res.render("pages/RestaurantSignup", {
        errors,
        id,
        name,
        city,
        password,
      });
    } else {
      pool.query(
        "INSERT INTO restaurants (id,name,city,password) VALUES($1,$2,$3,$4)",
        [id, name, city, password],
        (error, results) => {
          if (error) {
            res.end(error);
          }
        }
      );
      res.redirect("restaurantlogin");
    }
  });
});

app.get('/restaurant/:uid', checkNotAuthenticated, (req, res) => {
  var uid = req.params.uid;

  var query = `select * from restaurants where id = $1`;

  pool.query(query, [uid],(error, result) => {
    if (error) res.send(error);
      var results = { attributes: result.rows[0] };

    var pathforprofile = '/restaurant/' + `${uid}`;
    if(results.attributes !== undefined){
      res.render(
      'pages/restaurantprofile',
        {
          results,
          pageTitle: `Grababite • ${results.attributes.name}`,
          path: pathforprofile,
          user: req.user
        }
      );
    }
    else{
      res.status(404).render('pages/404', {path: pathforprofile, user: req.user});
    }
  });
});

app.get("/test_get_all_create_events",(req,res)=>{
  pool.query(`SELECT * FROM events`,(error, result) => {
    if (error) {
      res.end(error);
    }
    var results = { rows: result.rows };
    var us=[];
    us.push(results)
    res.json(us);
  });
});

app.get("/test_get_all_friends",(req,res)=>{
  pool.query(`SELECT * FROM friends`,(error, result) => {
    if (error) {
      res.end(error);
    }
    var results = { rows: result.rows };
    var us=[];
    us.push(results)
    res.json(us);
  });
});

app.get("/test_get_all_attendance",(req,res)=>{
  pool.query(`SELECT * FROM eventsattendance`,(error, result) => {
    if (error) {
      res.end(error);
    }
    var results = { rows: result.rows };
    var us=[];
    us.push(results)
    res.json(us);
  });
});

app.post('/createEvent', (req, res) => {
  var date = req.body.date;
  var time = req.body.time;
  var user = req.body.user;
  var rest = req.body.restaurant;

  var getPersonQuery = `insert into events values(DEFAULT, $1, $2, $3, $4) RETURNING *`;
  pool.query(getPersonQuery, [user, rest, date, time], (error, result) => {
    if(error){
      res.end("Error with creating a new event");
    }
    //We get the restaurant name for the socket message
    const restaurantQuery = `SELECT * FROM restaurants WHERE id = $1`;
    pool.query(restaurantQuery, [rest], (resterror, restresult) => {
      if(resterror){
        console.log("ERROR IN NESTED(1) PG query: create event")
        res.status(406).json({error: 'FAILURE'});
      } else {
        //Notifies the followers of the event
        const followerQuery = `SELECT * FROM friends WHERE destinationfriend = $1`;
        pool.query(followerQuery, [user], (innererror, innerresult) => {
          if(innererror){
            console.log("ERROR IN NESTED(2) PG query: create event")
            res.status(406).json({error: 'FAILURE'});
          } else {
            //Notifies the followers of the event
            let followers = innerresult.rows.map(row => row.sourcefriend);
            socketNotifyCreate(
              {...result.rows[0],...restresult.rows[0]},                                                       // Created Event info
              [...followers, restresult.rows[0].id]
            );
          }
        });
      }
      res.redirect(`/feed#${result.rows[0].eventid}`);
    });
  })
});

app.get('/RestaurantSearch', checkNotAuthenticated, (req,res) =>{
    pool.query('select * from restaurants where random() < 0.001;', (error,result) =>{
      if (error){
        throw error;
      }
      var results={'rows':result.rows};
      res.render('pages/RestaurantSearch',{results, pageTitle: 'Restaurant Search', path: "/RestaurantSearch", user: req.user});
    })
  })

app.get('/feed', checkNotAuthenticated, (req, res) => {
  
  eventsController.getFeedEvents(req.user.type, req.user.data, pool)
      .then(answer => res.render('pages/feed', {
        events: answer,
        pageTitle: 'Grababite • Feed',
        path: '/feed',
        user: req.user})
      )
      .catch(err => {
        console.log(err);
        res.status(404).render('pages/404', {path: '/feed'})
      });
});
//Test route for testing only remove it
app.get("/testsession", (req, res) => {
  console.log(Object.keys(req.session));
  console.log(req.session);
  console.log(req.sessionID);
  if(req.session.passport)
    console.log(req.session.passport.user.data);
});
app.get("/GotoResReg", (req, res) => res.render("pages/RestaurantSignup"));
app.get("/GotoUsrReg", (req, res) => res.render("pages/registeruser"));


app.get('/user/:login', checkNotAuthenticated, function(req,res,next){
  var login = req.params.login;
  var query = `select * from Users where login = $1`;

  pool.query(query,[login],(error,result)=>{
    if(error)
      res.send(error);
    var results = {'attributes':result.rows[0]};
    var pathforprofile = `/user/${login}`;

    if(results.attributes !== undefined){
      var qry = `select * from friends where destinationfriend = $1`;

        pool.query(qry,[login],(err,friends)=>{
          if(err)
            res.send(err);
          friends = friends.rows.map((friend_obj)=>friend_obj.sourcefriend);
          res.render(
          'pages/user',
          {
            friend:friends,
            row:results,
            pageTitle: `Grababite • User • ${results.attributes.firstname} ${results.attributes.lastname}`,
            path: pathforprofile,
            user: req.user
          }
        );
      })
    }
    else{
      res.status(404).render('pages/404',{path:pathforprofile});
    }
  })
});

app.post("/testgetupdate",function(req,res){
  var username= req.body.username;
  pool.query(`SELECT * FROM users WHERE login = $1`,
  [username],(error, result) => {
    if (error) {
      res.end(error);
    }
    var results = { rows: result.rows };
    var us=[];
    us.push(results)
    res.json(us);
  });
});

//Update User Profile
app.post('/update',function(req,res){
  const login = req.body.login;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const city = req.body.city;
  const description = req.body.description;
  const password = req.body.password;
  if(req.body.function === 'update'){
    var sql = 'update users set firstname =$1 , lastname=$2,city=$3, description=$4, password=$5 where login=$6';
    var input = [firstname,lastname,city,description,password,login];
    pool.query(sql, input, (err,data)=>{
      if(err) console.error(err);
        //redirect to user profile page
        res.redirect('/user/' + login);
    });
  }
});

//reroute to user when you don't know who is logged in
app.get("/user", checkNotAuthenticated, (req, res, next) => {
  switch (req.user.type) {
    case USER:
      res.redirect(`/user/${req.user.data.login}`);
      break;
    case REST:
      res.redirect(`restaurant/${req.user.data.id}`);
      break;
    default:
      console.log("Something has gone terribly wrong here");
  }
});

app.post('/event/join', (req,res) => {
  evid = req.body.evid;

  //User login is inserted into attendance table
  const attendQuery = `INSERT INTO eventsattendance VALUES ($1, $2)`;
  pool.query(attendQuery, [evid, req.body.login], (aterror, atresult) => {
    if (aterror){
      console.log("ERROR IN PG query: join event");
      res.status(406).json({error: 'FAILURE'});
    } // Else move on
  
    //We update the page for all attendees, including newly joined
    const attendeeQuery = `SELECT * FROM eventsattendance WHERE eventid = $1`;
    pool.query(attendeeQuery, [evid], (perror, presult) => {
      if(perror){
        console.log("ERROR IN NESTED PG query: join event")
        res.status(406).json({error: 'FAILURE'});
      } else {
        //Updates the view for attendees
        let idList = []
        if(presult.rowCount)
          idList = presult.rows.map(row => row.userid);               //Array of objects -> Array of ids
        
        //We check the event record for the owner and restaurant, so we can notify them
        const eventQuery = `SELECT ev.*, res.name FROM events ev
                            INNER JOIN restaurants res ON ev.restid = res.id 
                            WHERE eventid = $1`;
        pool.query(eventQuery, [evid], (error, result) => {
          if(error){
            console.log("ERROR IN NESTED PG query: join event")
            res.status(406).json({error: 'FAILURE'});
          } else {
            //Updates the view for restaurant and creator
            socketUpdateEvent(
              'JOIN',
              evid,
              {login: req.body.login},
              [...idList, result.rows[0].userid, result.rows[0].restid]   //Array of who to update for
            );
            //Notifies the creator of the event
            socketNotifyUpdate(
              'JOIN',
              result.rows[0],                                                       //All event info
              {
                login: req.user.data.login,                                         //Login of who joined
                name: `${req.user.data.firstname} ${req.user.data.lastname}`        //Name of who joined
              }
            );
            res.status(201).json({message: 'SUCCESS'});
          }
        });
      }
    });
  });
});

app.post('/event/unjoin', (req,res) => {
  evid = req.body.evid;
  
  const attendQuery = `DELETE FROM eventsattendance where eventid = $1 and userid = $2`;
  pool.query(attendQuery, [evid, req.body.login], (aterror, atresult) => {
    if (aterror){
      console.log("ERROR IN PG query: unjoin event");
      res.status(406).json({error: 'FAILURE'}); //will be used for fetch post later
    } 

    //We update the page for all attendees, excluding the one who left
    const attendeeQuery = `SELECT * FROM eventsattendance WHERE eventid = $1`;
    pool.query(attendeeQuery, [evid], (perror, presult) => {
      if(perror){
        console.log("ERROR IN NESTED PG query: join event")
        res.status(406).json({perror: 'FAILURE'});
      } else {
        let idList = [];
        //Updates the view for attendees
        if(presult.rowCount)
          idList = presult.rows.map(row => row.userid);               //Array of objects -> Array of ids
        
        //We check the event record for the owner and restaurant, so we can notify them
        const eventQuery = `SELECT ev.*, res.name FROM events ev
                            INNER JOIN restaurants res ON ev.restid = res.id 
                            WHERE eventid = $1`;
        pool.query(eventQuery, [evid], (error, result) => {
          if(error){
            console.log("ERROR IN NESTED PG query: unjoin event")
            res.status(406).json({error: 'FAILURE'});
          } else {
            //Updates the view for restaurant and creator
            socketUpdateEvent(
              'UNJOIN',
              evid,
              {login: req.body.login},
              [...idList, result.rows[0].userid, result.rows[0].restid, req.body.login]   //Array of who to update for
            );
            //Notifies the creator of the event
            socketNotifyUpdate(
              'UNJOIN',
              result.rows[0],                                                       //All event info
              {
                login: req.user.data.login,                                         //Login of who joined
                name: `${req.user.data.firstname} ${req.user.data.lastname}`        //Name of who joined
              }
            );
            res.status(201).json({message: 'SUCCESS'});
          }
        });
      }
    });
  });
});

app.post('/event/delete', (req,res) => {
  const {evid} = req.body;
  let deletedEvent;
  let deletedEventAttendees;
  console.log('delete requested for event ' + evid);
  //Deleting foreign key references in attendance
  const deleteAttendanceQuery = `DELETE FROM eventsattendance WHERE eventid = $1 RETURNING *`;
  pool.query(deleteAttendanceQuery, [evid], (error, result) => {
    if (error ){
      console.log("ERROR IN PG query: delete event");
      res.status(406).json({error: 'FAILURE'}); //will be used for fetch post later
    }
    deletedEventAttendees = result.rows;

    //Delete event after
    const deleteEventQuery = `DELETE FROM events WHERE eventid = $1 RETURNING *`;
    pool.query(deleteEventQuery, [evid], (outererror, outerresult) => {
      if (outererror){
        console.log("ERROR IN PG query: delete event");
        res.status(406).json({error: 'FAILURE'}); //will be used for fetch post later
      }
      deletedEvent = outerresult.rows[0];
        //Updates the view for attendees
        let idList = deletedEventAttendees.map(row => row.userid);               //Array of objects -> Array of ids
        //We get the restaurant name for the socket message
        const eventQuery = `SELECT * FROM restaurants WHERE id = $1`;
        pool.query(eventQuery, [deletedEvent.restid], (innererror, innerresult) => {
          if(innererror){
            console.log("ERROR IN NESTED(1) PG query: delete event")
            res.status(406).json({error: 'FAILURE'});
          } else {
            //Notifies the followers of the event
            const followerQuery = `SELECT * FROM friends WHERE destinationfriend = $1`;
            pool.query(followerQuery, [req.user.data.login], (followerror, followresult) => {
              if(followerror){
                console.log("ERROR IN NESTED(2) PG query: create event")
                res.status(406).json({error: 'FAILURE'});
              } else {
                //Notifies the followers of the event
                let followers = followresult.rows.map(row => {
                  if(!idList.includes(row.sourcefriend))        //If they are a follower not attending
                    return row.sourcefriend;
                });

                //Update the views
                socketUpdateEvent(
                  'DELETE',
                  evid,
                  {login: req.user.data.login},
                  [...followers,...idList, outerresult.rows[0].userid, outerresult.rows[0].restid] //Array of who to update for
                );
                //Notifies the deletion of the event
                socketNotifyDelete(
                  {...deletedEvent, ...innerresult.rows[0]},                                                       // Deleted Event info
                  [...idList, outerresult.rows[0].restid]
                );
                res.status(201).json({message: 'SUCCESS'});
              }
            });
          }
        });
    });
  });
  
});




app.post('/user/follow', (req,res) => {
  uid = req.body.uid;
  const friendQuery = `INSERT INTO friends VALUES ($1, $2)`
  pool.query(friendQuery, [req.body.login,uid], (error, result) => {
    if (error){
      console.log("ERROR IN PG query: follow user");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    }
    res.redirect('/user/'+ uid);
  });
});

app.post('/user/unfollow', (req,res) => {
  uid = req.body.uid;
  const friendQuery = `DELETE FROM FRIENDS where sourcefriend = $1 and destinationfriend = $2 `
  pool.query(friendQuery,[req.body.login,uid],(error, result) => {
    if (error){
      console.log("ERROR IN PG query: unfollower user");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    };
    res.redirect('/user/'+ uid);
  });
});

app.post('/user/following',(req,res)=>{
  const {uid} = req.body;
  var qry = `select * from friends where sourcefriend = '${uid}'`
  pool.query(qry,(err,result)=>{
    if(err)
    res.send(err);

    res.render('pages/follow',{'followingcount':result.rowCount,'following':result.rows,pageTitle:"Following",path:'/user/following',user:req.user})
  });
});

app.post('/user/follower',(req,res)=>{
  const {uid} = req.body;
  var qry = `select * from friends where destinationfriend = '${uid}'`
  pool.query(qry,(err,result)=>{
    if(err)
    res.send(err);

    res.render('pages/follow',{'followercount':result.rowCount,'follower':result.rows,pageTitle:"Follower",path:'/user/follower',user:req.user})
  });
});

app.post('/user/chat',(req, res) => {
  const {uid} = req.body;
  var qry = `SELECT * FROM USERS WHERE login = '${uid}'`
  pool.query(qry,(err,result)=>{
    if(err)
      res.send(err);
    res.render('pages/chat', {user:req.user,pageTitle:"Chat",path:'/user/chat',user:req.user});
  });
});

io.sockets.on('connection', (socket) => {
  // message
  var roomName = null;

  socket.on('join', (data) => {
    roomName = data;
    socket.join(data);
  })

  socket.on('message', (data) => {
    io.sockets.in(roomName).emit('message', data);
    console.log(data);
  });

  socket.on('image', (data)=>{
    io.sockets.in(roomName).emit('image', data);
    console.log(data);
  })

  socket.on('subscribe', (userlogin) => {
    //console.log("Connection by user: " + userlogin);
    feedSubscribers[`${userlogin}`] = socket.id                                   //Map sockets to users
  })

  socket.on('disconnect', () => {
    //loop through subscribers for disconnect
    for (let prop in feedSubscribers){
      if (feedSubscribers.hasOwnProperty(prop)){
        if (feedSubscribers.prop == socket.id){
          delete feedSubscribers.prop;
          break;
        }
      }
    }
  })
});

app.post('/user/image', upload.single("image"), function(req, res, next) {
  try {
    console.log(req.file)
    var data = req.file;
    res.send(data.location);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get('/UserSearch', checkNotAuthenticated, (req,res) =>{
  pool.query('select * from users where random() < 0.25;', (error,result) =>{
    if (error){
      throw error;
    }
    var results={'rows':result.rows};
    console.log(results)
    res.render('pages/UserSearch',{results, pageTitle: 'User Search', path: "/UserSearch", user: req.user});
  })
});

app.post('/UsrSearch', checkNotAuthenticated,(request,response) =>{
  Svar=request.body.Svar;
  Tvar="%" + Svar + "%";
  pool.query('SELECT * FROM users WHERE (lower(firstName) LIKE lower($1)) OR (lower(lastName) LIKE lower($1)) OR (lower(city) LIKE lower($1)) OR (lower(description) LIKE lower($1))',[Tvar],(error,results) =>{
    if (error){
      throw error;
    }

    response.render('pages/UserSearch',{results, pageTitle: 'Grababite • Users', path: "/UserSearch", user: request.user})
  });
});

app.post('/RestrSearch',checkNotAuthenticated,(request,response) =>{
  Svar=request.body.Svar;
  Tvar="%" + Svar + "%";

  pool.query('SELECT * FROM restaurants WHERE (lower(name) LIKE lower($1)) OR (lower(city) LIKE lower($1)) OR (lower(address) LIKE lower($1)) OR (lower(description) LIKE lower($1))',[Tvar], (error,results) =>{
    if (error){
      throw error;
    }
    response.render('pages/RestaurantSearch',{results, pageTitle: 'Grababite • Restaurants', path: "/RestaurantSearch", user: request.user})
  });
});


app.get('/explore', checkNotAuthenticated, (req, res) => {
  res.render('pages/explore', {accessToken: process.env.MAPBOX_TOKEN, pageTitle: "Grababite • Explore", path: "/explore", user: req.user});
})

app.get('/api/getevents', checkNotAuthenticated, (req, res) => {
  eventsController.getFeedEvents(req.user.type, req.user.data, pool)
      .then(answer => res.json({events: answer}))
      .catch(err => {
        console.log(err);
        res.status(406).json({error: 'FAILURE'});
      });
})

app.get('/*', (req, res) => {
  res.status(404).render("pages/404", { path: req.originalUrl, user: req.user })
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

function socketUpdateEvent(type, evid, userData, sendArray){
  if(sendArray){
    sendArray.map( targetLogin => {
      if(feedSubscribers.hasOwnProperty(targetLogin)){
        io.to(feedSubscribers[targetLogin]).emit('updateevent', type, evid, userData);
      }
    });
  }
}

//Sends notification for updates to events (attendance for now) to owner (for now)
function socketNotifyUpdate(type, eventData, userData){
  if(feedSubscribers.hasOwnProperty(eventData.userid)){                       //If user connected, notify!
    io.to(feedSubscribers[eventData.userid]).emit('updateattendance', type, eventData, userData);
  }
}
function socketNotifyDelete(eventData, sendArray){
  if(sendArray){
    sendArray.map( targetLogin => {
      if(feedSubscribers.hasOwnProperty(targetLogin)){
        io.to(feedSubscribers[targetLogin]).emit('popevent', eventData);
      }
    });
  }
}
function socketNotifyCreate(eventData, sendArray){
  if(sendArray){
    sendArray.map( targetLogin => {
      if(feedSubscribers.hasOwnProperty(targetLogin)){
        io.to(feedSubscribers[targetLogin]).emit('pushevent', eventData);
      }
    });
  }
}

module.exports=server;