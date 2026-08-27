import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Connected to Database'));
        await mongoose.connect(process.env.MONGODB_URI, {
            });
    } catch (error) {
        console.error('Error connecting to Database:', error.message);
    }
};


export default connectDB;