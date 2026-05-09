# Deployment Guide

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB 6+ (local or MongoDB Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET at minimum
npm install
npm run seed     # Seed sample data (optional)
npm run dev      # Start with nodemon
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Default credentials after seeding:
- Admin: `admin@smartwaste.com` / `Admin@123`
- User:  `jane@example.com` / `User@123`

---

## Production Deployment

### Backend on Railway / Render / Fly.io

1. Push your repo to GitHub
2. Connect to Railway/Render
3. Set environment variables from `.env.example`
4. Build command: `npm install`
5. Start command: `node server.js`

### Backend on VPS (Ubuntu)

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and install
git clone <repo_url> && cd smart-waste-management/backend
npm install --production
cp .env.example .env && nano .env

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name smart-waste-api
pm2 save && pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /path/to/backend/src/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Frontend on Vercel / Netlify

```bash
cd frontend
npm run build    # outputs to dist/
```

Vercel: Import repo → set root to `frontend` → set `VITE_API_URL`
Netlify: Drag & drop `dist/` folder or connect GitHub

---

## MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas
2. Whitelist your server IP
3. Get connection string:
   ```
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smart-waste-db?retryWrites=true&w=majority
   ```

---

## Environment Variables Checklist

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Min 32 random chars |
| `JWT_EXPIRE` | ✅ | e.g. `7d` |
| `FRONTEND_URL` | ✅ | For CORS + redirect |
| `GOOGLE_CLIENT_ID` | ⚠️ | Only if using Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Only if using Google OAuth |
| `EMAIL_HOST/USER/PASS` | ⚠️ | Only if email alerts needed |
| `TWILIO_*` | ⚠️ | Only if SMS alerts needed |
| `OPENAI_API_KEY` | ⚠️ | AI suggestions (has keyword fallback) |