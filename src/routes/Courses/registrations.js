const express = require("express");
const {
  getRegistrations,
  getRegistration,
  registerCourse,
  updateRegistrationStatus,
  updatePaymentStatus,
  deleteRegistration,
} = require("../../controllers/Courses/StudentRegistrationController");

const { ensureAuthenticated } = require("../../middleware/auth");

const router = express.Router({ mergeParams: true });

router.route("/").get(ensureAuthenticated, getRegistrations);

router
  .route("/:id")
  .get(ensureAuthenticated, getRegistration)
  .delete(ensureAuthenticated, deleteRegistration);

router.route("/:id/status").put(ensureAuthenticated, updateRegistrationStatus);

router.route("/:id/payment").put(ensureAuthenticated, updatePaymentStatus);

router.route("/:id/register").post(registerCourse);

module.exports = router;
