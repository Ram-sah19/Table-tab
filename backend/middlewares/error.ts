import { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  if (err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number") {
    res.status((err as { status: number }).status).json({
      error: (err as { message?: string }).message || "An error occurred",
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ error: message });
}
