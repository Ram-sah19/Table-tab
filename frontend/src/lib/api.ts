// --- Types ---
export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";
export type ServiceRequestType = "waiter" | "water" | "bill" | "cleaning";
export type ServiceRequestStatus = "open" | "resolved";

export type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  sort_order: number;
  created_at: string;
};

export type Food = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number;
  image_url?: string;
  prep_time: number;
  is_available: boolean;
  is_veg: boolean;
  spice_level: number;
  rating: number;
  calories: number;
  ingredients: string;
  is_special: boolean;
  is_popular: boolean;
  created_at: string;
};

export type OrderLine = {
  name: string;
  qty: number;
  price: number;
  options: string[];
  note: string;
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  table_number: string;
  items: OrderLine[];
  subtotal: number;
  tax: number;
  total: number;
  special_instructions: string;
  status: OrderStatus;
  eta_minutes: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRequest = {
  id: string;
  table_number: string;
  customer_name: string;
  type: ServiceRequestType;
  note: string;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
};

import { getStoredStaffSession } from "./auth";

// --- HTTP Client Helper ---

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === "undefined";
  // On SSR, call relative or localhost port
  const base = isServer ? "http://localhost:3000" : "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isServer) {
    const session = getStoredStaffSession();
    if (session?.token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${session.token}`;
    }
  }

  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// --- Auth APIs ---

export async function loginServerFn({ data }: { data: { email: string; password: string } }) {
  return request<{ token: string; user: { id: string; email: string; full_name: string; role: string } }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function registerServerFn({
  data,
}: {
  data: { email: string; password: string; full_name?: string };
}) {
  return request<{ token: string; user: { id: string; email: string; full_name: string; role: string } }>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function verifyTokenServerFn({ data }: { data: { token: string } }) {
  return request<{ valid: boolean; user: any }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify(data),
  }).catch(() => ({ valid: false, user: null }));
}

// --- Category APIs ---

export async function getCategoriesServerFn(): Promise<Category[]> {
  return request<Category[]>("/api/categories", { method: "GET" });
}

export async function createCategoryServerFn({ data }: { data: { name: string; emoji?: string } }) {
  return request<Category>("/api/categories", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteCategoryServerFn({ data }: { data: { id: string } }) {
  return request<{ success: boolean }>(`/api/categories/${data.id}`, { method: "DELETE" });
}

// --- Food APIs ---

export async function getFoodsServerFn(): Promise<Food[]> {
  return request<Food[]>("/api/foods", { method: "GET" });
}

export async function saveFoodServerFn({ data }: { data: Partial<Food> & { name?: string; price?: number } }) {
  return request<Food>("/api/foods", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteFoodServerFn({ data }: { data: { id: string } }) {
  return request<{ success: boolean }>(`/api/foods/${data.id}`, { method: "DELETE" });
}

export async function updateFoodAvailabilityServerFn({
  data,
}: {
  data: { id: string; is_available: boolean };
}) {
  return request<Food>("/api/foods", {
    method: "POST",
    body: JSON.stringify({ id: data.id, is_available: data.is_available }),
  });
}

// --- Order APIs ---

export async function getOrdersServerFn(): Promise<Order[]> {
  return request<Order[]>("/api/orders", { method: "GET" });
}

export async function getOrderByIdServerFn({ data }: { data: { id: string } }): Promise<Order | null> {
  return request<Order>(`/api/orders/${data.id}`, { method: "GET" }).catch(() => null);
}

export async function createOrderServerFn({ data }: { data: any }): Promise<Order> {
  return request<Order>("/api/orders", { method: "POST", body: JSON.stringify(data) });
}

export async function updateOrderStatusServerFn({
  data,
}: {
  data: { id: string; status: OrderStatus };
}): Promise<Order> {
  return request<Order>(`/api/orders/${data.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: data.status }),
  });
}

// --- Service Request APIs ---

export async function getServiceRequestsServerFn(): Promise<ServiceRequest[]> {
  return request<ServiceRequest[]>("/api/service-requests", { method: "GET" });
}

export async function createServiceRequestServerFn({ data }: { data: any }): Promise<ServiceRequest> {
  return request<ServiceRequest>("/api/service-requests", { method: "POST", body: JSON.stringify(data) });
}

export async function resolveServiceRequestServerFn({
  data,
}: {
  data: { id: string };
}): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/api/service-requests/${data.id}/resolve`, {
    method: "PATCH",
  });
}
