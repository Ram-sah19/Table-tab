import { useCallback, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  foodId: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  options: string[];
  note: string;
};

export type Guest = {
  name: string;
  table: string;
};

const GUEST_KEY = "qr_guest";
const CART_KEY = "qr_cart";
const ORDER_KEY = "qr_last_order";
const FAV_KEY = "qr_favorites";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("qr-store", { detail: key }));
}

function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    const sync = () => setValue(read<T>(key, fallback));
    window.addEventListener("qr-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qr-store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback((next: T) => write(key, next), [key]);
  return [value, set] as const;
}

export function useGuest() {
  const [guest, setGuest] = useLocal<Guest | null>(GUEST_KEY, null);
  return { guest, setGuest };
}

export function useLastOrder() {
  const [orderId, setOrderId] = useLocal<string | null>(ORDER_KEY, null);
  return { orderId, setOrderId };
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocal<string[]>(FAV_KEY, []);
  const toggle = (id: string) =>
    setFavorites(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]);
  return { favorites, toggle };
}

export const TAX_RATE = 0.05;
export const SERVICE_RATE = 0.03;

export function useCart() {
  const [items, setItems] = useLocal<CartItem[]>(CART_KEY, []);

  const add = (item: Omit<CartItem, "id">) => {
    const signature = `${item.foodId}|${item.options.join(",")}|${item.note}`;
    const existing = items.find(
      (i) => `${i.foodId}|${i.options.join(",")}|${i.note}` === signature,
    );
    if (existing) {
      setItems(items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i)));
    } else {
      setItems([...items, { ...item, id: crypto.randomUUID() }]);
    }
  };

  const setQty = (id: string, qty: number) =>
    setItems(qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty } : i)));

  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = subtotal * TAX_RATE;
  const service = subtotal * SERVICE_RATE;
  const total = subtotal + tax + service;

  return { items, add, setQty, remove, clear, count, subtotal, tax, service, total };
}

export function money(value: number) {
  return `₹${value.toFixed(2)}`;
}
