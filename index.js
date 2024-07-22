// import dotenv from "dotenv";
// import connectDB from "./src/db/index.js";
// import app from "./src/app.js";
// import Razorpay from "razorpay";
// import bodyParser from "body-parser";
// import fast2sms from "fast-two-sms";
// import cors from "cors";
// import { response } from "express";
// import express from "express";
// import { v4 as uuidv4 } from "uuid";

// dotenv.config();

// dotenv.config({
//   path: "./.env",
// });

// // Log the environment variables to verify they are loaded correctly

// export const instance = new Razorpay({
//   key_id: "rzp_test_BmxEZzZl9QMupi",
//   key_secret: "ChsggKSAQkx7xs4hE0Fb37zh",
// });

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });

// app.use(express.json());
// app.use(cors());
// const otps = {}; // In-memory storage for OTPs

// app.post("/send-otp", async (req, res) => {
//   const { phone } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
//   const otpId = uuidv4();
//   otps[otpId] = { phone, otp, createdAt: Date.now() };

//   const options = {
//     authorization:
//       "PjzLOAVD3fElsJ1TevUuq5moR6dKC9YSNWpGcX8B0rkwiyaH4Qk0PmBjbcYpnhoAvGQN7eK8UXVfWIl9",
//     message: `Your OTP is ${otp}`,
//     numbers: [phone],
//   };

//   try {
//     const response = await fast2sms.sendMessage(options);
//     res.status(200).json({ otpId, response });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/verify-otp", (req, res) => {
//   const { otpId, otp } = req.body;
//   const storedOtp = otps[otpId];

//   if (!storedOtp) {
//     return res.status(400).json({ error: "Invalid OTP ID" });
//   }

//   const currentTime = Date.now();
//   const otpAge = currentTime - storedOtp.createdAt;

//   if (otpAge > 5 * 60 * 1000) {
//     // OTP is valid for 5 minutes
//     delete otps[otpId];
//     return res.status(400).json({ error: "OTP has expired" });
//   }

//   if (storedOtp.otp === parseInt(otp, 10)) {
//     delete otps[otpId];
//     res.status(200).json({ message: "OTP verified successfully" });
//   } else {
//     res.status(400).json({ error: "Invalid OTP" });
//   }
// });

// const PORT = process.env.PORT || 8000;

// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.log("Error : ", error);
//       throw error;
//     });

//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server is running at port : ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("MongoDB Conntection Failed !!!...", err);
//   });

import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import app from "./src/app.js";
import Razorpay from "razorpay";
import express from "express";
import cors from "cors";

dotenv.config();

export const instance = new Razorpay({
  key_id: "rzp_test_BmxEZzZl9QMupi",
  key_secret: "ChsggKSAQkx7xs4hE0Fb37zh",
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.use(express.json());
app.use(cors());




const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error : ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed !!!...", err);
  });
