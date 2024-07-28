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