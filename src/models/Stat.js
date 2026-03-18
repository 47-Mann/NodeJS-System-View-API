import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    cpu: {
      model: String,
      cores: Number,
      architecture: String,
      loadavg: [Number],
    },
    memory: {
      total: String,
      freeMem: String,
      usage: String,
    },
    os: {
      platform: String,
      type: String,
      release: String,
      hostname: String,
      uptime: String,
    },
    user: {
      uid: Number,
      gid: Number,
      username: String,
      homedir: String,
      shell: String,
    },
    network: Object,
    process: {
      pid: Number,
      title: String,
      nodeVersion: String,
      uptime: String,
      cwd: String,
      memoryUsage: {
        rss: String,
        heapTotal: String,
        heapUsed: String,
        external: String,
      },
      env: {
        NODE_ENV: String,
      },
    },
    collectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Stat", statSchema);
