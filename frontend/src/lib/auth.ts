import { verifyTokenServerFn } from "./api";

const AUTH_KEY = "seamless_serve_staff_auth";

export type StaffUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

export type StaffSession = {
  token: string;
  user: StaffUser;
};

export function getStoredStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StaffSession;
  } catch {
    return null;
  }
}

export function setStoredStaffSession(session: StaffSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearStoredStaffSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export async function validateStaffSession(): Promise<StaffSession | null> {
  const session = getStoredStaffSession();
  if (!session?.token) return null;

  try {
    const res = await verifyTokenServerFn({ data: { token: session.token } });
    if (res.valid) {
      return session;
    }
    clearStoredStaffSession();
    return null;
  } catch {
    // If offline or network error, fallback to stored session if valid structure
    return session;
  }
}
