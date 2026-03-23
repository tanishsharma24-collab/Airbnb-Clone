const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.addReview = async (req, res) => {

  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.send("Listing not found");
  }

  let newReview = new Review(req.body.review);


  if (!listing.reviews) {
    listing.reviews = [];
  }

  newReview.author = req.user._id;

  listing.reviews.push(newReview._id);

  await newReview.save();
  await listing.save();

  console.log("review saved");

   req.flash("succes" , "REVIEW ADDED SUCCESFULLY");

  res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async (req, res) => {

    let { id, reviewID } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });

    await Review.findByIdAndDelete(reviewID);

     req.flash("succes" , "REVIEW DELETED SUCCESFULLY");

    res.redirect(`/listings/${id}`);
}