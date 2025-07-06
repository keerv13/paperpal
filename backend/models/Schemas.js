const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  entryDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema); // let Mongoose pluralize

module.exports = { User };
