import mongoose from "mongoose";

const SettlementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  payer: { type: String, required: true }, // was ObjectId
  payee: { type: String, required: true }, // was ObjectId
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Settlement", SettlementSchema);
