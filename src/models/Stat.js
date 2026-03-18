import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    cpu: mongoose.Schema.Types.Mixed,
    memory: mongoose.Schema.Types.Mixed,
    os: mongoose.Schema.Types.Mixed,
    user: mongoose.Schema.Types.Mixed,
    network: mongoose.Schema.Types.Mixed,
    process: mongoose.Schema.Types.Mixed,
    collectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Stat", statSchema);
