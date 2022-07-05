if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({path:__dirname+"/.env"});

}
const { custom } = require("joi");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD
    }
});


const sendMessage = function (customerEmail,subject,text) {
    
    var mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: customerEmail,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMessage