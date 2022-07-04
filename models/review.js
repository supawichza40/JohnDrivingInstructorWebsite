const mongoose = require("mongoose")
const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    author: {
        type: String,
        required:true
    },
    createdOn: {
        type: Date,
        required:true
    },
    image: {
        url: {
            type:String
        },
        filename: {
            type:String
        }
        
    },
    user: {
        type:String
    }

})
module.exports = new mongoose.model("Review", reviewSchema);