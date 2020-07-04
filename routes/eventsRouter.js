const { Router } = require('express');
const request = require('request');
const eventsController = require('../controllers/events');
//Guarded include for dotenv as it is not a production dependency
if(process.env.NODE_ENV!="production"){
    console.log(`Not in production: in ${process.env.NODE_ENV}`);
    const env = require('dotenv');
    env.config();
    if(env.error) throw env.error;
}
const router = Router();

router.get('/byuser/:uid', (req, res) => {
    let uid = req.params.uid;
    eventsController.getByUserId(uid)
        .then(answer => res.send(answer))
        .catch(err => res.status(404).json({"message" : "Events not found"}));
    
});

router.use( '/', (req,res) => {
    res.status(404).json({message: "Could not find what you're looking for"});
});

module.exports = router;