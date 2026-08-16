import "./lib/error-capture";
import fs from "node:fs";
import path from "node:path";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Sync generated food images to public/images/food/
function syncFoodPhotos() {
  try {
    const brainDir = "C:\\Users\\Rambilas\\.gemini\\antigravity\\brain\\47b0e025-96d7-4d93-82d4-4bf058b69600";
    const targetDir = path.resolve(process.cwd(), "public/images/food");

    const imageMappings = [
      { match: "dal_makhani", dest: "dal_makhani.jpg" },
      { match: "butter_chicken", dest: "butter_chicken.jpg" },
      { match: "chicken_biryani", dest: "chicken_biryani.jpg" },
      { match: "margherita_pizza", dest: "margherita_pizza.jpg" },
      { match: "loaded_nachos", dest: "loaded_nachos.jpg" },
      { match: "mango_lassi", dest: "mango_lassi.jpg" },
      { match: "gulab_jamun", dest: "gulab_jamun.jpg" },
      { match: "tiramisu_jar", dest: "tiramisu_jar.jpg" },
      { match: "crispy_chicken_wrap", dest: "crispy_chicken_wrap.jpg" },
      { match: "fresh_lime_soda", dest: "fresh_lime_soda.jpg" },
      { match: "veg_biryani", dest: "veg_biryani.jpg" },
      { match: "mutton_rogan_josh", dest: "mutton_rogan_josh.jpg" },
      { match: "paneer_skewers", dest: "paneer_skewers.jpg" },
    ];

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(brainDir)) {
      const brainFiles = fs.readdirSync(brainDir);
      for (const map of imageMappings) {
        const file = brainFiles.find((f) => f.startsWith(map.match) && f.endsWith(".jpg"));
        if (file) {
          const srcPath = path.join(brainDir, file);
          const destPath = path.join(targetDir, map.dest);
          if (!fs.existsSync(destPath) || fs.statSync(destPath).size !== fs.statSync(srcPath).size) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    }
  } catch {
    // Ignore if running in pure browser worker
  }
}

syncFoodPhotos();

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_API_URL || "http://127.0.0.1:5000";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Proxy API requests to standalone backend server
    if (url.pathname.startsWith("/api/")) {
      try {
        const backendTarget = new URL(url.pathname + url.search, BACKEND_URL);
        const headers = new Headers(request.headers);
        headers.set("host", backendTarget.host);

        const init: RequestInit & { duplex?: string } = {
          method: request.method,
          headers,
        };

        if (request.method !== "GET" && request.method !== "HEAD") {
          init.body = request.body;
          init.duplex = "half";
        }

        return await fetch(backendTarget.toString(), init);
      } catch (proxyError) {
        console.error("[SSR Backend Proxy Error]:", proxyError);
        return new Response(
          JSON.stringify({
            error: "Backend server is unavailable. Please ensure the backend is running on port 5000.",
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
