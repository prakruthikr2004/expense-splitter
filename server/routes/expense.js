import express from "express";
import Expense from "../models/Expense.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ➕ Add income/expense
router.post("/", verifyToken, async (req, res) => {
  try {
    const { type, amount, category, date, note } = req.body;
    const expense = new Expense({
      userId: req.user.id,
      type,
      amount,
      category,
      date,
      note
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Error saving expense" });
  }
});

// 📥 Get all expenses for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

// ❌ Delete entry
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting expense" });
  }
});

export default router;
