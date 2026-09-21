import { useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Check,
  Clock,
  Loader2,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { CallWaiter } from "@/components/CallWaiter";
import { BottomNav } from "@/components/BottomNav";
import { realtimeClient } from "@/lib/realtime-client";
import { orderQuery, parseLines, STATUS_FLOW, STATUS_LABEL } from "@/lib/menu";
import { money } from "@/lib/store";
import { cn } from "@/lib/utils";
import { playWaiterBell, playTap } from "@/lib/audio";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Status — Saffron & Ember" },
      { name: "description", content: "Follow your order live from the kitchen to your table." },
      { property: "og:title", content: "Order Status — Saffron & Ember" },
      { property: "og:description", content: "Live order tracking at Saffron & Ember." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery(orderQuery(id));
  const previousStatus = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe(`order:${id}`, (_event, data) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      if (data?.status && STATUS_LABEL[data.status as keyof typeof STATUS_LABEL]) {
        playWaiterBell();
        toast.success(`Order update: ${STATUS_LABEL[data.status as keyof typeof STATUS_LABEL]}`);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  useEffect(() => {
    if (order && previousStatus.current && previousStatus.current !== order.status) {
      playWaiterBell();
      toast.success(`Status: ${STATUS_LABEL[order.status]}`);
    }
    if (order) {
      previousStatus.current = order.status;
    }
  }, [order]);

  if (isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Connecting to live kitchen feed...
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold">Order Not Found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This order might have expired or been moved.
          </p>
          <Link
            to="/menu"
            onClick={() => playTap()}
            className="gradient-ember mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const lines = parseLines(order.items);

  // Calculate timeline progress percentage
  const progressPercent =
    order.status === "served"
      ? 100
      : Math.max(15, Math.min(95, ((currentIndex + 1) / STATUS_FLOW.length) * 100));

  return (
    <main className="min-h-dvh px-5 pb-36 pt-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-primary/10 text-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Order #{order.order_number}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
            Table <strong className="text-foreground">{order.table_number}</strong> ·{" "}
            {order.customer_name}
          </span>
        </div>

        {/* Responsive Grid on Desktop */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Circular Progress & Timeline Stepper (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Live Status Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-card border p-6 shadow-soft text-center">
              <div className="relative z-10 flex flex-col items-center">
                {/* Circular Progress Ring */}
                <div className="relative h-28 w-28 grid place-items-center mb-3">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-muted fill-none stroke-[7]" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-primary fill-none stroke-[7] transition-all duration-1000 ease-out"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * progressPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    {order.status === "served" ? (
                      <Check className="h-8 w-8 text-primary" />
                    ) : order.status === "preparing" ? (
                      <ChefHat className="h-8 w-8 text-primary animate-bounce" />
                    ) : (
                      <Clock className="h-8 w-8 text-primary animate-pulse" />
                    )}
                  </div>
                </div>

                <h1 className="font-display text-3xl font-bold">
                  {cancelled ? "Order Cancelled" : STATUS_LABEL[order.status]}
                </h1>

                {!cancelled && order.status !== "served" && (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Estimated wait:{" "}
                    <strong className="text-foreground">{order.eta_minutes} mins</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Timeline Stepper */}
            {!cancelled && (
              <div className="rounded-3xl border bg-card p-5 shadow-soft">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Preparation Timeline
                </h2>
                <ol className="space-y-1">
                  {STATUS_FLOW.map((status, index) => {
                    const done = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <li key={status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <motion.span
                            animate={{ scale: isCurrent ? [1, 1.15, 1] : 1 }}
                            transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.6 }}
                            className={cn(
                              "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                              done
                                ? "gradient-ember border-transparent text-primary-foreground shadow-sm"
                                : "border-border text-muted-foreground bg-background",
                            )}
                          >
                            {done ? <Check className="h-4 w-4" /> : index + 1}
                          </motion.span>
                          {index < STATUS_FLOW.length - 1 && (
                            <span
                              className={cn(
                                "h-8 w-0.5 transition-colors duration-500",
                                done ? "bg-primary" : "bg-border",
                              )}
                            />
                          )}
                        </div>
                        <div className="pt-1">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isCurrent
                                ? "text-primary font-bold"
                                : !done && "text-muted-foreground",
                            )}
                          >
                            {STATUS_LABEL[status]}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* Right Column: Ordered Items Receipt & Navigation (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 mt-5 lg:mt-0">
            {/* Order Summary Receipt */}
            <section className="rounded-3xl border bg-card p-6 shadow-soft space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-display text-xl font-bold">Ordered Dishes</h2>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </div>
              <ul className="space-y-2.5 text-sm">
                {lines.map((line, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="font-bold">
                        {line.qty}× {line.name}
                      </span>
                      {line.options?.length ? (
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {line.options.join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-semibold">{money(line.qty * line.price)}</span>
                  </li>
                ))}
              </ul>
              {order.special_instructions && (
                <p className="rounded-2xl bg-muted/60 border p-3 text-xs italic text-muted-foreground">
                  “{order.special_instructions}”
                </p>
              )}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold">Total Amount</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {money(Number(order.total))}
                </span>
              </div>
            </section>

            {/* Add More Items CTA */}
            <Link
              to="/menu"
              onClick={() => playTap()}
              className="gradient-ember flex items-center justify-center gap-2 rounded-full py-4 text-center text-sm font-bold text-primary-foreground shadow-glow hover:scale-102 transition-transform"
            >
              Order More Items for Table {order.table_number} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <CallWaiter />
      <BottomNav />
    </main>
  );
}
