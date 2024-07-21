import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "dotenv";
import paymentRoute from "./routes/PaymentRoute.js";
const app = express();
console.log("cors");

const corsConfig = {
  origin: "http://localhost:7000",
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
};
console.log("cors1");

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

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: 'rzp_test_BmxEZzZl9QMupi' })
);

app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cart", cartRouter);

export default app;
