import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "./db";
import {
  Category,
  Food,
  Order,
  ServiceRequest,
  User,
  getNextOrderNumber,
} from "./models";
import { broadcastEvent, realtimeEmitter } from "./realtime";

const JWT_SECRET = process.env.JWT_SECRET || "seamless-serve-secure-jwt-secret-key-2026";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function normalize<T extends { _id?: unknown; id?: string }>(doc: T): T & { id: string } {
  const json = JSON.parse(JSON.stringify(doc)) as T & { _id?: unknown };
  return {
    ...json,
    id: (json._id ? String(json._id) : json.id) as string,
  };
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    await connectDB();

    // --- REALTIME SSE STREAM ---
    if (pathname === "/api/realtime" && request.method === "GET") {
      let listener: ((payload: unknown) => void) | null = null;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(": connected\n\n"));

          listener = (payload: unknown) => {
            try {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
              );
            } catch {
              // Stream closed
            }
          };

          realtimeEmitter.on("broadcast", listener);
        },
        cancel() {
          if (listener) {
            realtimeEmitter.off("broadcast", listener);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // --- AUTHENTICATION ---
    if (pathname === "/api/auth/login" && request.method === "POST") {
      const body = await request.json();
      const user = await User.findOne({ email: body.email.toLowerCase().trim() });
      if (!user) return jsonResponse({ error: "Invalid email or password" }, 401);
      const match = await bcrypt.compare(body.password, user.password_hash);
      if (!match) return jsonResponse({ error: "Invalid email or password" }, 401);

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role, full_name: user.full_name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return jsonResponse({
        token,
        user: { id: user._id.toString(), email: user.email, full_name: user.full_name, role: user.role },
      });
    }

    if (pathname === "/api/auth/register" && request.method === "POST") {
      const body = await request.json();
      const email = body.email.toLowerCase().trim();
      const existing = await User.findOne({ email });
      if (existing) return jsonResponse({ error: "User already exists with this email" }, 400);

      const password_hash = await bcrypt.hash(body.password, 10);
      const user = await User.create({
        email,
        password_hash,
        full_name: body.full_name || email.split("@")[0],
        role: "staff",
      });

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role, full_name: user.full_name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return jsonResponse({
        token,
        user: { id: user._id.toString(), email: user.email, full_name: user.full_name, role: user.role },
      });
    }

    if (pathname === "/api/auth/verify" && request.method === "POST") {
      const body = await request.json();
      try {
        const decoded = jwt.verify(body.token, JWT_SECRET);
        return jsonResponse({ valid: true, user: decoded });
      } catch {
        return jsonResponse({ valid: false, user: null }, 401);
      }
    }

    // --- CATEGORIES ---
    if (pathname === "/api/categories") {
      if (request.method === "GET") {
        const categories = await Category.find().sort({ sort_order: 1 }).lean();
        return jsonResponse(categories.map((c) => normalize(c)));
      }
      if (request.method === "POST") {
        const body = await request.json();
        const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const count = await Category.countDocuments();
        const cat = await Category.create({ name: body.name, slug, emoji: body.emoji || "", sort_order: count + 1 });
        return jsonResponse(normalize(cat.toObject()), 201);
      }
    }

    if (pathname.startsWith("/api/categories/") && request.method === "DELETE") {
      const id = pathname.replace("/api/categories/", "");
      await Category.findByIdAndDelete(id);
      return jsonResponse({ success: true });
    }

    // --- FOODS ---
    if (pathname === "/api/foods") {
      if (request.method === "GET") {
        const foods = await Food.find().sort({ created_at: 1 }).lean();
        return jsonResponse(foods.map((f) => normalize(f)));
      }
      if (request.method === "POST") {
        const body = await request.json();
        const { id, ...payload } = body;
        if (id) {
          const updated = await Food.findByIdAndUpdate(id, payload, { new: true }).lean();
          return jsonResponse(updated ? normalize(updated) : null);
        } else {
          const created = await Food.create(payload);
          return jsonResponse(normalize(created.toObject()), 201);
        }
      }
    }

    if (pathname.startsWith("/api/foods/") && request.method === "DELETE") {
      const id = pathname.replace("/api/foods/", "");
      await Food.findByIdAndDelete(id);
      return jsonResponse({ success: true });
    }

    // --- ORDERS ---
    if (pathname === "/api/orders") {
      if (request.method === "GET") {
        const orders = await Order.find().sort({ created_at: -1 }).limit(200).lean();
        return jsonResponse(orders.map((o) => normalize(o)));
      }
      if (request.method === "POST") {
        const body = await request.json();
        const order_number = await getNextOrderNumber();
        const order = await Order.create({
          ...body,
          order_number,
          status: "received",
        });
        const normalized = normalize(order.toObject());
        // Real-time broadcast
        broadcastEvent("orders", "INSERT", normalized);
        return jsonResponse(normalized, 201);
      }
    }

    const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (orderStatusMatch && request.method === "PATCH") {
      const orderId = orderStatusMatch[1];
      const body = await request.json();
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { status: body.status, updated_at: new Date() },
        { new: true }
      ).lean();
      if (!updated) return jsonResponse({ error: "Order not found" }, 404);
      const normalized = normalize(updated);
      // Real-time broadcast to orders list and individual order room
      broadcastEvent("orders", "UPDATE", normalized);
      broadcastEvent(`order:${orderId}`, "UPDATE", normalized);
      return jsonResponse(normalized);
    }

    const singleOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (singleOrderMatch && request.method === "GET") {
      const orderId = singleOrderMatch[1];
      const order = await Order.findById(orderId).lean();
      if (!order) return jsonResponse(null, 404);
      return jsonResponse(normalize(order));
    }

    // --- SERVICE REQUESTS ---
    if (pathname === "/api/service-requests") {
      if (request.method === "GET") {
        const requests = await ServiceRequest.find().sort({ created_at: -1 }).limit(100).lean();
        return jsonResponse(requests.map((r) => normalize(r)));
      }
      if (request.method === "POST") {
        const body = await request.json();
        const req = await ServiceRequest.create({ ...body, status: "open" });
        const normalized = normalize(req.toObject());
        // Real-time broadcast
        broadcastEvent("service_requests", "INSERT", normalized);
        return jsonResponse(normalized, 201);
      }
    }

    const resolveReqMatch = pathname.match(/^\/api\/service-requests\/([^/]+)\/resolve$/);
    if (resolveReqMatch && request.method === "PATCH") {
      const reqId = resolveReqMatch[1];
      const updated = await ServiceRequest.findByIdAndUpdate(
        reqId,
        { status: "resolved", updated_at: new Date() },
        { new: true }
      ).lean();
      if (!updated) return jsonResponse({ error: "Request not found" }, 404);
      const normalized = normalize(updated);
      // Real-time broadcast
      broadcastEvent("service_requests", "UPDATE", normalized);
      return jsonResponse(normalized);
    }

    return jsonResponse({ error: "Not Found" }, 404);
  } catch (err: unknown) {
    console.error(`[API Error] ${request.method} ${pathname}:`, err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return jsonResponse({ error: msg }, 500);
  }
}
