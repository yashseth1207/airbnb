const Listing = require("../models/listing.js");

// Show all listings (Index)
module.exports.getAllListings = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// Render form to create new listing
module.exports.renderCreateForm = (req, res) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a listing!");
        return res.render("users/login");
    }
    res.render("listings/new");
};

// Create a new listing
module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image= {url,filename};
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl =  listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit", { listing,originalImageUrl });
};

// Show a single listing
module.exports.getSingleListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
        
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
};


module.exports.updateListing=async (req, res) => {

    const { id } = req.params;
    let listing=  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image= {url,filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  }

 module.exports.destroyListing = async (req, res) => {
      const { id } = req.params;
      const deletedListing = await Listing.findByIdAndDelete(id);
      if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
      }
      console.log(deletedListing);
      req.flash("success", "Listing Deleted!");
      res.redirect("/listings");
    }