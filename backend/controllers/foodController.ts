import { Request, Response } from "express";
import { Food } from "../models/index.js";
import { normalizeDoc } from "../utils/normalize.js";

export async function getFoods(_req: Request, res: Response) {
  try {
    const foods = await Food.find().sort({ created_at: 1 }).lean();
    res.json(foods.map((f) => normalizeDoc(f)));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch food items";
    res.status(500).json({ error: msg });
  }
}

export async function getFoodById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const food = await Food.findById(id).lean();
    if (!food) {
      res.status(404).json({ error: "Food item not found" });
      return;
    }
    res.json(normalizeDoc(food));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch food item";
    res.status(500).json({ error: msg });
  }
}

export async function createOrUpdateFood(req: Request, res: Response) {
  try {
    const { id, ...payload } = req.body;

    if (id) {
      const updated = await Food.findByIdAndUpdate(id, payload, { new: true }).lean();
      if (!updated) {
        res.status(404).json({ error: "Food item not found" });
        return;
      }
      res.json(normalizeDoc(updated));
    } else {
      if (!payload.name || payload.price === undefined) {
        res.status(400).json({ error: "Name and price are required" });
        return;
      }
      const created = await Food.create(payload);
      res.status(201).json(normalizeDoc(created.toObject()));
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save food item";
    res.status(500).json({ error: msg });
  }
}

export async function deleteFood(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete food item";
    res.status(500).json({ error: msg });
  }
}

export async function toggleAvailability(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { is_available } = req.body;
    const updated = await Food.findByIdAndUpdate(
      id,
      { is_available: Boolean(is_available) },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: "Food item not found" });
      return;
    }
    res.json(normalizeDoc(updated));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update availability";
    res.status(500).json({ error: msg });
  }
}
