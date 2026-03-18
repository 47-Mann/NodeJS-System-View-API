# System View API

A multi-server system monitoring dashboard with JWT authentication. Monitor CPU, memory, OS, and process information across multiple remote servers from a centralized dashboard.

## Features

✨ **Multi-Server Monitoring**

- Monitor unlimited remote servers from one dashboard
- Real-time metrics via WebSocket
- Secure token-based server authentication

🔐 **User Authentication**

- JWT-based authentication system
- Bcrypt password hashing
- Secure session management

📊 **Dashboard**

- Real-time system metrics visualization
- CPU, memory, OS, network, and process information
- Multiple server support

🤖 **Lightweight Agent**

- Zero-dependency Node.js agent script
- Deploy on remote servers to collect metrics
- Configurable reporting intervals (default: 5 seconds)

⚙️ **Built with**

- Express.js for API
- MongoDB + Mongoose for data storage
- Socket.IO for real-time communication
- JWT for authentication
- Morgan for HTTP logging
- Rate limiting for API protection

## Quick Start

### 1. Install & Run Dashboard

```bash
# Clone the repository
git clone https://github.com/47-Mann/NodeJS-System-View-API.git
cd NodeJS-System-View-API

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm start
```

The dashboard will be available at `http://localhost:5050/dashboard`

### 2. Setup Agent on Remote Server

```bash
# Copy the agent directory to your server
scp -r agent/ user@remote-server:/path/to/destination/

# On the remote server:
cd agent
cp agent-config.example.json agent-config.json

# Edit agent-config.json with:
# - Dashboard URL (e.g., https://your-app.com)
# - Server ID (from dashboard)
# - Server token (from dashboard)

# Run the agent
node agent.js
```

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Deploy Options:**

- ☁️ Railway.app (recommended - easiest)
- ☁️ Heroku
- 🖥️ AWS / DigitalOcean / VPS
- 🐳 Docker

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### POST `/api/auth/login`

Authenticate and receive JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### GET `/api/auth/me`

Get current authenticated user information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "_id": "...",
  "email": "user@example.com",
  "username": "username",
  "servers": [ ... ]
}
```

### Server Management Routes (`/api/servers`)

#### POST `/api/servers`

Create a new server enrollment.

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "name": "Production Server 1"
}
```

**Response:**

```json
{
  "_id": "server-id",
  "name": "Production Server 1",
  "owner": "user-id",
  "token": "unique-server-token",
  "lastHeartbeat": "2026-03-18T12:34:56Z"
}
```

#### GET `/api/servers`

List all servers for authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "_id": "server-id",
    "name": "Production Server 1",
    "token": "***",
    "lastHeartbeat": "2026-03-18T12:34:56Z"
  }
]
```

#### GET `/api/servers/:serverId`

Get server details with latest stats.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "server": { ... },
  "stats": [ ... ]
}
```

#### DELETE `/api/servers/:serverId`

Delete a server enrollment.

**Headers:**

```
Authorization: Bearer <token>
```

#### POST `/api/servers/:serverId/report`

Submit system metrics from agent.

**Headers:**

```
Authorization: Bearer <server-token>
```

**Request:**

```json
{
  "cpu": { ... },
  "memory": { ... },
  "os": { ... },
  "user": { ... },
  "network": { ... },
  "process": { ... }
}
```

### Legacy Dashboard Routes (`/`)

- `GET /` - Redirects to `/dashboard`
- `GET /dashboard` - View the dashboard UI
- `GET /cpu` - CPU info (legacy endpoint)
- `GET /memory` - Memory info (legacy endpoint)
- `GET /health` - Health check
- `GET /stats` - Recent stats history

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5050
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/system-view-api

# JWT Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-change-in-production

# Stats Collection (optional)
STATS_INTERVAL_MS=5000
STATS_RETENTION_HOURS=24
```

## Project Structure

```
.
├── src/
│   ├── app.js                 # Express server setup
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema with authentication
│   │   ├── Server.js         # Server enrollment schema
│   │   └── Stat.js           # System stats schema
│   ├── routes/
│   │   ├── authRoutes.js     # Authentication endpoints
│   │   ├── serverRoutes.js   # Server management endpoints
│   │   └── systemRoutes.js   # Legacy system info endpoints
│   ├── middlewares/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── errorHandler.js   # Global error handler
│   ├── services/
│   │   └── systemService.js  # System metric collection
│   ├── socket/
│   │   └── socketServer.js   # Real-time WebSocket setup
│   ├── public/
│   │   ├── index.html        # Dashboard UI
│   │   ├── app.js            # Dashboard JavaScript
│   │   └── styles.css        # Dashboard styling
│   └── utils/
│       └── format.js         # Formatting utilities
├── agent/
│   ├── agent.js              # Agent script for remote servers
│   ├── agent-config.example.json
│   ├── package.json
│   └── README.md
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── DEPLOYMENT.md             # Production deployment guide
└── README.md
```

## Testing the API

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Server Management

```bash
# Create server (use token from login response)
curl -X POST http://localhost:5050/api/servers \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Server"}'

# Get all servers
curl http://localhost:5050/api/servers \
  -H "Authorization: Bearer <your-token>"
```

## License

MIT

## Support

For issues, feature requests, or deployment help, check [DEPLOYMENT.md](./DEPLOYMENT.md) or review the [agent README](./agent/README.md).

Returns process information including PID, title, Node version, uptime, memory usage, and environment.

### GET /monitor

Returns all system information in a single response.

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2026-02-21T08:30:00.000Z"
}
```

### GET /leak

Simulates a memory leak by adding data to an in-memory array. Use for testing memory monitoring tools.

**Response:**

```json
{
  "message": "Memory leaked",
  "leakCount": 1
}
```

## Middleware

- **Morgan**: Logs HTTP requests in 'combined' format
- **Rate Limiting**: Limits to 100 requests per 15 minutes per IP address

## Dependencies

- Express: Web framework
- Morgan: HTTP request logger
- Express-rate-limit: Rate limiting middleware

## Development

The application uses ES modules (`"type": "module"` in package.json).

## Developed By

SAHIL MANN
