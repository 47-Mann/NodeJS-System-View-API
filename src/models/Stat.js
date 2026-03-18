import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    cpu: Object,
    memory: Object,
    os: Object,
    user: Object,
    network: Object,
    process: Object,
    collectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Stat", statSchema);
