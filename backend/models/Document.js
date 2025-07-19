const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);
module.exports = { Document };