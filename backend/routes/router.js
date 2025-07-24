/// backend/routes/router.js

const express    = require('express');
const router     = express.Router();
const crypto     = require('crypto');
const bcrypt     = require('bcrypt');
const nodemailer = require('nodemailer');
const multer     = require('multer');

const { User }     = require('../models/Schemas');
const { Document } = require('../models/Document');
const { Chat }     = require('../models/Chat');

// These should point at your actual vector‑store + LLM logic.
// Stub them out for now (see below).
const {
  vectorizeAndStoreChunks,
  generateAnswer
} = require('../utils/yourVectorUtils');

// ─── Multer setup ───────────────────────────────────────────────────────────
const upload = multer({ dest: 'uploads/' });

// ─── Mail transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ─── AUTH: signup / login ────────────────────────────────────────────────────
router.post('/auth', async (req, res) => {
  const { email, password, mode } = req.body;
  if (!email || !password || !mode)
    return res.status(400).json({ message: 'Missing required fields.' });

  try {
    const existingUser = await User.findOne({ email });

    if (mode === 'signup') {
      if (existingUser)
        return res
          .status(400)
          .json({ message: 'Email already exists. Please log in.' });
      const newUser = new User({ email, password });
      await newUser.save();
      return res
        .status(201)
        .json({ message: 'User registered.', user_id: newUser._id.toString() });
    }
    else if (mode === 'login') {
      if (!existingUser)
        return res.status(401).json({ message: 'Invalid email or password.' });
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid email or password.' });
      return res
        .status(200)
        .json({ message: 'Login successful.', user_id: existingUser._id.toString() });
    }
    else {
      return res.status(400).json({ message: 'Invalid mode.' });
    }
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });

  try {
    const user = await User.findOne({ email });
    // Always 200 to prevent enumeration
    if (!user)
      return res.json({ message: 'If that email is in our system, we’ve sent a link.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      from: process.env.MAIL_USER,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password (expires in 1 hour).</p>`
    });

    res.json({ message: 'If that email is in our system, we’ve sent a link.' });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/auth/reset-password/:token', async (req, res) => {
  const { token }    = req.params;
  const { password } = req.body;
  if (!password || password.length < 8)
    return res.status(400).json({ message: 'Password must be ≥8 characters.' });

  try {
    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ message: 'Token invalid or expired.' });

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save(); // pre-save hook hashes

    res.json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── UPLOAD: Persist doc + create empty chat ────────────────────────────────
router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {
    const { userId } = req.body;
    const file       = req.file; // multer

    try {
      // 1) your existing vectorization logic
      const { chunksInserted, message } = await vectorizeAndStoreChunks(file, userId);

      // 2) save Document metadata
      const doc = await Document.create({
        user:     userId,
        filename: file.originalname,
        path:     file.path
      });

      // 3) create empty Chat record
      const chat = await Chat.create({
        user:     userId,
        document: doc._id,
        messages: []
      });

      // 4) return both vector stats + new IDs
      res.json({
        chunksInserted,
        message,
        documentId: doc._id,
        chatId:      chat._id
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Server error saving document & chat.' });
    }
  }
);

// ─── QUERY: Append messages + generate answer ───────────────────────────────
router.post('/query', async (req, res) => {
  const { userId, chatId, query } = req.body;
  try {
    // save user question
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { role: 'user', text: query } }
    });

    // generate your answer
    const answer = await generateAnswer(userId, chatId, query);

    // save assistant reply
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { role: 'assistant', text: answer } }
    });

    res.json({ answer });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Server error during query.' });
  }
});

// ─── GET ALL CHATS FOR A USER ────────────────────────────────────────────────
router.get('/chats', async (req, res) => {
  const { userId } = req.query;
  try {
    const chats = await Chat.find({ user: userId })
      .populate('document')
      .sort({ 'document.uploadDate': 1 });
    res.json(chats);
  } catch (err) {
    console.error('Fetch chats error:', err);
    res.status(500).json({ error: 'Error fetching chats.' });
  }
});

module.exports = router;
