import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAuth } from "../middlewares/auth.js";
import { orderRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Staff protected orders list
router.get("/", requireAuth, getOrders);

// Diner order tracking (public by order ID)
router.get("/:id", getOrderById);

// Rate-limited diner order creation
router.post("/", orderRateLimiter, createOrder);

// Staff protected order status updates
router.patch("/:id/status", requireAuth, updateOrderStatus);

export default router;
