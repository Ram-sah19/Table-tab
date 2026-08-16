import { Router } from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categoryController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public category listing for customer menu
router.get("/", getCategories);

// Staff-protected category management
router.post("/", requireAuth, createCategory);
router.delete("/:id", requireAuth, deleteCategory);

export default router;
