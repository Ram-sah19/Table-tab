# 🍽️ Table Tap - Restaurant QR Ordering System

A modern, mobile-first Restaurant QR Ordering System built with React, Tailwind CSS, Node.js, Express, MongoDB, and Real-Time WebSockets & SSE.

---

## 📁 Repository Structure

```
├── backend/                  # Standalone Express & Node.js API server
│   ├── config/               # Database & Environment configuration
│   ├── controllers/          # Route controllers (Auth, Food, Order, etc.)
│   ├── middlewares/          # JWT Auth & Error Handling middlewares
│   ├── models/               # Mongoose schemas (Food, Category, Order, User, etc.)
│   ├── realtime/             # Socket.IO and SSE event broadcaster
│   ├── routes/               # Express API route declarations
│   ├── utils/                # Utility helpers
│   ├── server.ts             # Main Express server entry point
│   ├── .env                  # Backend environment variables
│   ├── package.json          # Backend dependencies & scripts
│   └── tsconfig.json         # TypeScript configuration
│
├── frontend/                 # React & TanStack mobile-first application
│   ├── src/
│   │   ├── components/       # UI & business components
│   │   ├── hooks/            # React hooks
│   │   ├── lib/              # API client, realtime listener, and state
│   │   ├── routes/           # TanStack file-based routes
│   │   └── styles.css        # Tailwind styles & theme variables
│   ├── .env                  # Frontend configuration (API Proxy URL)
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.ts        # Vite configuration
│
└── package.json              # Root workspace scripts
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

*Backend runs on:* `http://localhost:5000`  
*API Health check:* `http://localhost:5000/api/health`

### 3. Start Frontend Client

In a separate terminal:

```bash
cd frontend
npm run dev
```

*Frontend runs on:* `http://localhost:3000`

---

## 🔑 Default Staff Credentials

- **Email:** `staff@restaurant.com`
- **Password:** `staff123`
- **Dashboard URL:** `/auth` -> `/staff/dashboard`

---

## 🛠️ Features

- 📱 **Mobile-First QR Ordering**: Table-specific ordering flow with seamless customization, search, and cart.
- ⚡ **Live Order Updates**: Real-time notifications for order confirmation, preparation, and completion via Socket.IO & SSE.
- 👨‍🍳 **Staff Dashboard**: Real-time Kanban order management, kitchen status updates, and food catalog controls.
- 🔔 **Call Waiter & Service Requests**: Digital waiter assistance, water refills, and bill requests.
- 💾 **MongoDB Atlas Database**: Persistent data storage with auto-seeding on initial boot.
