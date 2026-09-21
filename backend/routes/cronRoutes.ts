import { Request, Response } from "express";
import { Router } from "express";
import mongoose from "mongoose";
import { ENV } from "../config/env.js";

const router = Router();

// Called by an external scheduler (e.g. cron-job.org) to keep the
// Render free-tier instance warm. Requires the CRON_SECRET header.
router.get("/keep-alive", async (req: Request, res: Response) => {
  const secret = req.header("x-cron-secret");
  if (!ENV.CRON_SECRET || secret !== ENV.CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    db,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
