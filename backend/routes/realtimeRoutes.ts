import { Router, Request, Response } from "express";
import { realtimeEmitter } from "../realtime/realtime.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  // Send initial handshake
  res.write(": connected\n\n");

  const listener = (payload: unknown) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      // client disconnected
    }
  };

  realtimeEmitter.on("broadcast", listener);

  req.on("close", () => {
    realtimeEmitter.off("broadcast", listener);
  });
});

export default router;
