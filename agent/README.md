# System View Agent

Lightweight Node.js agent that collects system metrics and reports them to your System View API dashboard.

## Features

- ✅ Zero external dependencies (uses only Node.js built-in modules)
- ✅ Lightweight and fast (~30KB)
- ✅ Collects CPU, memory, OS, network, and process information
- ✅ Configurable reporting intervals (default: 5 seconds)
- ✅ Secure token-based authentication
- ✅ Graceful shutdown handling
- ✅ Run on any Node.js-enabled server

## Installation

### Option 1: Copy to your server

```bash
# Copy the agent directory to your server
scp -r agent/ user@server:/path/to/destination/

# Install (no dependencies required, but recommended for CLI)
cd agent
npm install
```

### Option 2: Stand-alone deployment

The agent only requires Node.js 14+. No npm install needed if you're just running it.

```bash
node agent.js
```

## Setup

### 1. Create Configuration File

Copy the example configuration:

```bash
cp agent-config.example.json agent-config.json
```

### 2. Get Your Server Credentials

Before running the agent, create a server in your System View dashboard:

1. Go to your System View dashboard (e.g., `http://localhost:5050`)
2. Login with your credentials
3. Create a new server enrollment
4. Copy the **Server ID** and **Server Token**

### 3. Update Configuration

Edit `agent-config.json` with your values:

```json
{
  "dashboardUrl": "https://your-dashboard-url.com",
  "serverId": "6708a4d8c8f1a2b3c4d5e6f7",
  "serverToken": "abcd1234efgh5678ijkl9012mnop3456",
  "intervalMs": 5000
}
```

**Configuration Parameters:**

- `dashboardUrl` - Base URL of your System View API (no trailing slash)
- `serverId` - Unique ID of this server (obtained from dashboard)
- `serverToken` - Authorization token for this server
- `intervalMs` - Reporting interval in milliseconds (default: 5000 = 5 seconds)

### 4. Run the Agent

```bash
# Using npm
npm start

# Or directly with Node
node agent.js

# With auto-restart on file changes (development)
npm run dev
```

## Usage Examples

### Run on startup (Linux/Mac)

Add to crontab to run at system startup:

```bash
@reboot cd /path/to/agent && node agent.js >> agent.log 2>&1 &
```

### Run as systemd service (Linux)

Create `/etc/systemd/system/system-view-agent.service`:

```ini
[Unit]
Description=System View Agent
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/agent
ExecStart=/usr/bin/node agent.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl enable system-view-agent
sudo systemctl start system-view-agent
sudo systemctl status system-view-agent
```

### Run as PM2 background process

```bash
npm install -g pm2

pm2 start agent.js --name "system-view-agent"
pm2 save
pm2 startup
```

### Run in Docker

Create a Dockerfile in the agent directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY agent.js agent-config.json ./
CMD ["node", "agent.js"]
```

Build and run:

```bash
docker build -t system-view-agent .
docker run -d --name system-view-agent system-view-agent
```

## Metrics Collected

Each report includes:

```
├── CPU
│   ├── model: CPU model name
│   ├── cores: Number of cores
│   ├── architecture: CPU architecture
│   └── loadavg: Load average [1min, 5min, 15min]
├── Memory
│   ├── total: Total system memory
│   ├── freeMem: Available memory
│   └── usage: Memory usage percentage
├── OS
│   ├── platform: OS platform (darwin, linux, win32)
│   ├── type: OS type
│   ├── release: OS version
│   ├── hostname: Server hostname
│   └── uptime: System uptime
├── User
│   ├── uid: User ID
│   ├── gid: Group ID
│   ├── username: Current user
│   ├── homedir: Home directory
│   └── shell: Shell path
├── Network
│   └── Network interface details
└── Process
    ├── pid: Process ID
    ├── nodeVersion: Node.js version
    ├── uptime: Node process uptime
    └── memoryUsage: Heap and RSS memory
```

## Troubleshooting

### "Configuration file not found"

```
✓ Solution: Copy agent-config.example.json to agent-config.json
           and update with your values
```

### "Failed to report metrics: 401 Unauthorized"

```
✓ Solution: Check that serverToken is correct
           Verify the server still exists in your dashboard
           Check that token hasn't expired
```

### "Failed to report metrics: 404 Not Found"

```
✓ Solution: Verify dashboardUrl is correct
           Make sure serverId matches the server in your dashboard
           Check that the API is running
```

### "Network errors / Connection refused"

```
✓ Solution: Check internet connectivity
           Verify dashboardUrl is accessible from this server
           Check firewall rules
           Test with: curl -H "Authorization: Bearer TOKEN" http://dashboardurl/api/servers
```

## Performance

- **Memory**: ~50-100MB at runtime
- **CPU**: <1% idle (spikes during metric collection)
- **Network**: ~2-5KB per report (at 5-second intervals = ~3.6MB/day)

## Security Notes

- ⚠️ Keep `agent-config.json` secure (contains authentication token)
- ⚠️ Don't commit `agent-config.json` to version control
- ⚠️ Use HTTPS for production dashboard URLs
- ⚠️ Rotate server tokens periodically from the dashboard

## Support

For issues or feature requests, contact your System View dashboard administrator.

## License

MIT
