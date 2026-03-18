import "dotenv/config";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import systemRoutes from "./routes/systemRoutes.js";
import { connectDB } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { initializeSocketServer } from "./socket/socketServer.js";
import {
  startDataCleanup,
  startStatsCollection,
} from "./services/systemService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.join(__dirname, "public");

const app = express();
const httpServer = createServer(app);

function toPositiveNumber(value, fallbackValue) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackValue;
  }

  return parsed;
}

app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) =>
    req.path.startsWith("/socket.io") || req.path.startsWith("/dashboard"),
});

app.use(limiter);
app.use("/dashboard", express.static(publicDirectory));
app.use("/", systemRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = toPositiveNumber(process.env.PORT, 5050);
const STATS_COLLECTION_INTERVAL_MS = toPositiveNumber(
  process.env.STATS_COLLECTION_INTERVAL_MS,
  5000,
);
const DATA_CLEANUP_INTERVAL_MS = toPositiveNumber(
  process.env.DATA_CLEANUP_INTERVAL_MS,
  5 * 60 * 1000,
);
const DATA_RETENTION_HOURS = toPositiveNumber(
  process.env.DATA_RETENTION_HOURS,
  24,
);
const SOCKET_EMIT_INTERVAL_MS = toPositiveNumber(
  process.env.SOCKET_EMIT_INTERVAL_MS,
  5000,
);

async function startServer() {
  try {
    await connectDB();
    startStatsCollection(STATS_COLLECTION_INTERVAL_MS);
    startDataCleanup(DATA_CLEANUP_INTERVAL_MS, DATA_RETENTION_HOURS);
    initializeSocketServer(httpServer, SOCKET_EMIT_INTERVAL_MS);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();

export default app;
