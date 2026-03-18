import mongoose from "mongoose";
import crypto from "crypto";

const serverSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    hostname: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
    },
    stats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stat",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Server", serverSchema);
