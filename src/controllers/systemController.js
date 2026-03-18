import { getRecentStats, getSystemMonitor } from "../services/systemService.js";

export function getRoot(req, res) {
  res.redirect("/dashboard");
}

export function getMonitorDetails(req, res) {
  res.json(getSystemMonitor());
}

export async function getStats(req, res, next) {
  try {
    const stats = await getRecentStats(100);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export function getHealth(req, res) {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
}
