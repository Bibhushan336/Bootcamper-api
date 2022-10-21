const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");
const { countDocuments } = require("../models/Bootcamp");
const advancedResults = require("../middlewares/advanceResults");

//@desc     Get All Bootcamps
//@route    GET /api/v1/bootcamps
//@acess    Public
exports.getBootcamps = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    next(error);
  }
};

//@desc     Get Single Bootcamp
//@route    GET /api/v1/bootcamps/:id
//@acess    Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          ` Bootcamp not found with the id of ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    // res.status(400).json({ success: false });
    // next(
    //   new ErrorResponse(
    //     ` Bootcamp not found with the id of ${req.params.id}`,
    //     404
    //   )
    // );
    next(error);
  }
};

//@desc     Create new Bootcamp
//@route    POST /api/v1/bootcamps
//@acess    Private
exports.createBootcamp = async (req, res, next) => {
  try {
    // Add  user to req.body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} has alread publised a bootcamp`,
          400
        )
      );
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc     Update Bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@acess    Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          ` Bootcamp not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    // Makes sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to update this bootcamp`,
          400
        )
      );
    }

    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc     Get Bootcamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@acess    Public

exports.getBootcampsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    // Get latitude/longitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of earth
    // Earth Radius = 3,963 mi / 6,378 km

    const radius = distance / 6378;

    const bootcamps = await Bootcamp.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (error) {
    next(error);
  }
};

//@desc     Delete Bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@acess    Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          ` Bootcamp not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    // Makes sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to delete this bootcamp`,
          400
        )
      );
    }

    bootcamp.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

//@desc     Upload image for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@acess    Private
exports.bootcampPhotoUpload = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id, req.body);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          ` Bootcamp not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    // Makes sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          ` The user with the id of ${req.user.id} is unauthorized to upload photo to this bootcamp`,
          400
        )
      );
    }

    if (!req.files) {
      return next(
        new ErrorResponse(
          ` Please upload the file image for the Bootcamp ${req.params.id}`,
          404
        )
      );
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith("image")) {
      return next(
        new ErrorResponse(
          ` Please upload an image file type for bootcamp ${req.params.id}`,
          404
        )
      );
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          ` Please upload an image file less than ${process.env.MAX_FILE_UPLOAD} bytes`,
          404
        )
      );
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(` Problem with file upload`, 500));
      }
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
      res.status(200).json({ success: true, dara: file.name });
    });
  } catch (error) {
    next(error);
  }
};
