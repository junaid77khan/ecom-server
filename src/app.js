import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express()

const corsConfig = {
    origin: `${process.env.CORS_ORIGIN}`,
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

export default app