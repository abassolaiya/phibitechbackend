const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const BlogPostController = require("../../controllers/blog/BlogpostControllers");
const { ensureAuthenticated } = require("../../middleware/auth");

// ====== BLOG POSTS ======
router.get("/", BlogPostController.getAllBlogPosts);
router.post("/", ensureAuthenticated, BlogPostController.createBlogPost);
router.get("/:id", BlogPostController.getBlogPostById);
router.put(
  "/:id",
  ensureAuthenticated,
  upload.single("image"), // This tells Express to handle `req.file` and `req.body`
  BlogPostController.updateBlogPost
);
router.delete("/:id", ensureAuthenticated, BlogPostController.deleteBlogPost);
router.post("/:id/like", ensureAuthenticated, BlogPostController.likeBlogPost);

// ====== COMMENTS ======
router.post(
  "/:blogPostId/comments",
  ensureAuthenticated,
  BlogPostController.createComment
);
router.get("/:blogPostId/comments", BlogPostController.getCommentsByBlogPost);
router.put(
  "/comments/:id",
  ensureAuthenticated,
  BlogPostController.updateComment
);
router.delete(
  "/comments/:id",
  ensureAuthenticated,
  BlogPostController.deleteComment
);
router.post(
  "/comments/:id/like",
  ensureAuthenticated,
  BlogPostController.likeComment
);

// ====== REPLIES ======
router.post(
  "/comments/:commentId/replies",
  ensureAuthenticated,
  BlogPostController.createReply
);
router.get(
  "/comments/:commentId/replies",
  BlogPostController.getRepliesByComment
);
router.put("/replies/:id", ensureAuthenticated, BlogPostController.updateReply);
router.delete(
  "/replies/:id",
  ensureAuthenticated,
  BlogPostController.deleteReply
);
router.post(
  "/replies/:id/like",
  ensureAuthenticated,
  BlogPostController.likeReply
);

module.exports = router;
