import { Router } from "express";
import {
  getServiceRequests,
  createServiceRequest,
  resolveServiceRequest,
} from "../controllers/serviceRequestController.js";
import { requireAuth } from "../middlewares/auth.js";
import { waiterRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Staff-protected waiter request feed
router.get("/", requireAuth, getServiceRequests);

// Diner rate-limited assistance call
router.post("/", waiterRateLimiter, createServiceRequest);

// Staff-protected resolve request
router.patch("/:id/resolve", requireAuth, resolveServiceRequest);

export default router;
