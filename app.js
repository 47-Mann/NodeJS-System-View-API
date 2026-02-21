import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import os from "os";
import process from "process";

//Formatting Bytes to Human-readable format
function formatBytes(bytes, decimal = 2) {
  if (bytes == 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat(bytes / Math.pow(k, i).toFixed(decimal)) + " " + sizes[i];
}
// Formatting seconds to Human-readable format
function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;
}

const getCPU = () => {
  const model = os.cpus()[0].model;
  const cores = os.cpus().length;
  const architecture = os.arch();
  const lodavg = os.loadavg();

  return {
    model,
    cores,
    architecture,
    lodavg,
  };
};

const getMem = () => {
  const total = formatBytes(os.totalmem());
  const freeMem = formatBytes(os.freemem());
  const usage = (1 - (os.freemem() / os.totalmem()) * 100).toFixed(2) + "%";
  return {
    total,
    freeMem,
    usage,
  };
};

const getOsInfo = () => {
  const platform = os.platform();
  const type = os.type();
  const release = os.release();
  const hostname = os.hostname();
  const uptime = formatTime(os.uptime());
  return { platform, type, release, hostname, uptime };
};

const getUserInfo = () => {
  const userInfo = os.userInfo();
  return userInfo;
};

const networkInfo = () => {
  const network = os.networkInterfaces();
  return network;
};
const getProcessId = () => {
  const pid = process.pid;
  const title = process.title;
  const nodeVersion = process.version;
  const uptime = formatTime(process.uptime());

  return {
    pid,
    title,
    nodeVersion,
    uptime,
    cwd: process.cwd(),
    memoryUsage: {
      rss: formatBytes(process.memoryUsage().rss),
      heapTotal: formatBytes(process.memoryUsage().heapTotal),
      heapUsed: formatBytes(process.memoryUsage().heapUsed),
      external: formatBytes(process.memoryUsage().external),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || "Not set",
    },
  };
};

const app = express();

// Middleware
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Memory leak simulation
let leaks = [];

// Routes
app.get("/", (req, res) => {
  res.json({
    name: "System Information API",
    version: "1.0.0",
    description: "API to fetch system information using Node.js",
    endpoints: {
      "/cpu": "Get CPU information",
      "/memory": "Get Memory information",
      "/os": "Get OS information",
      "/user": "Get User information",
      "/network": "Get Network information",
      "/process": "Get Process information",
      "/monitor": "Get all system information",
      "/health": "Health check",
      "/leak": "Simulate memory leak (for testing)",
    },
  });
});

app.get("/cpu", (req, res) => {
  res.json(getCPU());
});

app.get("/memory", (req, res) => {
  res.json(getMem());
});

app.get("/os", (req, res) => {
  res.json(getOsInfo());
});

app.get("/user", (req, res) => {
  res.json(getUserInfo());
});

app.get("/network", (req, res) => {
  res.json(networkInfo());
});

app.get("/process", (req, res) => {
  res.json(getProcessId());
});

app.get("/monitor", (req, res) => {
  res.json({
    cpu: getCPU(),
    memory: getMem(),
    os: getOsInfo(),
    user: getUserInfo(),
    network: networkInfo(),
    process: getProcessId(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/leak", (req, res) => {
  leaks.push(new Array(1000000).fill("leak"));
  res.json({ message: "Memory leaked", leakCount: leaks.length });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
