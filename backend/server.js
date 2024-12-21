import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notification.route.js"
import connectDB from "./db/connectDB.js"
import cookieParser from "cookie-parser"
import cloudinary from "cloudinary"
import cors from 'cors'
import path from 'path'

dotenv.config()

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
})

const app = express()
const __dirname = path.resolve(); // after we deploy we need the path of this folder

const PORT = process.env.PORT || 5000; //uses the port number from .env file

app.use(cors({
    origin : 'http://localhost:3000', // mentioning which are the origins to be allowed
                            // so we are mentioning the origin of our frontend
    credentials : true                        
}))
app.use(express.json({ 
    limit: "5mb"  // default value will be 100kb
})) 
app.use(cookieParser())
app.use(express.urlencoded({
    extended : true
}))

app.use('/api/auth', authRoute)
app.use('/api/users',userRoute)
app.use('/api/posts',postRoute)
app.use('/api/notifications',notificationRoute)

/* in development phase we start backend and frontend separately but in production we have
   to start it together so we are writing this */

   if(process.env.NODE_ENV === "production") {
    /* the build folder will contain a single file which contains all our js and css code of our frontend
      so we are changing that folder into static */

    app.use(express.static(path.join(__dirname,'/frontend/build'))) 
    
    /* if the user gives some other route the req then we have to redirect to the home page
       which is nothing but index.html */

    app.use("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","build","index.html"))
    })
   }

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`) //callback function to confirm server is running
    connectDB() //connecting to MONGODB
})