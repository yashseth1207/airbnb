const express = require("express");
const router = express.Router();
const passport = require("passport");
const WrapAsync = require("../utils/WrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user.js");

// Signup Routes
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(WrapAsync(userController.signupUser));

// Login Routes
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginUser
  );

// Logout Route
router.get("/logout", userController.logoutUser);

module.exports = router;
