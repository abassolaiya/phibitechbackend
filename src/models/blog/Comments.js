const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  comment: {
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
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  }]
});

module.exports = mongoose.model('Comment', CommentSchema);
