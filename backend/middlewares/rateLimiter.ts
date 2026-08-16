import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time frame in milliseconds
  max: number;      // Max allowed requests in the time window
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options;
  const requests = new Map<string, { count: number; resetTime: number }>();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now > record.resetTime) {
        requests.delete(key);
      }
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "anonymous";
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

// Limit orders to max 15 per minute per IP
export const orderRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: "Order submission rate limit exceeded. Please wait a moment before sending more orders.",
});

// Limit waiter assistance calls to max 6 per minute per IP
export const waiterRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 6,
  message: "Waiter assistance request rate limit exceeded. Please wait a minute before requesting assistance again.",
});
