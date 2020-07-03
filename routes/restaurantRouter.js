const { Router } = require('express');
const request = require('request');
//Guarded include for dotenv as it is not a production dependency
if(process.env.NODE_ENV!="production"){
    console.log(`Not in production: in ${process.env.NODE_ENV}`);
    const env = require('dotenv');
    env.config();
    if(env.error) throw env.error;
}
const router = Router();

router.get('/:id', (req, res) => {
    //Do something
})

module.exports = router;