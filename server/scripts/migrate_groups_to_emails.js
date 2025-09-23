// scripts/fixGroups.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "../models/Group.js";
import User from "../models/User.js";

dotenv.config();

const fixGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const groups = await Group.find();

    for (let group of groups) {
      let changed = false;

      const updatedMembers = await Promise.all(
        group.members.map(async (m) => {
          if (typeof m === "string") return m; // already email
          try {
            const user = await User.findById(m);
            if (user && user.email) {
              changed = true;
              return user.email; // convert ObjectId -> email
            }
            return String(m); // fallback
          } catch {
            return String(m);
          }
        })
      );

      if (changed) {
        group.members = updatedMembers;
        await group.save();
        console.log(`✅ Fixed group: ${group.name}`);
      }
    }

    console.log("🎉 Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing groups:", err);
    process.exit(1);
  }
};

fixGroups();
