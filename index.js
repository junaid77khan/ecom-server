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
// //   });

// import dotenv from "dotenv";
// import connectDB from "./src/db/index.js";
// import app from "./src/app.js";
// import Razorpay from "razorpay";
// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";

// import nodemailer from "nodemailer";

// dotenv.config();

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend's origin
//     credentials: true,
//   })
// );

// export const instance = new Razorpay({
//   key_id: "rzp_test_BmxEZzZl9QMupi",
//   key_secret: "ChsggKSAQkx7xs4hE0Fb37zh",
// });

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });

// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   auth: {
//     user: "sidanace@gmail.com",
//     pass: "mbcu smof nesr sjio",
//   },
// });

// app.post("/forget-password", (req, res) => {
//   const { username, email, password } = req.body;

//   const mailOptions = {
//     from: "sidanace@gmail.com",
//     to: "junaidk8185@gmail.com",
//     subject: "Admin Credentials",
//     text: ` These are your credentials to login the admin panel :you usernmae: ${username} ,  your email: ${email} ,  your Password: ${password}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return res
//         .status(500)
//         .send({ success: false, message: "Failed to send email", error });
//     }
//     res
//       .status(200)
//       .send({ success: true, message: "Credentials are sent to your email" });
//   });
// });

// const PORT = process.env.PORT || 8000;

// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.log("Error : ", error);
//       throw error;
//     });

//     app.listen(PORT, () => {
//       console.log(`Server is running at port : ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("MongoDB Connection Failed !!!...", err);
//   });
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import app from "./src/app.js";
import Razorpay from "razorpay";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import nodemailer from "nodemailer";
import { User } from "./src/models/user-model.js";

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
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "skpdecor3@gmail.com",
    pass: "keimcuasncotipab",
  },
});

app.post("/forget-password", async (req, res) => {
  const users = await User.find({});

  let admin;
  users.forEach((user) => {
    if(user.isAdmin) {
      admin = user;
    }
  })

  const mailOptions = {
    from: "skpdecor3@gmail.com",
    to: `${admin.email}`,
    subject: "Admin Credentials",
    text: `These are your credentials to login the admin panel:
    Username: ${admin.username},
    Email: ${admin.email},
    PassKey: ${process.env.SECURITY_PASSKEY}
    Enter this PassKey to login
   `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to send email", error });
    }
    res
      .status(200)
      .send({ success: true, message: "Credentials are sent to admin email" });
  });
});

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