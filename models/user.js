const mongoose = require("mongoose");
const passport = require("passport");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const userSchema = new mongoose.Schema({
  googleId: String,
  userName:String,
})
userSchema.plugin(GoogleStrategy);
module.exports = new mongoose.model("User", userSchema);