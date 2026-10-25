const express = require("express");
const router = express.Router();

const ExpressError = require("../utils/ExpressError");
const { listingSchema , reviewSchema } = require("../joi.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const { loggedin, isowner , validatListing }  = require("../expressMiddleware.js");

const listingController = require("../controllers/listing.js");

//image uplod ka liya mmullter use kiya file 
// data parsing kiya dastenation uploads mai 
const multer  = require('multer')

// storage mera dastenation hai cloud mai kha upload kar rha hu
const {storage} = require("../cloudConfig.js");
const upload = multer({  storage })
 

// SAME PATH PAR (INDEX OR CREATE) REQUEST
//  AA RHI HAI TO UNHI ROUTER.ROUTE("/") SA COMBINED KAR DIYA
router.route("/")
        .get(wrapAsync(listingController.index))

        //upload.single('listing[image][url]')-->data(file) ko 
        // cloud mai stor krayga yha sa ham link ko nikalka mogodb ami stor kraynga
        // upload.single('listing[image][url]'->image ko cloudnary par stor krayaga 
        .post( loggedin,validatListing , upload.single('listing[image][url]'),
        
        wrapAsync(listingController.createNewListing)
);
 // NEW FORM
router.get("/new", loggedin ,listingController.renderNewForm);

// SHOW , UPDATE OR DELETE request
router.route("/:id")
        //all listings ko show krna 
        .get(wrapAsync (listingController.showListing))
        //listing ko update krna 
        .put(loggedin,isowner, upload.single('listing[image][url]') , validatListing ,wrapAsync(listingController.updateListing))
        //listing ko delete krna 
        .delete(loggedin,isowner, wrapAsync(listingController.destroyListing))

// EDIT ROUTE(EDIT FORM KHOLNA KA LIYA)
router.get("/:id/edit",loggedin , isowner ,wrapAsync(listingController.editFormRender));

module.exports = router;

