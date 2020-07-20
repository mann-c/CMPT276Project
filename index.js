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

const { Pool } = require("pg");
var pool;
const constring = process.env.DATABASE_URL || 'postgres://$process.env.DB_USER}:${process.env.DB_PASS)@localhost/grababite';

pool=new Pool({
  connectionString: constring
});


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/Mainpage'))

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

 
  app.post('/ResLoggedIn', (request,response) =>{

    const {id,password}=request.body;
    pool.query('SELECT * FROM restaurants WHERE id=$1 AND password=$2',[id,password], (error,result) =>{
      if (error){
        throw error;
      }
      var results={'rows':result.rows};
      response.render('pages/RestaurantLoggedIn',results);
    })
  })



  app.get('/RestaurantSearch',(request,response) =>{
    pool.query('SELECT * FROM restaurants ', (error,result) =>{
      if (error){
        throw error;
      }
      var results={'rows':result.rows};
      response.render('pages/RestaurantSearch',results);
    })
    
  })

  app.post('/SelectedRestaurantfromSearch',(request,response) =>{
    const {place}=request.body;
    pool.query('SELECT * FROM restaurants OFFSET $1 LIMIT 1',[place],(error,result) =>{
      if (error){
        throw error;
      }
      var results={'rows':result.rows};
      response.render('pages/RestaurantSearchResult',results);
    })
  })
 
  


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








app.get('/Searchpage',(request,response) =>{
  pool.query('SELECT * FROM users',(error,results) =>{
    if (error){
      throw error;
    } 
    pool.query('SELECT * FROM restaurants',(error,results1) =>{
      if (error){
        throw error;
      }
      var result={'rows':results.rows,'rows2':results1.rows};
      response.render('pages/Search-RestUser',result);
    })
   
  })

  app.post('/UsrSearch',(request,response) =>{
    const {Svar}=request.body;
   
    pool.query('SELECT * FROM users WHERE firstName=$1 OR lastName=$1 OR city=$1',[Svar],(error,results) =>{
      if (error){
        throw error;
      }
    
    pool.query('SELECT * FROM restaurants', (error,results2) =>{
      if (error){
        throw error;
      }
      var result={'rows':results.rows,'rows2':results2.rows};
      response.render('pages/Search-RestUser',result)
    })
      
    } )
  })





  app.post('/RestrSearch',(request,response) =>{
    const {Svar}=request.body;
   
    pool.query('SELECT * FROM users',(error,results) =>{
      if (error){
        throw error;
      }
    
    pool.query('SELECT * FROM restaurants WHERE name=$1 OR city=$1 OR address=$1',[Svar], (error,results2) =>{
      if (error){
        throw error;
      }
      var result={'rows':results.rows,'rows2':results2.rows};
      response.render('pages/Search-RestUser',result)
    })
      
    } )
  })

  
})






app.listen(PORT, () => console.log(`Listening on ${ PORT }`));