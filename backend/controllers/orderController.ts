import { Request, Response } from "express";
import { Order, Food, getNextOrderNumber } from "../models/index.js";
import { normalizeDoc } from "../utils/normalize.js";
import { broadcastEvent } from "../realtime/realtime.js";

export async function getOrders(_req: Request, res: Response) {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).limit(200).lean();
    res.json(orders.map((o) => normalizeDoc(o)));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: msg });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    let order = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).lean();
    } else if (!isNaN(Number(id))) {
      order = await Order.findOne({ order_number: Number(id) }).lean();
    }

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(normalizeDoc(order));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ error: msg });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const body = req.body;
    if (!body.customer_name || !body.table_number || !body.items || !Array.isArray(body.items) || !body.items.length) {
      res.status(400).json({ error: "Customer name, table number and valid items array are required" });
      return;
    }

    const customer_name = String(body.customer_name).trim().slice(0, 60);
    const table_number = String(body.table_number).trim().slice(0, 10);
    const special_instructions = body.special_instructions ? String(body.special_instructions).trim().slice(0, 300) : "";

    if (customer_name.length < 2) {
      res.status(400).json({ error: "Customer name must be at least 2 characters" });
      return;
    }

    // Fetch all available foods to verify authentic prices
    const itemNames = body.items.map((i: any) => i.name);
    const dbFoods = await Food.find({ name: { $in: itemNames } }).lean();
    const foodMap = new Map(dbFoods.map((f) => [f.name.toLowerCase(), f]));

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of body.items) {
      const qty = Math.max(1, Math.min(50, Math.floor(Number(item.qty) || 1)));
      const cleanName = String(item.name || "").trim().slice(0, 100);
      
      // Match price with DB
      const dbFood = foodMap.get(cleanName.toLowerCase());
      let authenticPrice = Number(item.price);
      if (dbFood && typeof dbFood.price === "number") {
        authenticPrice = dbFood.price;
      } else if (isNaN(authenticPrice) || authenticPrice < 0) {
        authenticPrice = 0;
      }

      calculatedSubtotal += qty * authenticPrice;

      verifiedItems.push({
        name: cleanName,
        qty,
        price: authenticPrice,
        options: Array.isArray(item.options) ? item.options.map((o: any) => String(o).slice(0, 60)) : [],
        note: item.note ? String(item.note).slice(0, 100) : "",
      });
    }

    const calculatedTax = Number((calculatedSubtotal * 0.08).toFixed(2)); // 5% GST + 3% Service
    
    // Check if client provided tip (validated between 0 and 50% of subtotal)
    let tipAmount = 0;
    if (typeof body.tip === "number" && body.tip >= 0 && body.tip <= calculatedSubtotal * 0.5) {
      tipAmount = Number(body.tip.toFixed(2));
    }

    const calculatedTotal = Number((calculatedSubtotal + calculatedTax + tipAmount).toFixed(2));
    const eta_minutes = Math.max(10, Math.min(60, verifiedItems.length * 6));

    const order_number = await getNextOrderNumber();
    const order = await Order.create({
      customer_name,
      table_number,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      special_instructions,
      order_number,
      eta_minutes,
      status: "received",
    });

    const normalized = normalizeDoc(order.toObject());

    // Broadcast to real-time subscribers (SSE + Socket.IO)
    broadcastEvent("orders", "INSERT", normalized);

    res.status(201).json(normalized);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({ error: msg });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["received", "confirmed", "preparing", "ready", "served", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const normalized = normalizeDoc(updated);

    // Broadcast real-time events to both the orders dashboard and the customer's order tracking room
    broadcastEvent("orders", "UPDATE", normalized);
    broadcastEvent(`order:${id}`, "UPDATE", normalized);

    res.json(normalized);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update order status";
    res.status(500).json({ error: msg });
  }
}
