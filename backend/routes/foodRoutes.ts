import { Router } from "express";
import {
  getFoods,
  getFoodById,
  createOrUpdateFood,
  deleteFood,
  toggleAvailability,
} from "../controllers/foodController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public menu browsing
router.get("/", getFoods);
router.get("/:id", getFoodById);

// Staff-protected menu mutations
router.post("/", requireAuth, createOrUpdateFood);
router.delete("/:id", requireAuth, deleteFood);
router.patch("/:id/availability", requireAuth, toggleAvailability);

export default router;
