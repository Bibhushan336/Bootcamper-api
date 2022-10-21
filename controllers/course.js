const ErrorResponse = require("../utils/errorResponse");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middlewares/advanceResults");

//@desc     Get All Courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@acess    Public
exports.getCourses = async (req, res, next) => {
  try {
    if (req.params.bootcampId) {
      const courses = await Course.find({ bootcamp: req.params.bootcampId });

      return res
        .status(200)
        .json({ success: true, count: courses.length, data: courses });
    } else {
      res.status(200).json(res.advancedResults);
    }
  } catch (error) {
    next(error);
  }
};

//@desc     Get One Course
//@route    GET /api/v1/courses/:id
//@acess    Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "bootcamp",
      select: "name description",
    });
    if (!course) {
      return next(
        new ErrorResponse(
          ` Course not found with the id of ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

//@desc     Create Course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@acess    Private

exports.createCourse = async (req, res, next) => {
  try {
    req.body.bootcamp = req.params.bootcampId;

    // Add  user to req.body
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          ` bootcamp not found with the id of ${req.params.bootcampId}`,
          404
        )
      );
    }

    // Makes sure user is course owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to add a course to this bootcamp ${bootcamp._id}`,
          400
        )
      );
    }

    const course = await Course.create(req.body);

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

//@desc     Update Course
//@route    PUT /api/v1/courses/:id
//@acess    Private
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return next(
        new ErrorResponse(
          ` Course not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    // Makes sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to update a course of this bootcamp ${course._id}`,
          400
        )
      );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    course.save();

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

//@desc     Delete Course
//@route    DELETE /api/v1/courses/:id
//@acess    Private
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(
          ` Course not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    // Makes sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to delete this course ${course._id}`,
          400
        )
      );
    }

    await course.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
