// import express from "express";

// import bodyParser from "body-parser";
// import fast2sms from "fast2sms";
// import dotenv from "dotenv";

// const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));

// dotenv.config();

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });
// app.post("/sendmessage", (req, res) => {
//   sendMessage(req.body.number);
// });

// async function sendMessage(number, res) {
//   let options = {
//     authorization: process.env.FAST2SMS_KEY,
//     message: `This is a test message`,
//     number: [number],
//   };

//   fast2sms
//     .sendMessage(options)
//     .then((response) => {
//       res.send("sms otp code sucesss");
//     })
//     .catch((error) => {
//       res.send("sms otp code failure");
//     });
//   console.log(options);
// }
