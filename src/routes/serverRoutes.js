import { Router } from "express";
import Server from "../models/Server.js";
import Stat from "../models/Stat.js";
import { verifyToken, verifyServerToken } from "../middlewares/auth.js";

const router = Router();

// Create a new server (link)
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Server name is required" });
    }

    const server = new Server({
      owner: req.user.userId,
      name,
    });

    await server.save();
    res.status(201).json(server);
  } catch (error) {
    next(error);
  }
});

// Get user's servers
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const servers = await Server.find({ owner: req.user.userId });
    res.json(servers);
  } catch (error) {
    next(error);
  }
});

// Get server details with stats
router.get("/:serverId", verifyToken, async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.serverId);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    if (server.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get recent stats for this server
    const stats = await Stat.find({
      serverId: server._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      server,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

// Delete server
router.delete("/:serverId", verifyToken, async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.serverId);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    if (server.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Server.deleteOne({ _id: req.params.serverId });
    res.json({ message: "Server deleted" });
  } catch (error) {
    next(error);
  }
});

// Agent: Submit system data (authenticated with server token)
router.post("/:serverId/report", verifyServerToken, async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const systemData = req.body;

    const server = await Server.findById(serverId);

    if (!server || server.token !== req.serverToken) {
      return res.status(401).json({ error: "Invalid server token" });
    }

    // Create stat record with server association
    const stat = new Stat({
      ...systemData,
      serverId: server._id,
    });

    await stat.save();
    server.lastHeartbeat = new Date();
    await server.save();

    res.json({ message: "Stat recorded", stat });
  } catch (error) {
    next(error);
  }
});

export default router;
