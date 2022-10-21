const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const advancedResults = require("../middlewares/advanceResults");


//@desc     Get Users
//@route    Get /api/v1/atuh/users
//@acess    Private/Admin

exports.getUsers = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    next(error);
  }
};

//@desc     Get Single User
//@route    Get /api/v1/auth/users/:id
//@acess    Private/Admin

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(
          ` User not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Create User
//@route    POST /api/v1/auth/users
//@acess    Private Admin Acess

exports.createUser = async (req, res, next) => {
  try {
    // Create user
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Update User
//@route    Put /api/v1/auth/users/:id
//@acess    Private Admin Acess

exports.updateUser = async (req, res, next) => {
  try {
    // Create user
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          ` User not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//@desc     Delete User
//@route    DELETE /api/v1/auth/users/:id
//@acess    Private Admin Acess

exports.deleteUser = async (req, res, next) => {
  try {
    // Create user
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(
          ` User not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) { 
    next(error);
  }
};
