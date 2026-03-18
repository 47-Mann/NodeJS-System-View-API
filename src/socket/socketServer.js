import { Server } from "socket.io";
import { getRealtimeSystemData } from "../services/systemService.js";

let io = null;
let emitterIntervalId = null;
let isEmitting = false;

function startSystemDataEmitter(emitIntervalMs = 5000) {
  if (emitterIntervalId) {
    return emitterIntervalId;
  }

  emitterIntervalId = setInterval(async () => {
    if (!io || isEmitting) {
      return;
    }

    isEmitting = true;

    try {
      const payload = await getRealtimeSystemData();
      io.emit("system-data", payload);
    } catch (error) {
      console.error("Failed to emit system-data:", error.message);
    } finally {
      isEmitting = false;
    }
  }, emitIntervalMs);

  return emitterIntervalId;
}

export function initializeSocketServer(httpServer, emitIntervalMs = 5000) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected`);
  });

  startSystemDataEmitter(emitIntervalMs);

  return io;
}
