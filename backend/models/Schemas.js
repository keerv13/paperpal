const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // new fields:
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  entryDate:            { type: Date, default: Date.now }
})

// before saving, hash password if it’s new or modified
const bcrypt = require('bcrypt')
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

const User = mongoose.model('User', userSchema)
module.exports = { User }
