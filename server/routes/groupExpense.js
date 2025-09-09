// routes/groupExpense.js
import express from "express";
import GroupExpense from "../models/GroupExpense.js";
import Group from "../models/Group.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Helper: calculate pairwise balances for a group
const calculateBalances = (group, expenses, currentUserEmail) => {
  // Initialize pairwise debt matrix
  const balances = {};
  group.members.forEach(m1 => {
    balances[m1] = {};
    group.members.forEach(m2 => {
      if (m1 !== m2) balances[m1][m2] = 0;
    });
  });

  // Fill matrix: who owes whom
  expenses.forEach(exp => {
    const payer = exp.paidBy;
    const split = exp.splitDetails;

    Object.entries(split).forEach(([member, amt]) => {
      if (member !== payer) {
        balances[member][payer] += amt; // member owes payer
      }
    });
  });

  // Prepare logged-in user view
  const userBalances = {};
  group.members.forEach(m => {
    if (m !== currentUserEmail) {
      const owes = balances[currentUserEmail][m]; // how much user owes m
      const owed = balances[m][currentUserEmail]; // how much m owes user

      const net = owed - owes; // positive: m owes user, negative: user owes m

      if (net > 0) userBalances[m] = net;      // they owe you
      else if (net < 0) userBalances[m] = net; // you owe them
      // zero net => ignore
    }
  });

  return userBalances;
};


// GET all expenses + balances for a group
router.get("/group/:groupId", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only allow group members
    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, req.user.email);

    res.json({ expenses, balances });
  } catch (err) {
    console.error("GET /group-expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: add a new expense
router.post("/group/:groupId", verifyToken, async (req, res) => {
  const { description, amount, splitType, splitDetails } = req.body;

  if (!description || !amount) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only group members can add expenses
    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const expenseMembers = group.members; // emails
    let finalSplit = {};

    if (splitType === "equal") {
      const share = Number(amount) / expenseMembers.length;
      expenseMembers.forEach(email => (finalSplit[email] = share));
    } else if (splitType === "percentage") {
      Object.entries(splitDetails).forEach(([email, pct]) => {
        if (expenseMembers.includes(email)) {
          finalSplit[email] = (pct / 100) * Number(amount);
        }
      });
      if (!finalSplit[req.user.email]) finalSplit[req.user.email] = 0; // ensure payer included
    }

    const expense = new GroupExpense({
      description,
      amount: Number(amount),
      paidBy: req.user.email,
      groupId: group._id,
      splitType,
      splitDetails: finalSplit,
    });

    await expense.save();

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, req.user.email);

    res.status(201).json({ expense, balances });
  } catch (err) {
    console.error("POST /group-expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE an expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await GroupExpense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // ✅ Only group members can attempt delete
    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied: not a group member" });
    }

    // ✅ Only the payer can actually delete the expense
    if (expense.paidBy !== req.user.email) {
      return res.status(403).json({ message: "Only the payer can delete this expense" });
    }

    await expense.deleteOne();

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, req.user.email);

    res.json({ success: true, balances, message: "Expense deleted successfully" });
  } catch (err) {
    console.error("DELETE /group-expenses error:", err);
    res.status(500).json({
      message: "Error deleting expense",
      error: err.message,
    });
  }
});

// POST: Settle up between two users
router.post("/group/:groupId/settle", verifyToken, async (req, res) => {
  const { withUser } = req.body; // the person you're settling with
  const group = await Group.findById(req.params.groupId);

  if (!group) return res.status(404).json({ message: "Group not found" });
  if (!group.members.includes(req.user.email)) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // 🔹 Find all expenses where balances exist
    const expenses = await GroupExpense.find({ groupId: group._id });

    // Logic: mark debts between req.user.email and withUser as settled
    // Simplest way: add a "settled" transaction (like paying back)
    const settleExpense = new GroupExpense({
      description: `Settlement between ${req.user.email} and ${withUser}`,
      amount: 0,
      paidBy: req.user.email,
      groupId: group._id,
      splitType: "settlement",
      splitDetails: {
        [req.user.email]: 0,
        [withUser]: 0,
      },
      settled: { from: req.user.email, to: withUser },
    });

    await settleExpense.save();

    res.json({ success: true, message: "Settled up successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error settling up", error: err.message });
  }
});



export default router;
