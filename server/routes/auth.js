import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✨ Update Name
router.put("/update-name", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    ).select("name email avatar");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ generate a fresh token with updated name
    const newToken = jwt.sign(
      { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Name updated successfully",
      token: newToken,
      user: updatedUser
    });
  } catch (err) {
    console.error("Error updating name:", err.message);
    res.status(500).json({ message: "Error updating name" });
  }
});

// ✨ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✨ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✨ Get current logged in user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});


// ✨ Update Avatar
router.put("/avatar", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body; // expecting a URL or base64 string

    if (!avatar) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    ).select("name email avatar");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating avatar:", err.message);
    res.status(500).json({ message: "Error updating avatar" });
  }
});


export default router;
