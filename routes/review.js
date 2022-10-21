const express = require("express");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");

const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middlewares/advanceResults");
const { protect, authorize } = require("../middlewares/auth");

// router
//   .route("/")
//   .get(
//     advancedResults(Review, {
//       path: "bootcamp",
//       select: "name description",
//     }),
//     getReviews
//   )
//   .post(protect, authorize("user", "admin"), addReview);

// router
//   .route("/:id")
//   .get(getReview)
//   .put(protect, authorize("user", "admin"), updateReview)
//   .delete(protect, authorize("user", "admin"), deleteReview);


router.get(
  "/",
  advancedResults(Review, { path: "bootcamp", select: "name description" }),
  getReviews
);

router.get('/:id', getReview);

router.post('/', protect, authorize("user", "admin"), addReview);

router.put('/:id', protect, authorize("user", "admin"), updateReview);

router.delete('/:id', protect, authorize("user", "admin"), deleteReview);

module.exports = router;
