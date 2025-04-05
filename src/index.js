import 'dotenv/config';
import express from "express"
import { connectDB } from "./db/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});