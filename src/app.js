import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "dotenv";
import paymentRoute from "./routes/PaymentRoute.js";
const app = express();

const corsConfig = {
  origin: [
    "https://admin.skpdecor.co.in",
    "https://skpdecor.co.in",
    "https://server.skpdecor.co.in",
    "http://localhost:7000",
    "http://localhost:5173",
    "https://decor-candle-admin.vercel.app",
    "https://decor-candle.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
};

app.use(cors(corsConfig));

// accept json format data
app.use(express.json({ limit: "50000kb" }));

// url encoding
app.use(express.urlencoded({ extended: true, limit: "50000kb" }));

// for files at server
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api", paymentRoute);

import categoryRouter from "./routes/category.route.js";
import ProductRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cartRouter from "./routes/cart.route.js";
import reviewRouter from "./routes/review.route.js";
import couponRouter from "./routes/coupon.route.js";
import messageRouter from "./routes/message.route.js";
import orderRouter from "./routes/order.route.js";

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.KEY_ID })
);

app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/order", orderRouter);

export default app;
