import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Droplets, Receipt, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { createServiceRequestServerFn } from "@/lib/api";
import { REQUEST_TYPES, type ServiceRequestType } from "@/lib/service";
import { useGuest } from "@/lib/store";
import { playWaiterBell, playTap } from "@/lib/audio";

const ICONS: Record<ServiceRequestType, typeof BellRing> = {
  waiter: BellRing,
  water: Droplets,
  bill: Receipt,
  cleaning: Sparkles,
};

export function CallWaiter() {
  const { guest } = useGuest();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ServiceRequestType | null>(null);
  const [note, setNote] = useState("");

  const send = async (type: ServiceRequestType) => {
    if (!guest?.table) {
      toast.error("Please enter your table details first");
      return;
    }
    playWaiterBell();
    setBusy(type);
    try {
      await createServiceRequestServerFn({
        data: {
          table_number: guest.table,
          customer_name: guest.name ?? "",
          type,
          note: note.trim(),
        },
      });
      toast.success("🛎️ Table service notified! A waiter is approaching.");
      setNote("");
      setOpen(false);
    } catch {
      toast.error("Could not reach the staff — please try again");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          playTap();
          setOpen(true);
        }}
        aria-label="Call a waiter"
        className="glass-panel fixed bottom-40 right-4 z-40 grid h-12 w-12 place-items-center rounded-full shadow-glow border border-primary/40 hover:scale-105 transition-transform"
      >
        <BellRing className="h-5 w-5 text-primary animate-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-sm p-0 sm:place-items-center sm:p-5"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border bg-card p-6 pb-8 sm:rounded-3xl shadow-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold">Table Assistance</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {guest?.table ? `Table ${guest.table} · ${guest.name || "Guest"}` : "No table detected yet"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    playTap();
                    setOpen(false);
                  }}
                  aria-label="Close"
                  className="rounded-full border p-2 bg-background hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {REQUEST_TYPES.map((r) => {
                  const Icon = ICONS[r.id];
                  return (
                    <button
                      key={r.id}
                      disabled={busy !== null}
                      onClick={() => void send(r.id)}
                      className="rounded-2xl border bg-background/70 p-4 text-left text-sm font-bold disabled:opacity-60 transition-all hover:border-primary hover:bg-primary/5 hover:scale-102"
                    >
                      <Icon className="mb-2 h-5 w-5 text-primary" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
                placeholder="Specific request (e.g. extra cutlery, warm water)..."
                className="mt-3 w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
