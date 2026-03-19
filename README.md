# System View Dashboard

A dashboard-only Node.js system monitor with realtime CPU and memory updates, plus recent snapshots persisted in MongoDB.

## What this version includes

- Dashboard UI at `/dashboard`
- Realtime updates via Socket.IO (`system-data` events)
- Snapshot persistence to MongoDB on an interval
- Automatic cleanup of old records


## Quick Start

```bash
git clone https://github.com/47-Mann/NodeJS-System-View-API.git
cd NodeJS-System-View-API
npm install
cp .env.example .env
npm start
```

Open: `http://localhost:5050/dashboard`

## Dashboard data routes

These routes are used internally by the dashboard frontend:

- `GET /health`
- `GET /monitor`
- `GET /stats`

## Environment Variables

```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/system-view-api
DATA_CLEANUP_INTERVAL_MS=300000
DATA_RETENTION_HOURS=24
SOCKET_EMIT_INTERVAL_MS=5000
STATS_COLLECTION_INTERVAL_MS=5000
```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server (same as start)

## Project Structure

```text
src/
  app.js
  config/db.js
  controllers/systemController.js
  middlewares/errorHandler.js
  models/Stat.js
  public/
    index.html
    app.js
    styles.css
  routes/systemRoutes.js
  services/systemService.js
  socket/socketServer.js
  utils/format.js
```

## Notes

- The app expects a running MongoDB instance (local or Atlas).
- Root `/` redirects to `/dashboard`.
