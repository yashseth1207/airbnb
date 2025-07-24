const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/WrapAsync.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')

const {storage}= require("../cloudConfig.js")
const upload = multer({ storage })

// Root route: list + create
router
  .route("/")
  .get(wrapAsync(listingController.getAllListings))
  .post(isLoggedIn,upload.single("listing[image]"),validateListing,  wrapAsync(listingController.createListing)); 
  //validateListing, add karna hai abhi 
 

// New listing form
router.get("/new", isLoggedIn, listingController.renderCreateForm);

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Group GET, PUT, DELETE for /:id
router
  .route("/:id")
  .get(wrapAsync(listingController.getSingleListing))
  .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
