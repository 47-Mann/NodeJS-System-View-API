# System Information API

A Node.js API built with Express that provides system information and monitoring capabilities.

## Features

- **System Information Endpoints**: CPU, memory, OS, user, network, and process details
- **Health Check**: Endpoint to verify service status
- **System Monitoring**: Comprehensive system stats in one endpoint
- **Memory Leak Simulation**: Testing endpoint for memory leak scenarios
- **Request Logging**: Morgan middleware for HTTP request logging
- **Rate Limiting**: Express-rate-limit to prevent abuse (100 requests per 15 minutes per IP)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Start the server:

```bash
npm start
# or
node app.js
```

The server will run on `http://localhost:3000` by default. You can set a custom port with the `PORT` environment variable.

## API Endpoints

### GET /

Returns API information and available endpoints.

**Response:**

```json
{
  "name": "System Information API",
  "version": "1.0.0",
  "description": "API to fetch system information using Node.js",
  "endpoints": {
    "/cpu": "Get CPU information",
    "/memory": "Get Memory information",
    "/os": "Get OS information",
    "/user": "Get User information",
    "/network": "Get Network information",
    "/process": "Get Process information",
    "/monitor": "Get all system information",
    "/health": "Health check",
    "/leak": "Simulate memory leak (for testing)"
  }
}
```

### GET /cpu

Returns CPU information including model, cores, architecture, and load average.

### GET /memory

Returns memory information including total, free, and usage percentage.

### GET /os

Returns OS information including platform, type, release, hostname, and uptime.

### GET /user

Returns user information.

### GET /network

Returns network interfaces information.

### GET /process

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


