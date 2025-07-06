const express = require('express')
const router = express.Router()
const schemas = require('../models/Schemas');

router.post('/auth', async (req, res) => {
    const {email, password} = req.body
    
    const newUser = new schemas.User({ email, password });
    const saveUser = await newUser.save();

    if (saveUser){
      res.send('User saved')

    }

  //  res.status(200).json({
 // message: 'Authenticated successfully',
  //token: 'mock-jwt-token',
//}
//);

})
module.exports = router