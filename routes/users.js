const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const User = require("../models/User");

const router = express.Router();

// Protect Middleware
const { protect, authorize } = require("../middlewares/auth");
const advancedResults = require("../middlewares/advanceResults");

router.use(protect);
router.use(authorize("admin"));

router.get("/", advancedResults(User), getUsers);

router.get("/:id", getUser);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
