const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  timePosted: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  }
});

module.exports = mongoose.model('Reply', ReplySchema);
