const express = require("express");
const path = require("path");
var cors=require("cors");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const PORT = process.env.PORT || 5000;
const USER = "USER";
const REST = "REST";
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
const constring =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;
const pool = new Pool({
    connectionString: constring

});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",cors())
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
      return res.render("pages/mainpage", {messages:"THE USERNAME OR PASSWORD IS INCORRECT"}); //This does not work and crashes our app when reached
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
    `SELECT * FROM users WHERE login = $1`,
    [username],
    (error, result) => {
      if (error) {
        res.end(error);
      }
      console.log(result.rows.length);
      if (result.rows.length > 0) {
        console.log("same");
        errors.push({ msg: "Login is already taken" });
        console.log(errors[0]);
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
          `INSERT INTO users VALUES($1,$2,$3,$4,'',$5)`, //Empty string between $4, $5 is the empty description
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
  console.log(uid);

  var query = `select * from restaurants where id=$1`;

  pool.query(query, [uid], (error, result) => {
    if (error) res.send(error);
    console.log(res.rows);
    var results = { attributes: result.rows[0] };
    console.log(results);
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
app.post('/createEvent', (req, res) => {
  var user = req.body.user;
  var rest = req.body.restaurant;
  var date = req.body.date;
  var time = req.body.time;

  var getPersonQuery = `insert into events values(DEFAULT, $1, $2, $3, $4)`;
  pool.query(getPersonQuery, [user, rest, date, time], (error, result)=>{
    if(error){
      console.log("Could not create event");
      
    }

    res.redirect('/feed');
  })
});

app.get('/RestaurantSearch', checkNotAuthenticated, (req,res) =>{
    pool.query('SELECT * FROM restaurants ', (error,result) =>{
      if (error){
        throw error;
      }
      var results={'rows':result.rows};
      console.log(results)
      res.render('pages/RestaurantSearch',{results, pageTitle: 'Grababite • Restaurants', path: "/RestaurantSearch", user: req.user});
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

app.get("/GotoResReg", (req, res) => res.render("pages/RestaurantSignup"));
app.get("/GotoUsrReg", (req, res) => res.render("pages/registeruser"));

app.get('/user/:login', checkNotAuthenticated, function(req,res,next){ //No handling for non-existent user
  var login = req.params.login;
  var query = `select * from Users where login = $1`;

  pool.query(query, [login], (error,result)=>{
    if(error)
      res.send(error);
    var results = {attributes: result.rows[0]};
    var pathforprofile = '/user/' + `${login}`;

    if(results.attributes !== undefined){
      var qry = `select * from friends where destinationfriend = $1`;

      pool.query(qry, [login], (err,friends)=>{
        if(err)
          res.send(err);
        friends = friends.rows.map((friend_obj)=>friend_obj.sourcefriend);
        res.render(
          'pages/user',
          {
            friend: friends,
            row: results, 
            pageTitle: `Grababite • User • ${results.attributes.firstname} ${results.attributes.lastname}`, 
            path: pathforprofile, 
            user: req.user
          }
        );
      })
    }
    else{
      res.status(404).render('pages/404', {path: pathforprofile});
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
    var sql = 'update users set firstname = $1, lastname=$2, city=$3, description=$4, password=$5 where login=$6';
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

app.get("/test_get_all_create_event_join",(req,res)=>{
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

app.post('/event/join', (req,res) => {
  const {evid} = req.body;

  const attendQuery = `INSERT INTO eventsattendance VALUES ($1, $2)`
  pool.query(attendQuery, [evid, req.user.data.login], (error, result) => {
    if (error){
      console.log("ERROR IN PG query: join event");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    }
    res.redirect('/feed');
  });
});

app.post('/event/unjoin', (req,res) => {
  const {evid} = req.body;

  const attendQuery = `DELETE FROM eventsattendance where eventid = $1 and userid = $2`;
  pool.query(attendQuery, [evid, req.user.data.login], (error, result) => {
    if (error){
      console.log("ERROR IN PG query: unjoin event");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    }
    res.redirect('/feed');
  });
});

app.get("/test_get_all_create_follow",(req,res)=>{
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

app.post('/user/follow', (req,res) => {
  const {uid} = req.body;
  console.log(req);
  const friendQuery = `INSERT INTO friends VALUES ($1, $2)`
  pool.query(friendQuery, [req.user.data.login, uid], (error, result) => {
    if (error){
      console.log("ERROR IN PG query: follow user");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    }
    res.redirect('/user/'+ uid);
  });
});

app.post('/user/unfollow', (req,res) => {
  const {uid} = req.body;
  const friendQuery = `DELETE FROM FRIENDS where sourcefriend = $1 and destinationfriend = $2`
  pool.query(friendQuery, [req.user.data.login, uid], (error, result) => {
    if (error){
      console.log("ERROR IN PG query: unfollow user");
      //res.status(406).json({error: 'FAILURE'}); will be used for fetch post later
    }
    res.redirect('/user/'+ uid);
  });
});

app.get("/*", checkNotAuthenticated, (req, res) => {
  res.status(404).render("pages/404", { path: req.originalUrl, user: req.user });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
module.exports=app;
