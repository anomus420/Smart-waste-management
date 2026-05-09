# 🌿 Smart Waste Management System

A full-stack MERN application enabling citizens to report waste complaints, request e-waste pickups, and find nearby waste centres — with a full admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS + Context API |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth 2.0 |
| Uploads | Multer (local disk) |
| AI | OpenAI GPT-3.5 (with keyword fallback) |
| Email | Nodemailer |
| SMS | Twilio |

## Quick Start

```bash
# Backend
cd backend && cp .env.example .env
npm install && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev
```

Visit: http://localhost:5173

## Features

- **Complaint System** — file, track, and manage waste complaints with image upload and real-time status updates
- **E-Waste Pickup** — schedule doorstep collection for electronics
- **Map View** — locate nearby waste collection centres
- **Awareness Hub** — educational articles on waste management
- **AI Suggestions** — automatic category detection + resolution tips
- **Admin Dashboard** — analytics, complaint management, user management
- **Notifications** — in-app + email + SMS alerts on status changes

## Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartwaste.com | Admin@123 |
| User | jane@example.com | User@123 |

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)