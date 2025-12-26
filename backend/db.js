import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/voicejournaldb");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Unable to connect mongodb:", err);
        process.exit(1);
    }
}
export default connectDB;