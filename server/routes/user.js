import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Search users by email
router.get("/search", verifyToken, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const users = await User.find({
      email: { $regex: email, $options: "i" }, // case-insensitive search
    }).select("_id email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error searching users" });
  }
});

export default router;
