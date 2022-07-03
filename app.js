// Allow assets directory listings
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/JohnCarWebsite'
const session = require("express-session");
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
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsMate = require("ejs-mate"); 
var Review = require("./models/review")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {storage, cloudinary} = require("./cloudinary/index")
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const multer = require("multer")
var moment = require("moment");
const upload = multer({storage})

main().catch(err => console.log(err))

async function main() {
        await mongoose.connect(dbUrl); //Does work 

}
var app = express();

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

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get("/", async (req, res) => {
  res.render("navigation/home.ejs")
})
app.get("/reviews", async(req, res) => {
  var allReviews = await (Review.find({}));
  

  res.render("navigation/review/index.ejs",{reviews:allReviews,moment:moment});
})
app.get("/reviews/new", async (req, res) => {
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
  var newReview = new Review(req.body);
  await newReview.save();
  res.redirect("reviews")
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
