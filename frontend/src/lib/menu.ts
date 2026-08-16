import { queryOptions } from "@tanstack/react-query";
import {
  getCategoriesServerFn,
  getFoodsServerFn,
  getOrdersServerFn,
  getOrderByIdServerFn,
} from "./api";

export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "served" | "cancelled";

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

export const STATUS_FLOW: OrderStatus[] = ["received", "confirmed", "preparing", "ready", "served"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Order received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready to serve",
  served: "Served",
  cancelled: "Cancelled",
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    return (await getCategoriesServerFn()) as unknown as Category[];
  },
});

export const foodsQuery = queryOptions({
  queryKey: ["foods"],
  queryFn: async () => {
    return (await getFoodsServerFn()) as unknown as Food[];
  },
});

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: async () => {
    return (await getOrdersServerFn()) as unknown as Order[];
  },
  refetchInterval: 3000,
});

export function orderQuery(id: string) {
  return queryOptions({
    queryKey: ["order", id],
    queryFn: async () => {
      const data = await getOrderByIdServerFn({ data: { id } });
      return data as unknown as Order | null;
    },
    refetchInterval: 3000,
  });
}

export function parseLines(items: Order["items"]): OrderLine[] {
  if (!Array.isArray(items)) return [];
  return items as unknown as OrderLine[];
}
