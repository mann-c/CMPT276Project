const express = require("express");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const PORT = process.env.PORT || 5000;
const USER = 'USER';
const REST = 'REST';
const eventsController = require('./controllers/events');
const intiliazePassport = require("./passport-config");
intiliazePassport(passport);

if(process.env.NODE_ENV!="production"){
  console.log(`Running locally in ${process.env.NODE_ENV}`);
  const env = require('dotenv');
  env.config();
  if(env.error) throw env.error;
}

const { Pool } = require('pg');
const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;
const pool = new Pool({
  connectionString: constring
});

const app = express();
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

app.get('/', (req, res) => res.render('pages/Mainpage'))

app.get("/homepage", (req, res) => res.render("pages/homepage"));
app.get("/loginuser", checkAuthenticated, (req, res) =>
  res.render("pages/loginuser")
);
//you can access you restaurant data, through the restaurant login page
app.get("/rest", checkAuthenticated, (req, res) => res.render("pages/rest"));
app.get("/registeruser", checkAuthenticated, (req, res) =>
  res.render("pages/registeruser")
);
app.get("/dashboard", checkNotAuthenticated, (req, res) =>
  res.render("pages/dashboard", { user: req.user })
);
app.get("/logout", (req, res) => {
  let errors = [];
  req.logOut();
  errors.push({ msg: "you have logged out" });
  res.render("pages/loginuser", {
    errors,
  });
});

app.post(
  "/log",
  passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/loginuser",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/feed");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/homepage");
}

app.post("/reg", (req, res) => {
  var username = req.body.username;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var city = req.body.city;
  var password = req.body.password;
  let errors = [];
  let check = false;
  let inputplaced;
  pool.query(
    `SELECT * FROM users WHERE login='${username}'`,
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
          `INSERT INTO users VALUES('${username}','${first_name}','${last_name}','${city}','','${password}')`,
          (error, result) => {
            if (error) {
              res.end(error);
            }
          }
        );
        res.redirect('/loginuser'); //Login after registering
      }
    }
  );
});

app.get('/restaurant/:uid', checkNotAuthenticated, (req, res) => {
  var uid = req.params.uid;
  var query = `select * from restaurants where id=${uid}`;

  pool.query(query, (error, result)=>{
    if(error)
      res.send(error);

    var results = {'attributes':result.rows[0]};
    console.log(results);
    var pathforprofile = '/restaurant/' + `${uid}`;
    if(results.attributes !== undefined){
      res.render('pages/restaurantprofile', {results, pageTitle: 'Restaurant Profile', path: pathforprofile, user: req.user});
    }
    else{
      res.status(404).render('pages/404', {path: pathforprofile});
    }
  })
});

app.get('/feed', checkNotAuthenticated, (req, res) => {
  let uid = 1; //Should be current logged in user
  eventsController.getByUserId(uid, pool)
      .then(answer => res.render('pages/feed', {events: answer.items, pageTitle: 'Your feed', path: '/feed', user: req.user}))
      .catch(err => {
        console.log(err);
        res.status(404).render('pages/404', {path: '/feed'})
      });

});

app.get('/GotoResReg',(req,res) => res.render('pages/RestaurantSignup'));

app.get('/BacktoSignupres',(req,res)=> res.render('pages/RestaurantSignUp'));

app.post('/PostRestaurant', (request,response) =>{
  const {id,name,city,password}=request.body;
  pool.query('INSERT INTO restaurants (id,name,city,password) VALUES($1,$2,$3,$4)',[id,name,city,password], (error,results) =>{
    if (error){

      response.render('pages/RestaurantSignuperr');

    }

    response.render('pages/Mainpage');
  })
});

//reroute to user when you don't know who is logged in
app.get('/user', checkNotAuthenticated, (req,res,next) => {
  switch(req.user.type){
    case USER:
      res.redirect(`/user/${req.user.data.login}`);
      break;
    case REST:
      res.redirect(`restaurant/${req.user.data.id}`);
      break;
    default:
      console.log("Something has gone terribly wrong here");
  }
})
app.get('/user/:login', checkNotAuthenticated, function(req,res,next){
  var login = req.params.login;
  var sql = "SELECT * FROM Users where login = $1";
  pool.query(sql,[login],function(err,data){
    if(err) console.error(err);
    res.render('pages/user',{title:"User Profile",row:data.rows});

  });
});
//Update User Profile
app.post('/update',function(req,res){
  const login = req.body.login;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const last = req.body.lastname;
  const city = req.body.city;
  const description = req.body.description;
  const password = req.body.password;

  if(req.body.function === 'update'){
    var sql = "update users set firstname = $1, lastname=$2, city=$3, description=$4 password=$5 where login=$6";
    var input = [firstname,lastname,city,description,password,login];

    pool.query(sql, input, (err,data)=>{
      if(err) console.error(err);
      //if password is correct condition
        //redirect to user profile page
        res.redirect('/user/'+login);
    });
  };
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
