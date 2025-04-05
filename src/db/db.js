import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_DB_URI,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        console.log("MongoDB connected successfully", db.connection.host);
        return db;
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
}