const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = { Chat };