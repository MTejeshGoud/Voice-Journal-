import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../utils/redis.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { exec } from "child_process";
import authenticateToken from "../middleware/authentication.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Resolve path to backend-py/uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../backend-py/uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Upload audio
router.post("/upload", authenticateToken, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const jobId = uuidv4();
    const fileName = req.file.originalname;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 1. Save file to disk (for Python worker)
    fs.writeFileSync(filePath, req.file.buffer);

    // 2. Save job state
    await redis.hset(`job:${jobId}`, {
      fileName: fileName,
      status: "pending",
      fileName: fileName,
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: req.user.id
    });

    // Add to user's job list
    await redis.sadd(`user:${req.user.id}:jobs`, jobId);

    // 3. Trigger Celery Worker via Python Script
    // Try to find the virtualenv python if it exists, otherwise fallback to system python
    const cwd = path.resolve(__dirname, "../../backend-py");
    let pythonPath = "python3";

    // Check for common venv paths
    if (fs.existsSync(path.join(cwd, ".venv/bin/python"))) {
      pythonPath = ".venv/bin/python";
    }

    const command = `${pythonPath} trigger_task.py "${jobId}" "${fileName}"`;

    console.log(`Executing: ${command} in ${cwd}`);

    // Fire and forget
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec error: ${error}`);
        // Note: We don't fail the request here because the file is uploaded and job is pending.
      }
      console.log(`Stdout: ${stdout}`);
      if (stderr) console.error(`Stderr: ${stderr}`);
    });

    res.json({ jobId });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;