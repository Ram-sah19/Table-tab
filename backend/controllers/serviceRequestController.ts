import { Request, Response } from "express";
import { ServiceRequest } from "../models/index.js";
import { normalizeDoc } from "../utils/normalize.js";
import { broadcastEvent } from "../realtime/realtime.js";

export async function getServiceRequests(_req: Request, res: Response) {
  try {
    const requests = await ServiceRequest.find().sort({ created_at: -1 }).limit(100).lean();
    res.json(requests.map((r) => normalizeDoc(r)));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch service requests";
    res.status(500).json({ error: msg });
  }
}

export async function createServiceRequest(req: Request, res: Response) {
  try {
    const { table_number, customer_name, type, note } = req.body;
    if (!table_number || !type) {
      res.status(400).json({ error: "Table number and service type are required" });
      return;
    }

    const created = await ServiceRequest.create({
      table_number,
      customer_name: customer_name || "",
      type,
      note: note || "",
      status: "open",
    });

    const normalized = normalizeDoc(created.toObject());

    // Broadcast to real-time subscribers
    broadcastEvent("service_requests", "INSERT", normalized);

    res.status(201).json(normalized);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create service request";
    res.status(500).json({ error: msg });
  }
}

export async function resolveServiceRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await ServiceRequest.findByIdAndUpdate(
      id,
      { status: "resolved", updated_at: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }

    const normalized = normalizeDoc(updated);

    // Broadcast to real-time subscribers
    broadcastEvent("service_requests", "UPDATE", normalized);

    res.json(normalized);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to resolve service request";
    res.status(500).json({ error: msg });
  }
}
