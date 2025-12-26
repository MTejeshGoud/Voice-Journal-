import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redis } from "../utils/redis.js";
import authenticateToken from "../middleware/authentication.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in Redis
    await redis.set(`refreshToken:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    res.json({ message: "Login successful", accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const storedToken = await redis.get(`refreshToken:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

// Logout
// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // comes from decoded JWT
    await redis.del(`refreshToken:${userId}`);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;