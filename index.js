const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const eventsController = require('./controllers/events');

const { Pool } = require('pg');
var pool;
const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;

pool = new Pool({
  connectionString: constring
});

//For local testing
//Guarded include for dotenv as it is not a production dependency
if(process.env.NODE_ENV!="production"){
  console.log(`Running locally in ${process.env.NODE_ENV}`);
  const env = require('dotenv');
  env.config();
  if(env.error) throw env.error;
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'))

app.get('/restaurant/profile/:uid', (req, res) => {
  var uid = req.params.uid;
  console.log(uid);
  var query = `select * from restaurants where id=${uid}`;

  pool.query(query, (error, result)=>{
    if(error)
      res.end(error);
      
    console.log(result);
    var results = {'attributes':result.rows[0]};
    res.render('pages/restaurantprofile', results);
  })
});

app.get('/feed', (req, res) => {
  /* my code
  let uid = 1; //Should be current logged in user
  eventsController.getByUserId(uid)
      .then(answer => res.render(answer))
      .catch(err => res.status(404).json({"message" : "Events not found"}));
  */

});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
