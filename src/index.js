import { connectDB } from "./db/db.js";
import 'dotenv/config';

connectDB().then(() => {
    console.log("MongoDB connected");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});