const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../../controllers/Courses/CourseController");

const Registration = require("../../models/Courses/StudentRegistration");
const advancedResults = require("../../middleware/advancedResults");
const { ensureAuthenticated } = require("../../middleware/auth");

const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses).post(ensureAuthenticated, createCourse);

router
  .route("/:slug")
  .get(getCourse)
  .put(ensureAuthenticated, updateCourse)
  .delete(ensureAuthenticated, deleteCourse);

// Re-route into registration router
const registrationRouter = require("./registrations");
router.use("/:courseId/registrations", registrationRouter);

module.exports = router;
