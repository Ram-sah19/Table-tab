import http from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";
import { setSocketServer } from "./realtime/realtime.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

setSocketServer(io);

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join a specific channel/room (e.g., "orders", "service_requests", "order:65abcd...")
  socket.on("join", (room: string) => {
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("leave", (room: string) => {
    socket.leave(room);
    console.log(`[Socket.IO] Socket ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Security & Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, local IPs, or CLIENT_URL, plus mobile native webviews
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin === ENV.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, configurable via ENV.CLIENT_URL
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Payload size limiting & basic security headers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api", apiRoutes);

// Error Handling
app.use(errorHandler);

// Start Server
async function start() {
  try {
    await connectDB();
    server.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(`=========================================`);
      console.log(` Table Tap Backend Server Running!`);
      console.log(` Port:    http://127.0.0.1:${ENV.PORT}`);
      console.log(` Health:  http://127.0.0.1:${ENV.PORT}/api/health`);
      console.log(` SSE:     http://127.0.0.1:${ENV.PORT}/api/realtime`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error("[Server Startup Error]:", error);
    process.exit(1);
  }
}

start();
