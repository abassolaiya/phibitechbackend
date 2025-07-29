const asyncHandler = require("express-async-handler");
const User = require("../../models/users/Author");
const generateToken = require("../../utils/generateUserToken");
const cloudinary = require("../../utils/cloudinary");
const TokenBlacklist = require("../../models/users/tokenBlackListModel");
const { sendEmail } = require("../../utils/mailing");

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    console.log("user", token);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      phoneNumber: user.phoneNumber,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, username, phoneNumber, email, password, referralId } =
      req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }, { username }],
    });

    if (existingUser) {
      let errorMessage = "This ";

      if (existingUser.email === email) {
        errorMessage += "email";
      } else if (existingUser.username === username) {
        errorMessage += "Username";
      } else {
        errorMessage += "phone number";
      }

      errorMessage += " is already in use. Please use a different one.";
      console.log(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    let avatar;
    let coverPhoto;

    // Update avatar
    if (req.files && req.files.avatar) {
      const avatarResult = await cloudinary(req.files.avatar[0].path);
      avatar = avatarResult.secure_url;
    }

    // Update coverPhoto
    if (req.files && req.files.coverPhoto) {
      const coverPhotoResult = await cloudinary(req.files.coverPhoto[0].path);
      coverPhoto = coverPhotoResult.secure_url;
    }

    const newUser = await User.create({
      name,
      username,
      phoneNumber,
      email,
      password,
      referralId,
      avatar,
      coverPhoto,
    });

    if (!newUser) {
      return res.status(400).json({ error: "Failed to create user" });
    }

    const token = generateToken(newUser._id);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      coverPhoto: newUser.coverPhoto,
      phoneNumber: newUser.phoneNumber,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error: Failed to register user" });
  }
});

const logoutUser = async (req, res) => {
  if (res.cookie) {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } else {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const isTokenBlacklisted = await TokenBlacklist.findOne({ token });

      if (!isTokenBlacklisted) {
        await TokenBlacklist.create({ token });
      }
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      wallet: user.wallet,
      bankCode: user.bankCode,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.name) {
      user.name = req.body.name;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.phoneNumber) {
      user.phoneNumber = req.body.phoneNumber;
    }
    if (req.body.username) {
      user.username = req.body.username;
    }
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }
    if (req.body.coverPhoto) {
      user.coverPhoto = req.body.coverPhoto;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
      coverPhoto: updatedUser.coverPhoto,
      wallet: updatedUser.wallet,
      bankCode: updatedUser.bankCode,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const editPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (!(await user.matchPassword(req.body.currentPassword))) {
      res.status(401);
      throw new Error("Invalid current password");
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of the password for your account.\r\n
    Please click on the following link, or paste this into your web browser to complete the process:\r\n
    ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(500).json({ message: "Email could not be sent" });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = req.params.resetToken;

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({
    message: "Password reset successfully",
  });
});

const addBankDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.bankCode = req.body.bankCode;
    user.accountNumber = req.body.accountNumber;

    await user.save();

    res.json({
      message: "Bank details added successfully",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  editPassword,
  forgotPassword,
  resetPassword,
  addBankDetails,
};
