if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*60*60,
})
store.on("error",()=>{
  console.log("error in mongo session store",err);
})


const sessionOption = {
  store:store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false, 
  cookie: {
    expires:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: 7*24*60*60*1000, 
  },
};

app.use(methodOverride("_method"));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

// MongoDB Connection
async function main() {
  await mongoose.connect(dbUrl);

}
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success= req.flash("success");
  res.locals.error= req.flash("error");
  res.locals.currUser= req.user;
  next();
})
// app.get("/", (req, res) => {
//   req.session.user = "yash";
//   res.send("I am root");
// })
// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email:"yash@gmail.com",
//     username:"yash",
//   });
//  let registeredUser =  await User.register(fakeUser,"yash");
//  res.send(registeredUser);

// })
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

// Test route to insert sample listing (optional)
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the ocean",
//         price: 10000,
//         location: "Goa",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Sample listing saved successfully");
// });

// ✅ Catch-all route - MUST be after all other routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ✅ Error handling middleware - MUST be after catch-all route
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
