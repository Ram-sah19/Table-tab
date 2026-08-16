import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Minus, Plus, Trash2, Users, HeartHandshake, Receipt, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BottomNav } from "@/components/BottomNav";
import { createOrderServerFn } from "@/lib/api";
import { money, useCart, useGuest, useLastOrder } from "@/lib/store";
import { playOrderPlaced, playTap } from "@/lib/audio";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Order — Saffron & Ember" },
      { name: "description", content: "Review items, split the bill, and send your order to the kitchen." },
      { property: "og:title", content: "Your Order — Saffron & Ember" },
      { property: "og:description", content: "Review items and place order." },
    ],
  }),
  component: CartPage,
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(60),
  table_number: z.string().trim().min(1).max(10),
  special_instructions: z.string().trim().max(300),
});

const TIP_OPTIONS = [
  { label: "None", percent: 0 },
  { label: "5%", percent: 0.05 },
  { label: "10%", percent: 0.1 },
  { label: "15%", percent: 0.15 },
];

function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const { guest } = useGuest();
  const { setOrderId } = useLastOrder();
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedTipPercent, setSelectedTipPercent] = useState(0.05);
  const [splitGuests, setSplitGuests] = useState(1);

  // Tip and Split calculations
  const tipAmount = cart.subtotal * selectedTipPercent;
  const grandTotal = cart.total + tipAmount;
  const perPersonAmount = grandTotal / splitGuests;

  const placeOrder = async () => {
    if (!guest) {
      toast.error("Tell us your name and table first");
      navigate({ to: "/" });
      return;
    }
    const parsed = orderSchema.safeParse({
      customer_name: guest.name,
      table_number: guest.table,
      special_instructions: note,
    });
    if (!parsed.success) {
      toast.error("Please check your details");
      return;
    }
    setPlacing(true);
    const eta = Math.max(10, cart.items.length * 6);
    try {
      const data = await createOrderServerFn({
        data: {
          ...parsed.data,
          items: cart.items.map((i) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
            options: i.options,
            note: i.note,
          })),
          subtotal: Number(cart.subtotal.toFixed(2)),
          tax: Number((cart.tax + cart.service).toFixed(2)),
          total: Number(grandTotal.toFixed(2)),
          eta_minutes: eta,
        },
      });
      setPlacing(false);
      setConfirm(false);
      if (!data) {
        toast.error("Could not place the order. Please try again.");
        return;
      }
      playOrderPlaced();
      cart.clear();
      setOrderId(data.id);
      toast.success("Order received! The kitchen is preparing your dishes.");
      navigate({ to: "/order/$id", params: { id: data.id } });
    } catch (err: unknown) {
      setPlacing(false);
      setConfirm(false);
      const msg = err instanceof Error ? err.message : "Could not place order";
      toast.error(msg);
    }
  };

  return (
    <main className="min-h-dvh pb-44 lg:pb-24">
      {/* Top Header Container */}
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-2">
        <header className="flex items-center gap-3">
          <Link
            to="/menu"
            onClick={() => playTap()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-card hover:bg-muted transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="truncate font-display text-3xl font-bold">Your Order</h1>
          </div>
          {guest && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{guest.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-primary font-bold">Table {guest.table}</span>
            </div>
          )}
        </header>
      </div>

      {/* Mobile-only Table Badge */}
      <div className="mx-auto max-w-6xl px-5 sm:hidden mt-2">
        <div className="glass-panel flex items-center justify-between rounded-2xl p-3.5 text-sm border">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{guest?.name ?? "Guest"}</span>
          </div>
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
            Table {guest?.table ?? "—"}
          </span>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="mx-auto max-w-md px-5 mt-12 text-center">
          <div className="rounded-3xl border border-dashed p-12 bg-card/50 shadow-soft">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Receipt className="h-8 w-8" />
            </div>
            <p className="font-display text-2xl font-bold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Select from our chef's hand-crafted menu items.</p>
            <Link
              to="/menu"
              onClick={() => playTap()}
              className="gradient-ember mt-6 inline-block rounded-full px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-5 mt-4">
          {/* Responsive 2-Column Grid on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* Left Column: Cart Items + Notes + Tips + Splitter (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-muted-foreground uppercase tracking-wider text-xs">
                  Selected Items ({cart.count})
                </h2>
                <button
                  onClick={() => {
                    playTap();
                    cart.clear();
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Items List */}
              <ul className="space-y-3">
                {cart.items.map((item) => (
                  <motion.li
                    layout
                    key={item.id}
                    className="flex gap-4 rounded-3xl border bg-card p-4 shadow-soft transition-all hover:border-primary/30"
                  >
                    <img
                      src={item.image ?? "/images/hero.jpg"}
                      alt={item.name}
                      loading="lazy"
                      width={200}
                      height={200}
                      className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <p className="truncate font-bold text-base">{item.name}</p>
                          <button
                            onClick={() => {
                              playTap();
                              cart.remove(item.id);
                            }}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                          </button>
                        </div>
                        {item.options.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">{item.options.join(" · ")}</p>
                        )}
                        {item.note && <p className="truncate text-xs italic text-muted-foreground mt-0.5">“{item.note}”</p>}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full border px-3 py-1 bg-background">
                          <button
                            onClick={() => {
                              playTap();
                              cart.setQty(item.id, item.qty - 1);
                            }}
                            aria-label="Decrease"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                          <button
                            onClick={() => {
                              playTap();
                              cart.setQty(item.id, item.qty + 1);
                            }}
                            aria-label="Increase"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-display text-lg font-bold text-primary">{money(item.qty * item.price)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Kitchen Note */}
              <div className="rounded-3xl border bg-card p-4 space-y-2 shadow-soft">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Kitchen Notes & Requests
                </label>
                <textarea
                  value={note}
                  maxLength={300}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Special instructions for kitchen (allergies, cutlery, less spicy)..."
                  className="min-h-16 w-full rounded-2xl border bg-background p-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              {/* Staff Tip Selection */}
              <div className="rounded-3xl border bg-card p-4 space-y-2 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <HeartHandshake className="h-4 w-4 text-primary" /> Staff Appreciation Tip
                  </span>
                  <span className="text-xs font-bold text-primary">{money(tipAmount)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {TIP_OPTIONS.map((tip) => {
                    const isSelected = selectedTipPercent === tip.percent;
                    return (
                      <button
                        key={tip.label}
                        type="button"
                        onClick={() => {
                          playTap();
                          setSelectedTipPercent(tip.percent);
                        }}
                        className={`rounded-xl py-2.5 text-xs border font-bold transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-102"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
                        }`}
                      >
                        {tip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diners Splitter */}
              <div className="rounded-3xl border bg-card p-4 space-y-2 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" /> Split With Diners
                  </span>
                  <span className="text-xs font-bold text-primary">{splitGuests} {splitGuests === 1 ? "Guest" : "Guests"}</span>
                </div>
                <div className="pt-1">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={splitGuests}
                    onChange={(e) => {
                      playTap();
                      setSplitGuests(parseInt(e.target.value, 10));
                    }}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
                {splitGuests > 1 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t mt-2 text-muted-foreground">
                    <span>Each guest pays:</span>
                    <span className="font-bold text-foreground text-sm">{money(perPersonAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Receipt Summary & Desktop Checkout Button (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-8 mt-6 lg:mt-0 space-y-4">
              
              {/* Desktop-only Table Info Card */}
              {guest && (
                <div className="hidden lg:flex items-center justify-between rounded-3xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Diner Name</span>
                      <span className="text-sm font-bold">{guest.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned</span>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-xs font-bold inline-block mt-0.5">
                      Table {guest.table}
                    </span>
                  </div>
                </div>
              )}

              {/* Thermal Receipt Summary Card */}
              <div className="rounded-3xl border bg-card p-6 text-sm shadow-soft space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display text-lg font-bold">Billing Breakdown</span>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Table Bill
                  </span>
                </div>

                <Row label="Items Subtotal" value={money(cart.subtotal)} />
                <Row label="GST (5%)" value={money(cart.tax)} />
                <Row label="Service Charge (3%)" value={money(cart.service)} />
                {tipAmount > 0 && <Row label="Staff Appreciation Tip" value={money(tipAmount)} />}
                
                {/* Dotted Perforation Line */}
                <div className="border-t border-dashed my-3 pt-3 flex items-center justify-between">
                  <span className="font-bold text-base">Grand Total</span>
                  <span className="font-display text-2xl font-bold text-primary">{money(grandTotal)}</span>
                </div>

                {splitGuests > 1 && (
                  <div className="bg-primary/10 rounded-2xl p-2.5 text-center text-xs font-semibold text-primary">
                    Split between {splitGuests} diners · {money(perPersonAmount)} / person
                  </div>
                )}

                {/* Decorative Receipt Barcode */}
                <div className="pt-2 flex flex-col items-center opacity-40">
                  <div className="h-6 w-48 bg-repeat-x flex items-center justify-between gap-1 overflow-hidden">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <span
                        key={i}
                        className="bg-current inline-block h-full"
                        style={{ width: i % 3 === 0 ? "3px" : i % 2 === 0 ? "1px" : "2px" }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest mt-1">Table Tap Verified Ticket</span>
                </div>

                {/* Desktop Embedded CTA Button */}
                <div className="hidden lg:block pt-4">
                  <button
                    onClick={() => {
                      playTap();
                      setConfirm(true);
                    }}
                    className="gradient-ember w-full rounded-full py-4 text-base font-bold text-primary-foreground shadow-glow hover:scale-102 transition-transform"
                  >
                    Confirm & Send Order · {money(grandTotal)}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-only Sticky Place Order CTA (Hidden on Desktop) */}
          <div className="fixed inset-x-0 bottom-20 z-30 px-5 lg:hidden">
            <button
              onClick={() => {
                playTap();
                setConfirm(true);
              }}
              className="gradient-ember mx-auto block w-full max-w-md rounded-full py-4 text-base font-bold text-primary-foreground shadow-glow hover:scale-102 transition-transform"
            >
              Confirm & Send Order · {money(grandTotal)}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-bold">Send Order to Kitchen?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {cart.count} item{cart.count > 1 ? "s" : ""} for Table {guest?.table} totalling{" "}
              <strong className="text-foreground">{money(grandTotal)}</strong>. The kitchen will begin preparation immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => playTap()}
              className="rounded-full font-semibold"
            >
              Review
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void placeOrder();
              }}
              disabled={placing}
              className="gradient-ember rounded-full text-primary-foreground font-bold shadow-glow"
            >
              {placing ? "Transmitting…" : "Fire to Kitchen 🍳"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground text-xs sm:text-sm">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
