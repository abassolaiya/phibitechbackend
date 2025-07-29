const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a course title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  image: {
    type: String,
    default: "no-photo.jpg",
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  originalPrice: {
    type: Number,
    required: [true, "Please add the original price"],
  },
  discountEnd: {
    type: Date,
    required: [true, "Please add discount end date"],
  },
  duration: {
    type: String,
    required: [true, "Please add course duration"],
  },
  level: {
    type: String,
    required: [true, "Please add course level"],
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  seats: {
    type: Number,
    required: [true, "Please add available seats"],
  },
  startDate: {
    type: Date,
    required: [true, "Please add start date"],
  },
  registrationStart: {
    type: Date,
    required: [true, "Please add registration start date"],
  },
  registrationEnd: {
    type: Date,
    required: [true, "Please add registration end date"],
  },
  modules: {
    type: [String],
    required: [true, "Please add course modules"],
  },
  features: [
    {
      icon: String,
      text: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create course slug from the title
CourseSchema.pre("save", function (next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
