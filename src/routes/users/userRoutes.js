const express = require("express");
const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  editPassword,
  forgotPassword,
  resetPassword,
  addBankDetails,
} = require("../../controllers/users/userController");

const router = express.Router();

router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/profile", getUserProfile);
router.get("/me", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/password", editPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/add-bank-details", addBankDetails);

module.exports = router;
