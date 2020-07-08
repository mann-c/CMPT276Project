const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000


const { Pool } = require('pg');
var pool;
pool = new Pool({ 
  connectionString: 
})

express()
  .use(express.json())
  .use(express.urlencoded({extended:false}))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/Mainpage'))


  .get('/GotoResReg',(req,res) => res.render('pages/RestaurantSignup'))
  
  .get('/BacktoSignupres',(req,res)=> res.render('pages/RestaurantSignUp'))


  .post('/PostRestaurant', (request,response) =>{
    const {id,name,city,password}=request.body;
    pool.query('INSERT INTO restaurants (id,name,city,password) VALUES($1,$2,$3,$4)',[id,name,city,password], (error,results) =>{
      if (error){
        
        response.render('pages/RestaurantSignuperr');
       
      }
      
      response.render('pages/Mainpage');
    })
  })

 

 
  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  