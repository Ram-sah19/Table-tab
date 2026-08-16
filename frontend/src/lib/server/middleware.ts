import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "seamless-serve-secure-jwt-secret-key-2026";

export interface AuthPayload {
  userId: string;
  email: string;
  role: "admin" | "staff";
  full_name: string;
}

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  // Also allow token in query string for SSE streams (EventSource can't set headers)
  const url = new URL(request.url);
  return url.searchParams.get("token");
}

export function requireAuth(request: Request): AuthPayload {
  const token = extractToken(request);
  if (!token) {
    throw new AuthError("Authentication required", 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch {
    throw new AuthError("Invalid or expired token", 401);
  }
}

export function requireRole(request: Request, role: "admin" | "staff"): AuthPayload {
  const payload = requireAuth(request);
  if (payload.role !== role && payload.role !== "admin") {
    throw new AuthError("Insufficient permissions", 403);
  }
  return payload;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
