import express from "express";
import crypto from "crypto";

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.js";
import passport from "passport";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
const router = express.Router();

function validatePassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$.!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return strongPasswordRegex.test(password);
}




// ---------------- Google OAuth Setup ----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,   // put in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://expense-splitter-nsts.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos[0]?.value;

        let user = await User.findOne({ email });

        if (!user) {
          // create new user (no password)
          user = new User({
  name,
  email,
  avatar,
  isOAuth: true, // optional flag to track OAuth users
});

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect back to frontend with token
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);


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

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

        console.log("Backend received password:", password);
console.log("Backend regex test:", validatePassword(password));
    // Strong password validation
    if (!password || !validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character",
      });
    }
    


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      isOAuth: false,
      verified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24h

    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: "User created! Check your email to verify." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: err.message });
  }
});




// ✨ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.verified) {
  return res.status(400).json({ message: "Please verify your email first" });
}


    // Prevent password login for OAuth users
    if (user.isOAuth) {
      return res.status(400).json({ message: "Use Google login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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

// Verify email
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token and not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    // Update user as verified
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});


export default router;
