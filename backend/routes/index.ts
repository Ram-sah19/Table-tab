import { Router } from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import foodRoutes from "./foodRoutes.js";
import orderRoutes from "./orderRoutes.js";
import serviceRequestRoutes from "./serviceRequestRoutes.js";
import realtimeRoutes from "./realtimeRoutes.js";

const router = Router();

// Health Check
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/foods", foodRoutes);
router.use("/orders", orderRoutes);
router.use("/service-requests", serviceRequestRoutes);
router.use("/realtime", realtimeRoutes);

export default router;
