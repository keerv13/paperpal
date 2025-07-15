const express = require('express');
const router = express.Router();
const schemas = require('../models/Schemas');

router.post('/auth', async (req, res) => {
  const { email, password, mode } = req.body;

  if (!email || !password || !mode) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const existingUser = await schemas.User.findOne({ email });
    //Sign up - Existing user check
    if (mode === 'signup') {
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists. Please log in.' });
      }
      //Sign up - new user
      const newUser = new schemas.User({ email, password });
      await newUser.save();
      return res.status(201).json({ message: 'User registered successfully.' });
      //Login but wrong pw/email
    } else if (mode === 'login') {
      if (!existingUser || existingUser.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      // Log in - Authentication success
      return res.status(200).json({ message: 'Login successful.' });
    } else {
      return res.status(400).json({ message: 'Invalid mode.' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;