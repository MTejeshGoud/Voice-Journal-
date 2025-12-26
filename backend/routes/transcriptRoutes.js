// routes/transcriptRoutes.js

import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import Transcript from "../models/Transcript.js";
import authenticateToken from "../middleware/authentication.js";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// --- UPLOAD AUDIO + CREATE JOB ---
router.post("/upload", authenticateToken, upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Create a new job with pending status
    const job = await Transcript.create({
      userId: req.user.id,
      fileName,
      status: "pending",
      text: "",
    });

    // Respond immediately
    res.json({ jobId: job._id });

    // ---- BACKGROUND ASYNC TRANSCRIPTION ----
    (async () => {
      try {
        const response = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: "whisper-1",
        });

        // Update transcript result
        job.status = "completed";
        job.text = response.text;
        await job.save();

        // Remove uploaded file
        fs.unlinkSync(filePath);

      } catch (err) {
        console.error("Transcription failed:", err);

        job.status = "failed";
        await job.save();
      }
    })();

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- GET ALL TRANSCRIPTS OF USER ---
router.get("/transcripts", authenticateToken, async (req, res) => {
  try {
    const transcripts = await Transcript.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transcripts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET ONE JOB STATUS ---
router.get("/job/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Transcript.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
