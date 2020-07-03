const express = require('express');
const path = require('path');

const userRouter = require('./routes/userRouter');
const restaurantRouter = require('./routes/restaurantRouter');
const eventsRouter = require('./routes/eventsRouter');
const PORT = process.env.PORT || 5000;

const app = express();

//Frontend static files go here
app.use(express.static(__dirname + '/frontend/build'))

//User endpoints handled in userRouter
app.use('/api/user', userRouter);

//Restaurant endpoints handles in restaurantRouter
app.use('/api/restaurant', restaurantRouter);

//Restaurant endpoints handles in restaurantRouter
app.use('/api/event', eventsRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send to React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});


app.listen(PORT);
console.log(`Listening on ${PORT}`);