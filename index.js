
import dotenv from 'dotenv'
import connectDB from './src/db/index.js'
import app from './src/app.js'

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    
    app.on("error", (error) => {
        console.log("Error : ", error);
        throw error        
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })    
})
.catch((err) => {
    console.log("MongoDB Conntection Failed !!!...", err);
})