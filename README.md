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
