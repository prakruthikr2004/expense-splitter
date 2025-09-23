// server/routes/auth.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

dotenv.config();
const router = express.Router();

// ---------------- Password Validation ----------------
function validatePassword(password) {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$.!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

// ---------------- Google OAuth Setup ----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email not found in Google profile"));

        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name,
            email,
            avatar,
            isOAuth: true,
            verified: true, // OAuth users are considered verified
          });
          await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`https://your-frontend.vercel.app/oauth-success?token=${token}`);
  }
);

// ---------------- Signup ----------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password || !validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars, with uppercase, lowercase, number & special char",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar,
      isOAuth: false,
      verified: false,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    await user.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "User created! Check email to verify." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Login ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.verified) return res.status(400).json({ message: "Verify email first" });
    if (user.isOAuth) return res.status(400).json({ message: "Use Google login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Get Current User ----------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// ---------------- Update Name ----------------
router.put("/update-name", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("name email avatar");

    const newToken = jwt.sign(
      { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Name updated", token: newToken, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating name" });
  }
});

// ---------------- Update Avatar ----------------
router.put("/avatar", verifyToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: "Avatar is required" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select("name email avatar");

    res.json({ message: "Avatar updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating avatar" });
  }
});

// ---------------- Verify Email ----------------
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired link" });

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error during verification" });
  }
});

export default router;
