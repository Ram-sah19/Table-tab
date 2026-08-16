import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { updateOrderStatusServerFn } from "@/lib/api";
import { realtimeClient } from "@/lib/realtime-client";
import { ordersQuery, parseLines, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/menu";
import { money } from "@/lib/store";
import { cn } from "@/lib/utils";
import { playKitchenAlert, playTap } from "@/lib/audio";

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "received", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "served", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  received: { to: "confirmed", label: "Confirm" },
  confirmed: { to: "preparing", label: "Start preparing" },
  preparing: { to: "ready", label: "Mark ready" },
  ready: { to: "served", label: "Mark served" },
};

export function OrdersBoard() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery(ordersQuery);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe("orders", (event, data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (event === "INSERT") {
        playKitchenAlert();
        toast.success(`🛎️ New Order #${data.order_number} · Table ${data.table_number}!`);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const update = async (order: Order, status: OrderStatus) => {
    playTap();
    try {
      await updateOrderStatusServerFn({ data: { id: order.id, status } });
      toast.success(`#${order.order_number} → ${STATUS_LABEL[status]}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch {
      toast.error("Could not update order");
    }
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <section className="space-y-4">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? orders.length : orders.filter((o) => o.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => {
                playTap();
                setFilter(f.id);
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                filter === f.id
                  ? "gradient-ember border-transparent text-primary-foreground shadow-glow"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center bg-card/50">
          <p className="font-display text-2xl font-bold">No orders found</p>
          <p className="mt-1 text-sm text-muted-foreground">New customer orders will appear with instant live audio alerts.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((order) => {
              const next = NEXT[order.status];
              return (
                <motion.article
                  layout
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-3xl border bg-card p-5 shadow-soft space-y-3"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-bold text-primary">#{order.order_number}</p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.customer_name} · Table {order.table_number}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
                        order.status === "cancelled"
                          ? "bg-destructive/20 text-destructive border border-destructive/30"
                          : order.status === "served"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-primary/15 text-primary border border-primary/30",
                      )}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs sm:text-sm border-y py-2.5">
                    {parseLines(order.items).map((line, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="min-w-0">
                          <span className="font-bold">
                            {line.qty}× {line.name}
                          </span>
                          {line.options?.length ? (
                            <span className="block text-[11px] text-muted-foreground">
                              {line.options.join(" · ")}
                            </span>
                          ) : null}
                          {line.note ? (
                            <span className="block text-[11px] italic text-muted-foreground">
                              “{line.note}”
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 font-medium">{money(line.qty * line.price)}</span>
                      </li>
                    ))}
                  </ul>

                  {order.special_instructions && (
                    <p className="rounded-2xl bg-muted/60 border p-2.5 text-xs italic text-muted-foreground">
                      “{order.special_instructions}”
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-muted-foreground font-medium">
                      Ordered at{" "}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-display text-xl font-bold text-foreground">
                      {money(Number(order.total))}
                    </span>
                  </div>

                  {order.status !== "served" && order.status !== "cancelled" && (
                    <div className="flex gap-2 pt-2">
                      {next && (
                        <button
                          onClick={() => void update(order, next.to)}
                          className="gradient-ember flex-1 rounded-full py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:scale-102 transition-transform"
                        >
                          {next.label} →
                        </button>
                      )}
                      <button
                        onClick={() => void update(order, "cancelled")}
                        className="rounded-full border px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
