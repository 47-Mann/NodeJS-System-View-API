const socketStatus = document.querySelector("#socket-status");
const healthStatus = document.querySelector("#health-status");
const cpuLive = document.querySelector("#cpu-live");
const memoryLive = document.querySelector("#memory-live");
const hostname = document.querySelector("#hostname");
const nodeVersion = document.querySelector("#node-version");
const cpuModel = document.querySelector("#cpu-model");
const cpuCores = document.querySelector("#cpu-cores");
const memoryUsage = document.querySelector("#memory-usage");
const processRss = document.querySelector("#process-rss");
const osPlatform = document.querySelector("#os-platform");
const osUptime = document.querySelector("#os-uptime");
const recordsTotal = document.querySelector("#records-total");
const lastCollected = document.querySelector("#last-collected");
const latestUpdatePill = document.querySelector("#latest-update-pill");
const recordsCount = document.querySelector("#records-count");
const statsTableBody = document.querySelector("#stats-table-body");
const refreshMonitorButton = document.querySelector("#refresh-monitor");
const cpuBar = document.querySelector("#cpu-bar");
const memoryBar = document.querySelector("#memory-bar");
const cpuPulseBar = document.querySelector("#cpu-pulse-bar");
const memoryPulseBar = document.querySelector("#memory-pulse-bar");
const cpuPulseLabel = document.querySelector("#cpu-pulse-label");
const memoryPulseLabel = document.querySelector("#memory-pulse-label");
const runtimeInsight = document.querySelector("#runtime-insight");

function clampPercent(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(100, parsed));
}

function updateProgress(element, value) {
  element.style.width = `${clampPercent(value)}%`;
}

function getRuntimeInsight(cpu, memory) {
  if (cpu >= 80 || memory >= 80) {
    return "High resource pressure detected. Consider checking active processes and workload spikes.";
  }

  if (cpu >= 55 || memory >= 55) {
    return "System load is moderate. Keep an eye on sustained increases over time.";
  }

  return "System is running comfortably within a healthy operating range.";
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function setConnectionStatus(element, text, isOnline) {
  element.textContent = text;
  element.classList.toggle("status-online", isOnline);
  element.classList.toggle("status-offline", !isOnline);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function renderStatsTable(stats) {
  recordsCount.textContent = `${stats.length} records`;
  recordsTotal.textContent = String(stats.length);
  lastCollected.textContent = stats[0]?.collectedAt
    ? formatDate(stats[0].collectedAt)
    : "--";

  if (!stats.length) {
    statsTableBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">No records available yet.</td></tr>';
    return;
  }

  statsTableBody.innerHTML = stats
    .map(
      (stat) => `
        <tr>
          <td>${formatDate(stat.collectedAt)}</td>
          <td>${stat.cpu?.model ?? "--"}</td>
          <td>${stat.memory?.usage ?? "--"}</td>
          <td>${stat.os?.hostname ?? "--"}</td>
          <td>${stat.process?.memoryUsage?.rss ?? "--"}</td>
        </tr>
      `,
    )
    .join("");
}

function renderMonitorSnapshot(data) {
  hostname.textContent = data.os?.hostname ?? "--";
  nodeVersion.textContent = data.process?.nodeVersion ?? "--";
  cpuModel.textContent = data.cpu?.model ?? "--";
  cpuCores.textContent = data.cpu?.cores ?? "--";
  memoryUsage.textContent = data.memory?.usage ?? "--";
  processRss.textContent = data.process?.memoryUsage?.rss ?? "--";
  osPlatform.textContent = `${data.os?.platform ?? "--"} / ${data.os?.release ?? "--"}`;
  osUptime.textContent = data.os?.uptime ?? "--";
  latestUpdatePill.textContent = `Updated · ${formatDate(new Date().toISOString())}`;
}

async function loadHealth() {
  try {
    const health = await fetchJson("/health");
    setConnectionStatus(
      healthStatus,
      `OK · ${formatDate(health.timestamp)}`,
      true,
    );
  } catch (error) {
    setConnectionStatus(healthStatus, "Unavailable", false);
  }
}

async function loadMonitor() {
  try {
    const monitor = await fetchJson("/monitor");
    renderMonitorSnapshot(monitor);
  } catch (error) {
    cpuModel.textContent = "Failed to load";
  }
}

async function loadStats() {
  try {
    const stats = await fetchJson("/stats");
    renderStatsTable(stats);
  } catch (error) {
    recordsCount.textContent = "Error";
    statsTableBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Failed to load records.</td></tr>';
  }
}

function initializeSocket() {
  const socket = io();

  socket.on("connect", () => {
    setConnectionStatus(socketStatus, "Connected", true);
  });

  socket.on("disconnect", () => {
    setConnectionStatus(socketStatus, "Disconnected", false);
  });

  socket.on("system-data", (payload) => {
    cpuLive.textContent = `${payload.cpu}%`;
    memoryLive.textContent = `${payload.memory}%`;
    cpuPulseLabel.textContent = `${payload.cpu}%`;
    memoryPulseLabel.textContent = `${payload.memory}%`;
    updateProgress(cpuBar, payload.cpu);
    updateProgress(memoryBar, payload.memory);
    updateProgress(cpuPulseBar, payload.cpu);
    updateProgress(memoryPulseBar, payload.memory);
    runtimeInsight.textContent = getRuntimeInsight(payload.cpu, payload.memory);
  });
}

refreshMonitorButton.addEventListener("click", async () => {
  refreshMonitorButton.disabled = true;

  try {
    await Promise.all([loadMonitor(), loadStats(), loadHealth()]);
  } finally {
    refreshMonitorButton.disabled = false;
  }
});

async function bootstrap() {
  initializeSocket();
  await Promise.all([loadHealth(), loadMonitor(), loadStats()]);
}

bootstrap();
