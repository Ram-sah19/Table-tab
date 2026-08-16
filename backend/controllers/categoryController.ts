import { Request, Response } from "express";
import { Category } from "../models/index.js";
import { normalizeDoc } from "../utils/normalize.js";

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await Category.find().sort({ sort_order: 1 }).lean();
    res.json(categories.map((c) => normalizeDoc(c)));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch categories";
    res.status(500).json({ error: msg });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, emoji } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const count = await Category.countDocuments();
    const cat = await Category.create({
      name: name.trim(),
      slug,
      emoji: emoji || "",
      sort_order: count + 1,
    });

    res.status(201).json(normalizeDoc(cat.toObject()));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create category";
    res.status(500).json({ error: msg });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete category";
    res.status(500).json({ error: msg });
  }
}
