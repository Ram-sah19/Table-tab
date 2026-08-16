import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { resolveServiceRequestServerFn } from "@/lib/api";
import { realtimeClient } from "@/lib/realtime-client";
import { REQUEST_LABEL, serviceRequestsQuery, type ServiceRequest } from "@/lib/service";
import { cn } from "@/lib/utils";

export function RequestsBoard() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery(serviceRequestsQuery);

  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe("service_requests", (event, data) => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
      if (event === "INSERT" && data.status === "open") {
        toast.success(`Table ${data.table_number} · ${REQUEST_LABEL[data.type as keyof typeof REQUEST_LABEL] || data.type}`);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const resolve = async (req: ServiceRequest) => {
    try {
      await resolveServiceRequestServerFn({ data: { id: req.id } });
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    } catch {
      toast.error("Could not update request");
    }
  };

  const open = requests.filter((r) => r.status === "open");
  const done = requests.filter((r) => r.status === "resolved").slice(0, 12);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-3 font-display text-xl">Open requests · {open.length}</h2>
        {open.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center">
            <p className="font-display text-xl">All tables happy</p>
            <p className="mt-1 text-sm text-muted-foreground">Requests appear here instantly.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {open.map((req) => (
                <motion.article
                  layout
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-3xl border bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-xl">Table {req.table_number}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {req.customer_name || "Guest"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-accent-foreground">
                      {REQUEST_LABEL[req.type]}
                    </span>
                  </div>
                  {req.note && <p className="mt-2 rounded-2xl bg-muted p-2 text-xs italic">“{req.note}”</p>}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => void resolve(req)}
                      className="gradient-ember rounded-full px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      Mark done
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-xl">Recently handled</h2>
          <ul className="space-y-2">
            {done.map((req) => (
              <li
                key={req.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border bg-card px-4 py-3 text-sm",
                )}
              >
                <span>
                  Table {req.table_number} · {REQUEST_LABEL[req.type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(req.updated_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
