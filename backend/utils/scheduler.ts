import cron from "node-cron";
import { ENV } from "../config/env.js";

export function startScheduler() {
  if (!ENV.CRON_SECRET) {
    console.warn("[cron] CRON_SECRET not set — keep-alive scheduler disabled");
    return;
  }
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${ENV.PORT}`;

  cron.schedule("*/12 * * * *", async () => {
    try {
      const res = await fetch(`${baseUrl}/api/cron/keep-alive`, {
        headers: { "x-cron-secret": ENV.CRON_SECRET },
      });
      console.log(`[cron] keep-alive ping -> ${res.status}`);
    } catch (error) {
      console.error("[cron] keep-alive ping failed:", error);
    }
  });

  console.log("[cron] keep-alive scheduler running (every 12 minutes)");
}
