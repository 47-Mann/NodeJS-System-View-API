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

export function getApiIndex(req, res) {
  res.json({
    name: "System View API",
    dashboard: {
      url: "/dashboard",
      note: "No UI login page exists. Authentication is API-based via /api/auth.",
    },
    auth: {
      base: "/api/auth",
      endpoints: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me (Bearer token required)",
      },
    },
    servers: {
      base: "/api/servers",
      endpoints: {
        createServer: "POST /api/servers (Bearer token required)",
        listServers: "GET /api/servers (Bearer token required)",
        getServerWithStats:
          "GET /api/servers/:serverId (Bearer token required)",
        deleteServer: "DELETE /api/servers/:serverId (Bearer token required)",
        reportFromAgent:
          "POST /api/servers/:serverId/report (Server token required)",
      },
    },
    system: {
      endpoints: [
        "GET /health",
        "GET /monitor",
        "GET /stats",
        "GET /cpu",
        "GET /memory",
        "GET /os",
        "GET /user",
        "GET /network",
        "GET /process",
      ],
    },
  });
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
