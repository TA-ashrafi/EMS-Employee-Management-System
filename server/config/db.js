import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Remove the on('connected') listener before connect
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');
    } catch (error) {
        console.error('❌ Error connecting to Database:', error.message);
        process.exit(1);
    }
};

export default connectDB;