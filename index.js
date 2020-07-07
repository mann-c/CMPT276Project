const express = require('express');
const path = require('path');
var url = require('url');
var fs = require("fs");
var ejs = require("ejs");
const PORT = process.env.PORT || 5000
const eventsController = require('./controllers/events');

//For local testing
//Guarded include for dotenv as it is not a production dependency
if(process.env.NODE_ENV!="production"){
  console.log(`Running locally in ${process.env.NODE_ENV}`);
  const env = require('dotenv');
  env.config();
  if(env.error) throw env.error;
}

const app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('views', path.join(__dirname, 'views'));
app.set('pages', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

const {Pool} = require('pg');
var pool;
pool = new Pool({
  //local connection
  connectionString:'postgres://JenniceLee:root@localhost:5432/grababite'
  //remote connection
  //connectionString:process.env.HEROKU_POSTGRESQL_BLUE_URL
})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/', (req, res) => res.render('pages/index'))

app.get('/feed', (req, res) => {
  /* my code
  let uid = 1; //Should be current logged in user
  eventsController.getByUserId(uid)
      .then(answer => res.render(answer))
      .catch(err => res.status(404).json({"message" : "Events not found"}));
  */

});
//User Profile page
// app.get('/user/:login',function(req,res,next){
//   var login = req.params.login;
//   var sql = "SELECT * FROM Users where login = $1";
//   pool.query(sql,[login],function(err,data){
//     if(err) console.error(err);
//     res.render('pages/user',{title:"User Profile",row:data.rows[0]});
//
//   });
// });

app.get('/user/:login',function(req,res,next){
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

  if(req.body.function === 'update'){
    var sql = "update users set firstname = $1, lastname=$2, city=$3, description=$4 where login=$5";
    var input = [firstname,lastname,city,description,login];

    pool.query(sql, input, (err,data)=>{
      if(err) console.error(err);
      //if password is correct condition
        //redirect to user profile page
        res.redirect('/user/'+login);
    });
  };
});
