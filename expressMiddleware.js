const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
 const {listingSchema, reviewSchema} = require("./joi.js");
const Review = require("./models/review.js");


//user login hai ki nhi 
module.exports.loggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //login ka bad ham /listings par  aa rha tha but hum to listing add krna
        //  aaya tha  to REQ.ORIGNALURL hmara path stor krayaga login page sa phla ka
        req.session.redirectUrl = req.originalUrl;
        //but session path ko tampraly stor krata hai to path undefined aayaga to ham middlewere creat krka locals mai stor krayannga

        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveUrl = (req, res, next) => {
    res.locals.redirectUrl = req.session.redirectUrl || "/listings";
    next();
};

//kya mera currUser  owner(vhi hai jisna listing creat kiya tha) hai
module.exports.isowner = async(req,res,next)=>
{
   let {id} =  req.params;
   let listing = await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id))
   {
    req.flash("error","you are not owner of this listing");
   return res.redirect(`/listing/${id}`);
   }

   next();
}


module.exports.validatListing = async(req,res,next)=>
{
     let {error} =  listingSchema.validate(req.body);
   if(error)
   {
    throw new ExpressError(400,error.details[0].message);
   }
   else{
    next();
   }
}



module.exports.validatReview = (req,res,next)=>
{
     let {error} =  reviewSchema.validate(req.body);
   if(error)
   {
    throw new ExpressError(400,error.details[0].message);
   }
   else{
    next();
   }
}


//kya review ko delete krna wala iska author(vhi hai jisna review addd kiya tha) hai?
module.exports.isauthor = async (req, res, next) => {
    let { id , reviewID } = req.params;

    let review = await Review.findById(reviewID);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    //  yaha change
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
