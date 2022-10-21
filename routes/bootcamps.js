const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

const advancedResults = require("../middlewares/advanceResults");

// Incude other resource router
const courseRouter = require("./course");
const reviewRouter = require("./review");

const router = express.Router();

// Protect Middleware
const { protect, authorize } = require("../middlewares/auth");

// Re-route into other routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter); 

router.get("/", advancedResults(Bootcamp, "courses"), getBootcamps);

// router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps);

router.get("/:id", getBootcamp);

router.post("/", protect, authorize('publisher', 'admin'), createBootcamp);

router.put("/:id", protect,authorize('publisher', 'admin'), updateBootcamp);

router.put("/:id/photo", protect,authorize('publisher', 'admin'), bootcampPhotoUpload);

router.get("/radius/:zipcode/:distance", getBootcampsInRadius);

router.delete("/:id", protect, authorize('publisher', 'admin'), deleteBootcamp);

/* 
    router.route("/").get(getBootcamps).post(createBootcamp);
*/

module.exports = router;
