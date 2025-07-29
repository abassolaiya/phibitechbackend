const BlogPost = require("../../models/blog/BlogPost");
const Comment = require("../../models/blog/Comments");
const Reply = require("../../models/blog/Reply");
const uploadToCloudinary = require("../../utils/cloudinary");

module.exports = {
  getAllBlogPosts: async (req, res) => {
    try {
      const blogPosts = await BlogPost.find().populate("author", "name");

      const detailedPosts = await Promise.all(
        blogPosts.map(async (post) => {
          const commentCount = await Comment.countDocuments({
            blogPost: post._id,
          });
          const likeCount = post.likes || 0;

          return {
            ...post.toObject(),
            commentCount,
            likeCount,
          };
        })
      );

      res.json(detailedPosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getBlogPostById: async (req, res) => {
    try {
      const blogPost = await BlogPost.findById(req.params.id).populate(
        "author",
        "name"
      );
      if (!blogPost)
        return res.status(404).json({ message: "Blog post not found" });

      const comments = await Comment.find({ blogPost: blogPost._id }).populate(
        "author",
        "name"
      );

      const commentsWithRepliesAndLikes = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Reply.find({ comment: comment._id }).populate(
            "author",
            "name"
          );
          return {
            ...comment.toObject(),
            replyCount: replies.length,
            replies,
            likeCount: comment.likes || 0,
          };
        })
      );

      res.json({
        ...blogPost.toObject(),
        likeCount: blogPost.likes || 0,
        comments: commentsWithRepliesAndLikes,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createBlogPost: async (req, res) => {
    const { title, body, image } = req.body;
    const blogPost = new BlogPost({
      title,
      body,
      image,
      author: req.user.id,
    });

    try {
      const newBlogPost = await blogPost.save();
      res.status(201).json(newBlogPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateBlogPost: async (req, res) => {
    try {
      const { title, body } = req.body;
      const file = req.file;

      const blogPost = await BlogPost.findById(req.params.id);
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      blogPost.title = title ?? blogPost.title;
      blogPost.body = body ?? blogPost.body;

      if (file) {
        // Convert buffer to base64
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;
        const uploadedImage = await uploadToCloudinary(base64Image);
        blogPost.image = uploadedImage.secure_url;
      }

      const updatedBlogPost = await blogPost.save();
      res.json(updatedBlogPost);
    } catch (err) {
      console.error("Update error:", err);
      res.status(400).json({ message: err.message });
    }
  },

  deleteBlogPost: async (req, res) => {
    try {
      const blogPost = await BlogPost.findById(req.params.id);
      if (!blogPost)
        return res.status(404).json({ message: "Blog post not found" });

      await blogPost.remove();
      res.json({ message: "Blog post deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeBlogPost: async (req, res) => {
    try {
      const blogPost = await BlogPost.findById(req.params.id);
      if (!blogPost)
        return res.status(404).json({ message: "Blog post not found" });

      blogPost.likes += 1;
      await blogPost.save();
      res.json(blogPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createComment: async (req, res) => {
    const { comment } = req.body;
    const blogPostId = req.params.blogPostId;

    try {
      const blogPost = await BlogPost.findById(blogPostId);
      if (!blogPost)
        return res.status(404).json({ message: "Blog post not found" });

      const newComment = new Comment({
        author: req.user.id,
        comment,
        blogPost: blogPostId,
      });

      const savedComment = await newComment.save();
      blogPost.comments.push(savedComment.id);
      await blogPost.save();

      res.status(201).json(savedComment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getCommentsByBlogPost: async (req, res) => {
    const blogPostId = req.params.blogPostId;

    try {
      const comments = await Comment.find({ blogPost: blogPostId }).populate(
        "author",
        "name"
      );
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateComment: async (req, res) => {
    const { comment } = req.body;

    try {
      const commentDoc = await Comment.findById(req.params.id);
      if (!commentDoc)
        return res.status(404).json({ message: "Comment not found" });

      commentDoc.comment = comment ?? commentDoc.comment;

      const updatedComment = await commentDoc.save();
      res.json(updatedComment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      await comment.remove();
      res.json({ message: "Comment deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      comment.likes += 1;
      await comment.save();
      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createReply: async (req, res) => {
    const { reply } = req.body;
    const commentId = req.params.commentId;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      const newReply = new Reply({
        author: req.user.id,
        reply,
        comment: commentId,
      });

      const savedReply = await newReply.save();
      comment.replies.push(savedReply.id);
      await comment.save();

      res.status(201).json(savedReply);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getRepliesByComment: async (req, res) => {
    const commentId = req.params.commentId;

    try {
      const replies = await Reply.find({ comment: commentId }).populate(
        "author",
        "name"
      );
      res.json(replies);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateReply: async (req, res) => {
    const { reply } = req.body;

    try {
      const replyDoc = await Reply.findById(req.params.id);
      if (!replyDoc)
        return res.status(404).json({ message: "Reply not found" });

      replyDoc.reply = reply ?? replyDoc.reply;

      const updatedReply = await replyDoc.save();
      res.json(updatedReply);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteReply: async (req, res) => {
    try {
      const reply = await Reply.findById(req.params.id);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      await reply.remove();
      res.json({ message: "Reply deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeReply: async (req, res) => {
    try {
      const reply = await Reply.findById(req.params.id);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      reply.likes += 1;
      await reply.save();
      res.json(reply);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeBlogPost: async (req, res) => {
    try {
      const blogPost = await BlogPost.findById(req.params.id);
      if (!blogPost)
        return res.status(404).json({ message: "Blog post not found" });

      blogPost.likes += 1;
      await blogPost.save();
      res.json(blogPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      comment.likes += 1;
      await comment.save();
      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  likeReply: async (req, res) => {
    try {
      const reply = await Reply.findById(req.params.id);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      reply.likes += 1;
      await reply.save();
      res.json(reply);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
