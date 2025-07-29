const Course = require("../../models/Courses/Course");
const Registration = require("../../models/Courses/StudentRegistration");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/async");

// @desc    Get all registrations
// @route   GET /api/v1/registrations
// @route   GET /api/v1/courses/:courseId/registrations
// @access  Private/Admin
exports.getRegistrations = asyncHandler(async (req, res, next) => {
  if (req.params.courseId) {
    const registrations = await Registration.find({
      course: req.params.courseId,
    })
      .populate("user", "name email")
      .populate("course", "title");

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single registration
// @route   GET /api/v1/registrations/:id
// @access  Private/Admin
exports.getRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .populate("user", "name email")
    .populate("course", "title description");

  if (!registration) {
    return next(
      new ErrorResponse(
        `Registration not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: registration,
  });
});

// @desc    Register for a course
// @route   POST /api/v1/courses/:courseId/register
// @access  Public
exports.registerCourse = asyncHandler(async (req, res, next) => {
  // Add course to req.body
  console.log(req.params);
  req.body.course = req.params.id;

  // Add user to req.body if logged in
  if (req.user) {
    req.body.user = req.user.id;
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `Course not found with id of ${req.params.courseId}`,
        404
      )
    );
  }

  // Check if registration is open
  const now = new Date();
  if (now < course.registrationStart || now > course.registrationEnd) {
    return next(
      new ErrorResponse(
        `Registration is not currently open for this course`,
        400
      )
    );
  }

  // Check if seats are available
  const registrationsCount = await Registration.countDocuments({
    course: req.params.courseId,
    status: { $in: ["pending", "approved"] },
  });

  if (registrationsCount >= course.seats) {
    return next(new ErrorResponse(`No seats available for this course`, 400));
  }

  // Calculate price (apply discount if available)
  const isDiscountActive = new Date() < course.discountEnd;
  req.body.paymentAmount = isDiscountActive
    ? course.price
    : course.originalPrice;

  const registration = await Registration.create(req.body);

  res.status(201).json({
    success: true,
    data: registration,
  });
});

// @desc    Update registration status
// @route   PUT /api/v1/registrations/:id/status
// @access  Private/Admin
exports.updateRegistrationStatus = asyncHandler(async (req, res, next) => {
  let registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(
      new ErrorResponse(
        `Registration not found with id of ${req.params.id}`,
        404
      )
    );
  }

  registration = await Registration.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: registration,
  });
});

// @desc    Update payment status
// @route   PUT /api/v1/registrations/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  let registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(
      new ErrorResponse(
        `Registration not found with id of ${req.params.id}`,
        404
      )
    );
  }

  const updateData = {
    paymentStatus: req.body.paymentStatus,
  };

  if (req.body.paymentStatus === "paid") {
    updateData.paymentDate = Date.now();
  }

  registration = await Registration.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: registration,
  });
});

// @desc    Delete registration
// @route   DELETE /api/v1/registrations/:id
// @access  Private/Admin
exports.deleteRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(
      new ErrorResponse(
        `Registration not found with id of ${req.params.id}`,
        404
      )
    );
  }

  await registration.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
