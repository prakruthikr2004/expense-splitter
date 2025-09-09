// models/GroupExpense.js
import mongoose from "mongoose";

const groupExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, ref: "User", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  splitType: { type: String, enum: ["equal", "percentage"], default: "equal" },
  splitDetails: { type: Object, default: {} }, // userId -> amount or percentage
}, { timestamps: true });

export default mongoose.model("GroupExpense", groupExpenseSchema);
