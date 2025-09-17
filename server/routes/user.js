import dotenv from "dotenv";
dotenv.config();

import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// Multer setup for avatar uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars", // all uploads go into /avatars
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 200, height: 200, crop: "fill" }], // optional resize
  },
});
const upload = multer({ storage });



// Search users by email
router.get("/search", verifyToken, async (req, res) => {
  
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const users = await User.find({
      email: { $regex: email, $options: "i" },
    }).select("_id email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error searching users" });
  }
});


// ✅ Update Name route
router.put("/update-name", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    ).select("name email avatar");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Name updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Error updating name:", err.message);
    res.status(500).json({ message: "Error updating name" });
  }
});
// Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    console.log(process.env.CLOUD_NAME, process.env.CLOUD_API_KEY ? "API key loaded" : "Missing API key");
    console.log("CLOUD_API_KEY:", `"${process.env.CLOUD_API_KEY}"`);
console.log("length:", process.env.CLOUD_API_KEY.length);

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete account
router.delete("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully!" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Error deleting account" });
  }
});

router.put("/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    

    console.log("Uploaded file:", req.file); // log to see what multer/Cloudinary returns
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // CloudinaryStorage puts the URL in req.file.path
    const avatarUrl = req.file.path || req.file.filename || req.file.url; 
    if (!avatarUrl) return res.status(500).json({ message: "Failed to get avatar URL" });

    user.avatar = avatarUrl;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    console.error("Error updating avatar:", err);
    res.status(500).json({ message: "Failed to update avatar" });
  }
});






export default router;
