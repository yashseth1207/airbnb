const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema,reviewSchema  } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user);
    
  if (!req.isAuthenticated()) {
    req.session.redirectUrl= req.originalUrl
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login"); 
  }
  next(); 
};

module.exports.saveRedirectUrl=(req, res, next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner=async(req, res, next) => {
      const { id } = req.params;
  let listing = await Listing.findById(id);
    if( res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","You don't have permission to edit");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); // Use `errMsg` here, not the entire error object
  }
  else{
    next();
}
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); // Use `errMsg` here, not the entire error object
  }
  else{
    next();
}
};


module.exports.isReviewAuthor=async(req, res, next) => {
      const { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if( res.locals.currUser && !review.author.equals(res.locals.currUser._id)){
      req.flash("error","You are not the author of this review");
      return res.redirect(`/listings/${id}`);
    }
    next();
}
