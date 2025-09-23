// routes/groupExpense.js
import express from "express";
import GroupExpense from "../models/GroupExpense.js";
import Group from "../models/Group.js";
import { verifyToken } from "../middleware/auth.js";
import Settlement from "../models/Settlement.js";
import { io } from "../index.js";


const router = express.Router();

// Helper: calculate balances for current user, applying settlements
const calculateBalances = (group, expenses, settlements, currentUserEmail) => {
  const balances = {};

  // Initialize balances for all members
  group.members.forEach(member => {
    balances[member] = 0;
  });

  // Calculate from expenses
  expenses.forEach(exp => {
    const payer = exp.paidBy;
    const split = exp.splitDetails;

    Object.entries(split).forEach(([member, amt]) => {
      if (member === payer) return;

      if (payer === currentUserEmail) {
        balances[member] += amt; // member owes you
      } else if (member === currentUserEmail) {
        balances[payer] -= amt; // you owe payer
      }
    });
  });

  // Apply settlements
  settlements.forEach(s => {
    if (s.payee === currentUserEmail) {
      balances[s.payer] = (balances[s.payer] || 0) - s.amount;
    } else if (s.payer === currentUserEmail) {
      balances[s.payee] = (balances[s.payee] || 0) + s.amount;
    }
  });

  return balances;
};

// GET settlements for a group
router.get("/group/:groupId/settlements", verifyToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const settlements = await Settlement.find({ groupId }).sort({ createdAt: -1 });
    res.json({ settlements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all expenses + balances + settlements for a group
router.get("/group/:groupId", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(req.user.email))
      return res.status(403).json({ message: "Access denied" });

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const settlements = await Settlement.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, settlements, req.user.email);

    res.json({ expenses, balances, settlements });
  } catch (err) {
    console.error("GET /group-expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: add expense
router.post("/group/:groupId", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  const { description, amount, splitType, splitDetails } = req.body;

  if (!description || !amount)
    return res.status(400).json({ message: "Required fields missing" });

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(req.user.email))
      return res.status(403).json({ message: "Access denied" });

    let finalSplit = {};
    if (splitType === "equal") {
      const share = Number(amount) / group.members.length;
      group.members.forEach(email => (finalSplit[email] = share));
    } else if (splitType === "percentage") {
      Object.entries(splitDetails).forEach(([email, pct]) => {
        if (group.members.includes(email))
          finalSplit[email] = (pct / 100) * Number(amount);
      });
      if (!finalSplit[req.user.email]) finalSplit[req.user.email] = 0;
    }

    const expense = new GroupExpense({
      description,
      amount: Number(amount),
      paidBy: req.user.email,
      groupId: group._id,
      splitType,
      splitDetails: finalSplit,
      splits: Object.entries(finalSplit).map(([email, amt]) => ({
        user: email,
        amount: amt,
        settled: email === req.user.email
      }))
    });

    await expense.save();

    // Fetch updated data after saving
    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const settlements = await Settlement.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, settlements, req.user.email);
    console.log()

    // Emit updated data to all group members
    group.members.forEach(email => {
  const userBalances = calculateBalances(group, expenses, settlements, email);
  io.to(email).emit("groupUpdated", {
    expenses,
    balances: userBalances,
    settlements
  });
});


    // Return updated data to requester
    res.status(201).json({ expense, balances, settlements });

  } catch (err) {
    console.error("POST /group-expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await GroupExpense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const group = await Group.findById(expense.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(req.user.email))
      return res.status(403).json({ message: "Access denied" });
    if (expense.paidBy !== req.user.email)
      return res.status(403).json({ message: "Only the payer can delete this expense" });

    await expense.deleteOne();

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const settlements = await Settlement.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, settlements, req.user.email);

    io.to(group._id.toString()).emit("groupUpdated", { expenses, balances, settlements });

    res.json({ success: true, balances, settlements });
  } catch (err) {
    console.error("DELETE /group-expenses error:", err);
    res.status(500).json({ message: "Error deleting expense", error: err.message });
  }
});

// POST: settle balance with another user
router.post("/group/:groupId/settle", verifyToken, async (req, res) => {
  const { withUser } = req.body;
  const currentUser = req.user.email;

  if (!withUser) return res.status(400).json({ message: "withUser is required" });

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(currentUser) || !group.members.includes(withUser))
      return res.status(403).json({ message: "Access denied" });

    const expenses = await GroupExpense.find({ groupId: group._id }).lean();
    const settlements = await Settlement.find({ groupId: group._id }).lean();
    const balances = calculateBalances(group, expenses, settlements, currentUser);

    let amount = balances[withUser] || 0;
    if (amount === 0) return res.status(400).json({ message: "No balance to settle" });

    let payer, payee;
    if (amount > 0) {
      payer = withUser;
      payee = currentUser;
    } else {
      payer = currentUser;
      payee = withUser;
      amount = Math.abs(amount);
    }

    await Settlement.create({
      groupId: group._id,
      payer,
      payee,
      amount,
      settled: true,
      settledAt: new Date()
    });

    const updatedSettlements = await Settlement.find({ groupId: group._id }).lean();
    const updatedBalances = calculateBalances(group, expenses, updatedSettlements, currentUser);

    io.to(group._id.toString()).emit("groupUpdated", {
      expenses,
      balances: updatedBalances,
      settlements: updatedSettlements
    });

    res.json({ message: "Settlement successful", balances: updatedBalances, settlements: updatedSettlements });
  } catch (err) {
    console.error("POST /settle error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export { calculateBalances };
export default router;
