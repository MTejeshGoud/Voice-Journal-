import express from "express";
import { redis } from "../utils/redis.js";
import authenticateToken from "../middleware/authentication.js";

const router = express.Router();

// Get all transcripts (History) from Redis
router.get("/transcripts", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get job IDs from user's set
        const jobIds = await redis.smembers(`user:${userId}:jobs`);
        const transcripts = [];

        for (const jobId of jobIds) {
            const key = `job:${jobId}`;
            const job = await redis.hgetall(key);
            if (job && Object.keys(job).length > 0) {
                transcripts.push({
                    id: jobId,
                    ...job,
                });
            }
        }

        // Sort by createdAt desc (if available)
        transcripts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        res.json(transcripts);
    } catch (err) {
        console.error("Error fetching transcripts:", err);
        res.status(500).json({ error: "Failed to fetch transcripts" });
    }
});

// Get specific job status
router.get("/job/:id", authenticateToken, async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await redis.hgetall(`job:${jobId}`);

        if (!job || Object.keys(job).length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Verify ownership
        if (job.userId && job.userId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access to this transcript" });
        }

        res.json(job);
    } catch (err) {
        console.error("Error fetching job:", err);
        res.status(500).json({ error: "Failed to fetch job" });
    }
});

// Delete transcript
router.delete("/transcripts/:id", authenticateToken, async (req, res) => {
    try {
        const jobId = req.params.id;
        const key = `job:${jobId}`;

        const exists = await redis.exists(key);
        if (!exists) {
            return res.status(404).json({ error: "Transcript not found" });
        }

        // Verify ownership
        // We can check if it exists in the user's set
        const isOwner = await redis.sismember(`user:${req.user.id}:jobs`, jobId);
        if (!isOwner) {
            return res.status(403).json({ error: "Unauthorized to delete this transcript" });
        }

        await redis.del(key);
        await redis.srem(`user:${req.user.id}:jobs`, jobId);
        res.json({ status: "deleted", id: jobId });
    } catch (err) {
        console.error("Error deleting transcript:", err);
        res.status(500).json({ error: "Failed to delete transcript" });
    }
});

export default router;
