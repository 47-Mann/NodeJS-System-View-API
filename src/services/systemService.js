import os from "os";
import process from "process";
import { formatBytes, formatTime } from "../utils/format.js";
import Stat from "../models/Stat.js";

let leaks = [];
let statsIntervalId = null;
let cleanupIntervalId = null;
let isPersistingStat = false;
let isCleaningUp = false;

function wait(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function getCpuTimesSnapshot() {
  const cpus = os.cpus();

  return cpus.reduce(
    (accumulator, cpu) => {
      const { user, nice, sys, irq, idle } = cpu.times;
      accumulator.idle += idle;
      accumulator.total += user + nice + sys + irq + idle;
      return accumulator;
    },
    { idle: 0, total: 0 },
  );
}

export function getCPU() {
  const model = os.cpus()[0].model;
  const cores = os.cpus().length;
  const architecture = os.arch();
  const loadavg = os.loadavg();

  return {
    model,
    cores,
    architecture,
    loadavg,
  };
}

export function getMem() {
  const total = formatBytes(os.totalmem());
  const freeMem = formatBytes(os.freemem());
  const usage =
    (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + "%";

  return {
    total,
    freeMem,
    usage,
  };
}

export function getOsInfo() {
  const platform = os.platform();
  const type = os.type();
  const release = os.release();
  const hostname = os.hostname();
  const uptime = formatTime(os.uptime());

  return { platform, type, release, hostname, uptime };
}

export function getUserInfo() {
  return os.userInfo();
}

export function getNetworkInfo() {
  return os.networkInterfaces();
}

export function getProcessInfo() {
  const memory = process.memoryUsage();

  return {
    pid: process.pid,
    title: process.title,
    nodeVersion: process.version,
    uptime: formatTime(process.uptime()),
    cwd: process.cwd(),
    memoryUsage: {
      rss: formatBytes(memory.rss),
      heapTotal: formatBytes(memory.heapTotal),
      heapUsed: formatBytes(memory.heapUsed),
      external: formatBytes(memory.external),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || "Not set",
    },
  };
}

export function getSystemMonitor() {
  return {
    cpu: getCPU(),
    memory: getMem(),
    os: getOsInfo(),
    user: getUserInfo(),
    network: getNetworkInfo(),
    process: getProcessInfo(),
  };
}

export function simulateMemoryLeak() {
  leaks.push(new Array(1000000).fill("leak"));

  return {
    message: "Memory leaked",
    leakCount: leaks.length,
  };
}

export async function storeSystemStat() {
  const snapshot = getSystemMonitor();
  return Stat.create(snapshot);
}

export async function getRecentStats(limit = 100) {
  return Stat.find().sort({ collectedAt: -1 }).limit(limit).lean();
}

export async function cleanupOldStats(retentionHours = 24) {
  const threshold = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
  const result = await Stat.deleteMany({ collectedAt: { $lt: threshold } });

  return result.deletedCount ?? 0;
}

export function startStatsCollection(intervalMs = 5000) {
  if (statsIntervalId) {
    return statsIntervalId;
  }

  statsIntervalId = setInterval(async () => {
    if (isPersistingStat) {
      return;
    }

    isPersistingStat = true;

    try {
      await storeSystemStat();
    } catch (error) {
      console.error("Failed to store system stats:", error.message);
    } finally {
      isPersistingStat = false;
    }
  }, intervalMs);

  return statsIntervalId;
}

export function startDataCleanup(
  intervalMs = 5 * 60 * 1000,
  retentionHours = 24,
) {
  if (cleanupIntervalId) {
    return cleanupIntervalId;
  }

  cleanupIntervalId = setInterval(async () => {
    if (isCleaningUp) {
      return;
    }

    isCleaningUp = true;

    try {
      await cleanupOldStats(retentionHours);
    } catch (error) {
      console.error("Failed to cleanup old stats:", error.message);
    } finally {
      isCleaningUp = false;
    }
  }, intervalMs);

  return cleanupIntervalId;
}

export function getMemoryUsagePercentage() {
  const memoryUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
  return Number(memoryUsage.toFixed(2));
}

export async function getCpuUsagePercentage(sampleMs = 250) {
  const startSnapshot = getCpuTimesSnapshot();
  await wait(sampleMs);
  const endSnapshot = getCpuTimesSnapshot();

  const totalDiff = endSnapshot.total - startSnapshot.total;
  const idleDiff = endSnapshot.idle - startSnapshot.idle;

  if (totalDiff <= 0) {
    return 0;
  }

  const usage = (1 - idleDiff / totalDiff) * 100;
  return Number(usage.toFixed(2));
}

export async function getRealtimeSystemData() {
  const cpu = await getCpuUsagePercentage();
  const memory = getMemoryUsagePercentage();

  return {
    cpu,
    memory,
  };
}
