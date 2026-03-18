import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
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
