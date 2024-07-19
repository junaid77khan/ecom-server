import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express()

const corsConfig = {
<<<<<<< HEAD
    // origin: `${process.env.CORS_ORIGIN}`,

    origin: 'http://localhost:7000',

=======
    origin: 'https://ecom-candle-decor.vercel.app',
>>>>>>> 8ade00af9cbdd11b2d416043acc3f189cda8b243
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"]
}; 

app.use(cors(corsConfig));

// accept json format data
app.use(express.json({limit: "50000kb"}))

// url encoding
app.use(express.urlencoded({extended: true, limit: "50000kb"}))

// for files at server
app.use(express.static("public"))
app.use(cookieParser())

import categoryRouter from "./routes/category.route.js"
import ProductRouter from './routes/product.route.js';
import userRouter from './routes/user.route.js';
import cartRouter from "./routes/cart.route.js";

app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cart", cartRouter);

export default app