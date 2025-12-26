import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", jobRoutes);


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});