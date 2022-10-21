const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course");

const Course = require("../models/Course");

const advancedResults = require("../middlewares/advanceResults");

const router = express.Router({ mergeParams: true });

// Protect Middleware
const { protect, authorize } = require("../middlewares/auth");

router.get(
  "/",
  advancedResults(Course, {
    path: "bootcamp",
    select: "name description",
  }),
  getCourses
);

router.get("/:id", getCourse);

router.post("/", protect, authorize('publisher', 'admin'), createCourse);

router.put("/:id", protect, authorize('publisher', 'admin'), updateCourse);

router.delete("/:id",protect, authorize('publisher', 'admin'), deleteCourse);

/* 
    router.route("/").get(getBootcamps).post(createBootcamp);
*/

module.exports = router;
