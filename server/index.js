import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import "./config/passport.js"; // GoogleStrategy setup
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/group.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expense.js";
import groupExpenseRoutes from "./routes/groupExpense.js";
import { verifyToken } from "./middleware/auth.js";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";

export const onlineUsers = {};

dotenv.config();

const app = express();

// ---------------- Allowed Origins ----------------
const allowedOrigins = [
  "http://localhost:5173", // local dev frontend
  "https://splitmate-phi.vercel.app",
  `${process.env.CLIENT_ORIGIN}`,// deployed frontend
];

// ---------------- Express Middleware ----------------
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });

// ---------------- Socket.IO Setup ----------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Authenticate socket using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id, "User ID:", socket.userId);

  socket.on("registerUser", (email) => {
    onlineUsers[email] = socket.id;
  });

  socket.on("joinUser", (email) => {
    console.log(`User ${email} joined personal room`);
    socket.join(email);
  });

  if (socket.userId) {
    socket.join(socket.userId);
    console.log(`User ${socket.userId} joined their room`);
  }

  socket.on("updateUser", (updatedUser) => {
    const socketId = onlineUsers[updatedUser.email];
    if (socketId) {
      io.to(socketId).emit("userUpdated", updatedUser);
    }
  });

  socket.on("deleteUser", (deletedUserId) => {
    socket.broadcast.emit("deleteUser", deletedUserId);
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 ${socket.id} joined group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (let email in onlineUsers) {
      if (onlineUsers[email] === socket.id) {
        delete onlineUsers[email];
      }
    }
  });
});

export { io };

// ---------------- Passport Init ----------------
app.use(passport.initialize());

// ---------------- Google OAuth Routes ----------------
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, name: req.user.name, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.CLIENT_ORIGIN}/oauth-success?token=${token}`);
  }
);

// ---------------- API Routes ----------------
app.get("/", (req, res) => res.send("SplitMate API running..."));
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/expenses", expenseRoutes);
app.use("/api/group-expenses", groupExpenseRoutes);

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user?.name || "User"}, this is protected!` });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
