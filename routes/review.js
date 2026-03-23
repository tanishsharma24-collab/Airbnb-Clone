const express = require("express");
const router = express.Router({mergeParams : true});

const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../joi.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validatReview ,loggedin ,isauthor }  = require("../middleware.js");

const reviewController = require("../controllers/review.js");


// reviews add krna
router.post("/", loggedin , validatReview ,reviewController.addReview);

//delete review
router.delete("/:reviewID", isauthor ,reviewController.destroyReview);

module.exports = router;


