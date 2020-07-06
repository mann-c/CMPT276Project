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

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'))

app.get('/feed', (req, res) => {
  let uid = 1; //Should be current logged in user
  eventsController.getByUserId(uid)
      .then(answer => answer.json())
      .then(answer => res.render('/pages/feed', {events: answer.items, pageTitle: 'Your feed', path: '/feed'}))
      .catch(err => res.status(404).render('pages/404', {path: '/feed'}));
  

});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
