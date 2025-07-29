const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL or File Reference
      required: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("BlogPost", BlogPostSchema);
