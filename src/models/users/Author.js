const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AuthorSchema = new mongoose.Schema({
  // googleId: {
  //   type: String,
  //   unique: true,
  //   sparse: true,
  // },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  referralId: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: "",
  },
  coverPhoto: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  wallet: {
    type: Number,
    default: 0,
  },
  bankCode: {
    type: String,
    default: "",
  },
  accountNumber: {
    type: String,
    default: "",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  dateJoined: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before save
AuthorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password
AuthorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset token
AuthorSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

  return resetToken;
};

module.exports = mongoose.model("Author", AuthorSchema);
