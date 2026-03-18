#!/usr/bin/env node

/**
 * System View Agent - Lightweight metrics collector for remote servers
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy agent-config.example.json to agent-config.json
 * 2. Update agent-config.json with your dashboard URL and server token
 * 3. Run: node agent.js
 * 4. Or run with npm: npm install && npm start (if using agent's package.json)
 */

import os from "os";
import process from "process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days} days, ${hours} hours, ${minutes} minutes, ${secs} seconds`;
}

// Metric collection functions
function getCPU() {
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

function getMemory() {
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

function getOSInfo() {
  const platform = os.platform();
  const type = os.type();
  const release = os.release();
  const hostname = os.hostname();
  const uptime = formatTime(os.uptime());

  return { platform, type, release, hostname, uptime };
}

function getUserInfo() {
  return os.userInfo();
}

function getNetworkInfo() {
  return os.networkInterfaces();
}

function getProcessInfo() {
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

function getSystemMetrics() {
  return {
    cpu: getCPU(),
    memory: getMemory(),
    os: getOSInfo(),
    user: getUserInfo(),
    network: getNetworkInfo(),
    process: getProcessInfo(),
  };
}

// Main agent function
async function sendMetrics() {
  try {
    // Load configuration
    const configPath = path.join(__dirname, "agent-config.json");
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Configuration file not found: ${configPath}`);
      console.error(
        "   Please copy agent-config.example.json to agent-config.json and update it.",
      );
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const { dashboardUrl, serverId, serverToken, intervalMs = 5000 } = config;

    if (!dashboardUrl || !serverId || !serverToken) {
      console.error(
        "❌ Missing required config: dashboardUrl, serverId, serverToken",
      );
      process.exit(1);
    }

    // Collect metrics
    const metrics = getSystemMetrics();

    // Prepare request
    const reportEndpoint = `${dashboardUrl}/api/servers/${serverId}/report`;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverToken}`,
      },
      body: JSON.stringify(metrics),
    };

    // Send to dashboard
    const response = await fetch(reportEndpoint, requestOptions);

    if (!response.ok) {
      console.error(
        `❌ Failed to report metrics: ${response.status} ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error(`   Response: ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log(
      `✅ Metrics reported successfully at ${new Date().toISOString()}`,
    );
    console.log(`   CPU Usage: ${metrics.memory.usage}`);
    console.log(`   Memory Free: ${metrics.memory.freeMem}`);
  } catch (error) {
    console.error(`❌ Error sending metrics: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log("🚀 System View Agent started");
  console.log(`   Process ID: ${process.pid}`);

  // Load configuration
  const configPath = path.join(__dirname, "agent-config.json");
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    console.error(
      "   Please copy agent-config.example.json to agent-config.json and update it.",
    );
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const { intervalMs = 5000 } = config;

  // Send metrics immediately
  await sendMetrics();

  // Set up recurring interval
  const intervalId = setInterval(sendMetrics, intervalMs);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n⏹️  Shutting down gracefully...");
    clearInterval(intervalId);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n⏹️  Shutting down (SIGTERM)...");
    clearInterval(intervalId);
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
