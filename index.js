const express = require('express')
const path = require('path')
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

const { Pool } = require('pg');
var pool;
const constring = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost/grababite`;

pool = new Pool({
  connectionString: constring
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'))

app.get('/restaurant/:uid', (req, res) => {
  var uid = req.params.uid;
  var query = `select * from restaurants where id=${uid}`;

  pool.query(query, (error, result)=>{
    if(error) 
      res.send(error);
      
    var results = {'attributes':result.rows[0]};
    console.log(results);
    var pathforprofile = '/restaurant/' + `${uid}`;
    if(results.attributes !== undefined){
      res.render('pages/restaurantprofile', {results, pageTitle: 'Restaurant Profile', path: pathforprofile});
    }
    else{
      res.status(404).render('pages/404', {path: pathforprofile});
    }
  })
});

app.get('/feed', (req, res) => {
  let uid = 1; //Should be current logged in user
  eventsController.getByUserId(uid)
      .then(answer => res.render('pages/feed', {events: answer.items, pageTitle: 'Your feed', path: '/feed'}))
      .catch(err => {
        console.log(err);
        res.status(404).render('pages/404', {path: '/feed'})
      });
  

});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
