const Course = require("../../models/Courses/Course");
const Registration = require("../../models/Courses/StudentRegistration");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/async");

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find().sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:slug
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({ slug: req.params.slug });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with slug of ${req.params.slug}`, 404)
    );
  }

  // Check if discount is active
  const isDiscountActive = new Date() < course.discountEnd;
  const discountPercentage = isDiscountActive
    ? Math.round(
        ((course.originalPrice - course.price) / course.originalPrice) * 100
      )
    : 0;

  const daysUntilDiscountEnd = isDiscountActive
    ? Math.ceil((course.discountEnd - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const response = {
    ...course._doc,
    isDiscountActive,
    discountPercentage,
    daysUntilDiscountEnd,
  };

  res.status(200).json({
    success: true,
    data: response,
  });
});

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private/Admin
exports.createCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Admin
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Admin
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
