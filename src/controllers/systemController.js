import {
  getCPU,
  getMem,
  getNetworkInfo,
  getOsInfo,
  getProcessInfo,
  getRecentStats,
  getSystemMonitor,
  getUserInfo,
  simulateMemoryLeak,
} from "../services/systemService.js";

export function getRoot(req, res) {
  res.redirect("/dashboard");
}

export function getCPUInfo(req, res) {
  res.json(getCPU());
}

export function getMemoryInfo(req, res) {
  res.json(getMem());
}

export function getOSInfo(req, res) {
  res.json(getOsInfo());
}

export function getUserDetails(req, res) {
  res.json(getUserInfo());
}

export function getNetworkDetails(req, res) {
  res.json(getNetworkInfo());
}

export function getProcessDetails(req, res) {
  res.json(getProcessInfo());
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

export function triggerLeak(req, res) {
  res.json(simulateMemoryLeak());
}
