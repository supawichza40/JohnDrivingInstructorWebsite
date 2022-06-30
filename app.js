var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsMate = require("ejs-mate"); 
var Review = require("./models/review")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
var moment = require("moment");

main().catch(err => console.log(err))

async function main() {
        await mongoose.connect('mongodb://127.0.0.1:27017/JohnCarWebsite'); //Does work 

}
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine("ejs",ejsMate)

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get("/", async (req, res) => {
  res.send("This is a home page.")
})
app.get("/reviews", async(req, res) => {
  var allReviews = await (Review.find({}));
  

  res.render("navigation/review/index.ejs",{reviews:allReviews,moment:moment});
})
app.get("/reviews/:id", async (req, res) => {
  var getReviewById = await (Review.findById(req.params.id))
  res.render("navigation/review/detail.ejs",{review:getReviewById,moment:moment})
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


app.listen(3000, () => {
  console.log("Listening to port 3000")
})

module.exports = app;
