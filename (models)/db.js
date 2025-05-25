import mongoose from "mongoose";

let isConnected = false; // Track connection status

export default async function connectDB() {
    if (isConnected) {
        console.log("Database already connected");
        return;
    }

    try {
        const db = await mongoose.connect("mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = db.connections[0].readyState === 1; // 1 = connected
        console.log("Connected to database");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw new Error("Database connection failed");
    }
}
