const mongoose = require("mongoose");
const Review = require("../models/review")
main().catch(err => console.log(err))

async function main() {
        await mongoose.connect('mongodb://127.0.0.1:27017/JohnCarWebsite'); //Does work 

}
const seedReview = async () => {
    await Review.deleteMany({});
    for (let index = 0; index < 5; index++){
        const newReview = new Review({
            title: "Test",
            description: "This is a description",
            author:"Test Author",
            image: {
                url: "https://picsum.photos/600/400",
                filename:"passedTest"
            },
            createdOn: new Date()
        })
        await newReview.save();
        

    }
    console.log("done!");
}
seedReview();