import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL) // URL in env file provided by Mongo atlas
        console.log("MongoDB connected")
    } catch (error) {
        console.log(`Error in connectDB ${error}`)
        process.exit(1) //incase if mongoDB not connected the whole server stops.1=true
    }
}

export default connectDB