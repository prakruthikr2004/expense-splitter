import express from "express";
import Group from "../models/Group.js";
import GroupExpense from "../models/GroupExpense.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Create a new group
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const newGroup = new Group({
      name,
      members: [...(members || []), req.user.email],
      createdBy: req.user.id,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get all groups for logged-in user only
router.get("/", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ "members": req.user.email });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups", error: err.message });
  }
});

// ✅ Get single group with members (only if logged-in user is a member)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied: you are not a member" });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error fetching group", error: err.message });
  }
});

// ✅ Delete group (only creator)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this group" });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting group", error: err.message });
  }
});

// ✅ Add expense to group
router.post("/:id/expenses", verifyToken, async (req, res) => {
  try {
    const { description, amount, paidBy, splitType, splitDetails } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied: you are not a member" });
    }

    if (!description || !amount || !paidBy) {
      return res.status(400).json({ message: "Description, amount, and paidBy are required" });
    }

    const expense = new GroupExpense({
      groupId,
      description,
      amount,
      paidBy,
      splitType,
      splitDetails,
    });

    await expense.save();

    // calculate balances for all members
    const expenses = await GroupExpense.find({ groupId });
    const balances = {};

    group.members.forEach(member => balances[member] = 0);

    expenses.forEach(exp => {
      const payer = exp.paidBy;
      if (exp.splitType === "equal") {
        const share = exp.amount / group.members.length;
        group.members.forEach(member => {
          if (member === payer) {
            balances[member] += exp.amount - share;
          } else {
            balances[member] -= share;
          }
        });
      } else {
        for (const [member, percent] of Object.entries(exp.splitDetails)) {
          const share = (exp.amount * percent) / 100;
          if (member === payer) {
            balances[member] += exp.amount - share;
          } else {
            balances[member] -= share;
          }
        }
      }
    });

    res.status(201).json({ expense, balances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating expense", error: err.message });
  }
});

// ✅ Get all expenses of a group with balances (only members)
router.get("/:id/expenses", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied: you are not a member" });
    }

    const expenses = await GroupExpense.find({ groupId: group._id });

    const balances = {};
    group.members.forEach(member => balances[member] = 0);

    expenses.forEach(exp => {
      const payer = exp.paidBy;
      if (exp.splitType === "equal") {
        const share = exp.amount / group.members.length;
        group.members.forEach(member => {
          if (member === payer) {
            balances[member] += exp.amount - share;
          } else {
            balances[member] -= share;
          }
        });
      } else {
        for (const [member, percent] of Object.entries(exp.splitDetails)) {
          const share = (exp.amount * percent) / 100;
          if (member === payer) {
            balances[member] += exp.amount - share;
          } else {
            balances[member] -= share;
          }
        }
      }
    });

    res.json({ expenses, balances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
});

// ✅ Get group summary (total spent + user share)
router.get("/:id/summary", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.email)) {
      return res.status(403).json({ message: "Access denied: you are not a member" });
    }

    const expenses = await GroupExpense.find({ groupId: group._id });

    let totalSpent = 0;
    let userShare = 0;

    expenses.forEach((exp) => {
      totalSpent += exp.amount;

      if (exp.splitType === "equal") {
        userShare += exp.amount / group.members.length;
      } else if (exp.splitDetails) {
        userShare += (exp.amount * (exp.splitDetails[req.user.email] || 0)) / 100;
      }
    });

    res.json({
      totalSpent,
      userShare,
      netBalance: group.balances ? group.balances[req.user.email] || 0 : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching summary", error: err.message });
  }
});

// routes/groups.js
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const groups = await Group.find({ members: email }); // Groups where user is a member
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





export default router;
