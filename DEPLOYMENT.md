# Production Deployment Guide

Your System View API is ready for production! Choose your hosting platform and follow the steps below.

## Prerequisites

- Git repository pushed to GitHub
- MongoDB Atlas account (free tier available)
- Hosting platform account (Railway, Heroku, or similar)
- `.env` file with production values (never commit this)

## Environment Setup

### 1. Create Production `.env` File

Never commit `.env` to git. Instead, use environment variables in your platform's dashboard.

Required variables:

```
PORT=5050
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/system-view-api
JWT_SECRET=your-super-secret-key-minimum-32-characters-change-this
NODE_ENV=production
```

### 2. Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Copy the connection string in format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
5. Keep this secure!

### 3. Generate JWT Secret

```bash
# Generate a random 32+ character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Option A: Deploy to Railway

Railway is the easiest option for quick deployment.

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Connect your GitHub repository:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your NodeJS-System-View-API repository
   - Authorize and confirm

3. **Add MongoDB Plugin:**
   - In Railway dashboard, click "Add" (near Services)
   - Select "Database" → "MongoDB"
   - It will auto-generate a `DATABASE_URL` connection string

4. **Set Environment Variables:**
   - Go to "Variables" tab
   - Add these variables:
     ```
     PORT=5050
     NODE_ENV=production
     JWT_SECRET=<your-generated-secret>
     MONGODB_URI=<your-mongodb-atlas-url>
     ```

5. **Deploy:**
   - Railway auto-deploys your `main` branch
   - Check deployment logs in the dashboard
   - Your app will be live at: `https://<your-project-name>.up.railway.app`

### Test Production Deployment:

```bash
# Test the API is running
curl https://<your-project-name>.up.railway.app/

# Should redirect to /dashboard
# Open in browser: https://<your-project-name>.up.railway.app/dashboard
```

---

## Option B: Deploy to Heroku

Heroku is another popular option (note: free tier was removed, but still affordable).

### Steps:

1. **Install Heroku CLI:**

   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login to Heroku:**

   ```bash
   heroku login
   ```

3. **Create a Heroku app:**

   ```bash
   heroku create <your-app-name>
   ```

4. **Add MongoDB Atlas:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster and database user
   - Get your connection string

5. **Set Environment Variables:**

   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/dbname"
   heroku config:set JWT_SECRET="<your-generated-secret>"
   heroku config:set NODE_ENV="production"
   ```

6. **Deploy:**

   ```bash
   git push heroku main
   ```

7. **View logs:**
   ```bash
   heroku logs --tail
   ```

### Test Production Deployment:

```bash
# Your app is live at
heroku open

# Or visit: https://<your-app-name>.herokuapp.com/dashboard
```

---

## Option C: Manual VPS Deployment (AWS/DigitalOcean/Linode)

For full control and scalability.

### Setup on VPS:

1. **SSH into your server:**

   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js & npm:**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your repository:**

   ```bash
   git clone https://github.com/47-Mann/NodeJS-System-View-API.git
   cd NodeJS-System-View-API
   npm install
   ```

4. **Create `.env` file with production values:**

   ```bash
   nano .env
   # Add your production variables
   ```

5. **Install PM2 (process manager):**

   ```bash
   sudo npm install -g pm2
   ```

6. **Start your app:**

   ```bash
   pm2 start src/app.js --name "system-view-api"
   pm2 startup
   pm2 save
   ```

7. **Setup reverse proxy (Nginx):**

   ```bash
   sudo apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/system-view-api`:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5050;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/system-view-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Dashboard loads at `/dashboard`
- [ ] API authentication works: `curl -X POST https://your-app.com/api/auth/login`
- [ ] Can create server enrollment via dashboard
- [ ] Agent script can POST metrics to `/api/servers/:serverId/report`
- [ ] Environment variables are set (never committed to git)
- [ ] HTTPS/SSL is enabled
- [ ] MongoDB backups are configured
- [ ] Logs are monitored

---

## Deployment URLs by Platform

| Platform      | URL Format                              |
| ------------- | --------------------------------------- |
| Railway       | `https://<project-name>.up.railway.app` |
| Heroku        | `https://<app-name>.herokuapp.com`      |
| Custom Domain | `https://your-domain.com`               |

---

## Security Checklist for Production

- ⚠️ Never commit `.env` file to git
- ⚠️ Use strong JWT_SECRET (32+ random characters)
- ⚠️ Enable HTTPS/SSL (mandatory for authentication)
- ⚠️ Set MongoDB user with minimal required permissions
- ⚠️ Configure CORS properly if frontend is separate
- ⚠️ Enable rate limiting (already in `src/app.js`)
- ⚠️ Rotate JWT_SECRET periodically
- ⚠️ Monitor MongoDB quota and backups
- ⚠️ Keep Node.js and dependencies updated
- ⚠️ Log errors and monitor application health

---

## Next Steps After Deployment

1. **Configure your agent:**
   - Update `agent/agent-config.json` with production dashboardUrl
   - Deploy agent script to your remote servers
   - Monitor metrics flowing in

2. **Add custom domain (optional):**
   - Point your domain to your hosting platform
   - Enable HTTPS certificates

3. **Monitor in production:**
   - Check application logs regularly
   - Monitor MongoDB usage
   - Track API response times

4. **Future enhancements:**
   - Add alerting system
   - Add historical charts
   - Build admin panel
   - Implement token rotation

---

## Troubleshooting

### App won't start

```bash
# Check logs
heroku logs --tail          # Heroku
pm2 logs system-view-api   # PM2
```

### "Cannot connect to MongoDB"

- Verify MONGODB_URI in your environment
- Check MongoDB Atlas allows your server IP
- Ensure database user exists and has correct permissions

### "JWT_SECRET not set"

- Verify JWT_SECRET is in your environment variables
- Use `console.log(process.env.JWT_SECRET)` to debug

### Agent can't reach dashboard

- Verify dashboardUrl is correct and accessible
- Check network firewall/security groups
- Test with `curl https://your-app.com/api/servers`

---

## Support

For issues:

1. Check application logs
2. Verify environment variables
3. Test with `curl` before debugging in code
4. Check MongoDB connection and quotas

Happy deploying! 🚀
