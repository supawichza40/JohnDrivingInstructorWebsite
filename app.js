// Allow assets directory listings
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport")
const methodOverride = require("method-override");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')
const session = require("express-session");
const cookieSession = require("cookie-session")
const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/JohnCarWebsite'


const sessionConfig = {
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
    cookie: {
        //so the expire is use if expire reach user will be force to log out.
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//Expire a week from now.
        maxAge: 1000 * 60 * 60 * 24 * 7

    },
    store: MongoStore.create({
        
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 *60
    })
}
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsMate = require("ejs-mate"); 
var Review = require("./models/review")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {storage, cloudinary} = require("./cloudinary/index")
const multer = require("multer")
var moment = require("moment");
const upload = multer({storage})

main().catch(err => console.log(err))

async function main() {
        await mongoose.connect(dbUrl); //Does work 

}
const userSchema = new mongoose.Schema({
    googleId: String,
  userName: String,
    reviewCount:Number
});
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

var app = express();
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SECRET]
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride("_method"))
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id, userName:profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});
const isLoggedIn = function (req, res, next) {
    if (req.user != null) {
        next();
    }
    else {
        res.redirect("/auth/google")
    }
}
const isAllowToReview = async (req, res, next) => {
  var numOfReview = await (Review.find({ user: req.user.googleId }));
  if (numOfReview.length <= 0||req.user.googleId=="109777615214421584143") {
    next();
  }
  else {
    res.redirect("/reviews")
  }
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session(sessionConfig));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine("ejs",ejsMate)
app.use((req, res, next) => {
  res.locals.test = "test";
  res.locals.currentUser = req.user||"";
    next();
})
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get("/", async (req, res) => {
  console.log(req.user)
  res.render("navigation/home.ejs")
})
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt:"select_account"
}));
app.get("/auth/google/redirect", passport.authenticate("google"), function (req, res) {
    res.redirect("/")
});
app.get("/auth/logout", (req, res) => {
  req.logout();
  req.session = null;
  res.redirect("/")
  
})
app.get("/reviews", async (req, res) => {
  var allReviews = await (Review.find({}));
  

  res.render("navigation/review/index.ejs",{reviews:allReviews,moment:moment});
})
app.get("/reviews/new", isLoggedIn,isAllowToReview, async (req, res) => {

  res.render("navigation/review/new.ejs")
})
app.get("/reviews/:id", async (req, res) => {
  var getReviewById = await (Review.findById(req.params.id))
  res.render("navigation/review/detail.ejs",{review:getReviewById,moment:moment})
})
app.post("/reviews",upload.array("image"), async (req, res) => {
  console.log(req.body)
  req.body.createdOn = new Date();
  var picInfo = req.files.map(file => ({ url: file.path, filename: file.filename }))
  if (picInfo.length > 0) {
      req.body.image = picInfo[0];
  }
  else {
    req.body.image = {
      url: "https://res.cloudinary.com/kingofgodz/image/upload/v1656624909/JohnDrivingInstructorWebsite/1665px-No-Image-Placeholder.svg_knnyh9.png",
      filename:"JohnDrivingInstructorWebsite/1665px-No-Image-Placeholder.svg_knnyh9.png"
    }
  }
  req.body.user = req.user.googleId;
  var newReview = new Review(req.body);
  console.log(req.user.reviewCount)
  await newReview.save();
  res.redirect("reviews")
})
app.delete("/reviews/:id", async (req, res) => {
  console.log("delete route")
  var deletedReview = await Review.findByIdAndDelete(req.params.id);
  console.log(deletedReview)
  await(cloudinary.uploader.destroy(deletedReview.image.filename))
  res.redirect("/reviews")
})
app.get("/contact", async (req, res) => {
  res.render("navigation/contact/index.ejs")
})
app.get("/gallery", async(req, res) => {
  var allReviews = await (Review.find({}));

  res.render("navigation/gallery.ejs",{reviews:allReviews})
})
app.get("/map", (req, res) => {
  var google_api = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API}&callback=initMap`
  res.render("navigation/map.ejs",{google_api:google_api})
})
app.get("/area_cover", (req, res) => {
  res.render("navigation/area_cover.ejs")
})
app.get("/prices", (req, res) => {
  res.render("navigation/price.ejs")
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('partials/error.ejs');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})

module.exports = app;
