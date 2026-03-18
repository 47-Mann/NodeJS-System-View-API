# Production Deployment Guide (Dashboard-Only)

This project now runs as a dashboard-only service.

## Required Environment Variables

```env
PORT=5050
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/system-view-api
DATA_CLEANUP_INTERVAL_MS=300000
DATA_RETENTION_HOURS=24
SOCKET_EMIT_INTERVAL_MS=5000
STATS_COLLECTION_INTERVAL_MS=5000
```

## Deploy Checklist

- Dashboard loads at `/dashboard`
- Health route works at `/health`
- Realtime Socket.IO connection succeeds
- MongoDB is reachable from host environment
- HTTPS is enabled in production

## Railway (Quick Path)

1. Connect repository
2. Set the environment variables above
3. Deploy `main`
4. Open `/dashboard`

## Heroku / VPS

Deploy as a standard Node.js app and run:

```bash
npm install
npm start
```

If using a reverse proxy (Nginx), proxy to `http://localhost:5050` and allow WebSocket upgrades for Socket.IO.

## Security Notes

- Never commit `.env`
- Restrict MongoDB network access
- Keep dependencies updated
- Monitor logs and process health
