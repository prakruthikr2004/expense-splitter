import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    isOAuth: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },           // NEW
    verificationToken: { type: String },                   // NEW
    verificationTokenExpiry: { type: Date },               // NEW
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
