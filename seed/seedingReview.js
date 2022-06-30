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
                url: "https://www.5day.co.uk/wp-content/uploads/2022/06/IGeorge-bright-ipswich-28th-jpg-250x250.jpg?x14073",
                filename:"passedTest"
            },
            createdOn: new Date()
        })
        await newReview.save();

    }
    console.log("done!");
}
seedReview();