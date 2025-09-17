import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/group.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expense.js";
import groupExpenseRoutes from "./routes/groupExpense.js";

// middleware
import { verifyToken } from "./middleware/auth.js";

dotenv.config();

const app = express();

// CORS – allow your React frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => res.send("SplitMate API running..."));

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/users", userRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/expenses", expenseRoutes);
app.use("/api/group-expenses", groupExpenseRoutes);

// Example protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user?.name || "User"}, this is protected!` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
