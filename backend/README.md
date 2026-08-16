# Table Tap Backend Server

REST API & Real-time Server for the Table Tap Restaurant QR Ordering System.

## Architecture (Flat Structure)

```
backend/
├── config/              # Database (MongoDB) & environment configuration
│   ├── db.ts
│   └── env.ts
├── controllers/         # Request handlers (Auth, Foods, Orders, etc.)
│   ├── authController.ts
│   ├── categoryController.ts
│   ├── foodController.ts
│   ├── orderController.ts
│   └── serviceRequestController.ts
├── middlewares/         # JWT Authentication & Error Handler
│   ├── auth.ts
│   └── error.ts
├── models/              # Mongoose schemas (Food, Order, User, etc.)
│   ├── Category.ts
│   ├── Counter.ts
│   ├── Food.ts
│   ├── Order.ts
│   ├── ServiceRequest.ts
│   ├── User.ts
│   └── index.ts
├── realtime/            # Socket.IO & SSE broadcaster
│   └── realtime.ts
├── routes/              # Express API route endpoints
│   ├── authRoutes.ts
│   ├── categoryRoutes.ts
│   ├── foodRoutes.ts
│   ├── orderRoutes.ts
│   ├── realtimeRoutes.ts
│   ├── serviceRequestRoutes.ts
│   └── index.ts
├── utils/
│   └── normalize.ts
├── server.ts            # Main server entry point (Express + Socket.IO)
├── .env                 # Environment variables
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Ensure `.env` exists:
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI="mongodb+srv://raa705086_db_user:MFLJQhnHAH79oXT9@cluster0.mbredbz.mongodb.net/seamless_serve?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="seamless-serve-secure-jwt-secret-key-2026"
```

### 3. Run Server
```bash
# Development mode (auto-reload on save)
npm run dev

# Production build & start
npm run build
npm start
```

---

## API Endpoints Summary

- `GET /api/health` - Server health check
- `POST /api/auth/login` - Staff login
- `POST /api/auth/register` - Staff register
- `POST /api/auth/verify` - JWT token verification
- `GET /api/categories` - List categories
- `GET /api/foods` - List all foods
- `GET /api/orders` - Get all live orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status (with instant real-time broadcast)
- `GET /api/service-requests` - List service requests
- `POST /api/service-requests` - Call waiter / request water / bill
- `GET /api/realtime` - Server-Sent Events (SSE) live updates
- `Socket.IO` on `/` - WebSocket connection & room subscriptions
