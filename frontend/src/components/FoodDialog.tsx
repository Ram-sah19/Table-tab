import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Flame, Minus, Plus, Star, X, Sparkles, Wine, Users } from "lucide-react";
import { VegBadge } from "@/components/FoodCard";
import type { Food } from "@/lib/menu";
import { money, useCart } from "@/lib/store";
import { playAddToCart, playTap } from "@/lib/audio";
import { toast } from "sonner";

const CUSTOMIZATIONS = ["Extra cheese", "Extra sauce", "Crispy crust", "No onion / garlic", "Less oil"];

const SPICE_LEVELS = [
  { level: 0, label: "Mild", icon: "🌱", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { level: 1, label: "Medium", icon: "🌶️", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  { level: 2, label: "Hot", icon: "🌶️🌶️", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  { level: 3, label: "Fire", icon: "🔥", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
];

const PAIRING_SUGGESTIONS: Record<string, { name: string; price: number; desc: string; image: string }> = {
  veg: { name: "Mango Lassi", price: 160, desc: "Creamy alphonso mango yoghurt smoothie", image: "/images/food/mango_lassi.jpg" },
  "non-veg": { name: "Saffron Cold Brew", price: 180, desc: "Slow-steeped coffee with cardamom cream", image: "/images/food/coldbrew.jpg" },
  "fast-food": { name: "Fresh Lime Soda", price: 120, desc: "Sparkling citrus soda with crushed mint", image: "/images/food/fresh_lime_soda.jpg" },
  snacks: { name: "Fresh Lime Soda", price: 120, desc: "Crisp sparkling lime soda", image: "/images/food/fresh_lime_soda.jpg" },
  drinks: { name: "Masala Fries", price: 150, desc: "House masala spiced crisp potato fries", image: "/images/food/fries.jpg" },
  dessert: { name: "Saffron Cold Brew", price: 180, desc: "Cardamom cold brew infusion", image: "/images/food/coldbrew.jpg" },
};

export function FoodDialog({ food, onClose }: { food: Food | null; onClose: () => void }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedSpice, setSelectedSpice] = useState<number>(1);
  const [includePairing, setIncludePairing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (food) {
      setQty(1);
      setOptions([]);
      setSelectedSpice(Number(food.spice_level ?? 1));
      setIncludePairing(false);
      setNote("");
    }
  }, [food]);

  if (!food) return null;

  const pairing = PAIRING_SUGGESTIONS[food.category_id || "veg"] || PAIRING_SUGGESTIONS.veg;

  const toggle = (opt: string) => {
    playTap();
    setOptions((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const handleAdd = () => {
    playAddToCart();
    const finalOptions = [...options];
    if (selectedSpice !== Number(food.spice_level)) {
      const spiceObj = SPICE_LEVELS.find((s) => s.level === selectedSpice);
      if (spiceObj) finalOptions.push(`Spice: ${spiceObj.label}`);
    }

    cart.add({
      foodId: food.id,
      name: food.name,
      price: Number(food.price),
      image: food.image_url ?? null,
      qty,
      options: finalOptions,
      note: note.trim(),
    });

    if (includePairing) {
      cart.add({
        foodId: `pairing-${pairing.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: pairing.name,
        price: pairing.price,
        image: pairing.image,
        qty: 1,
        options: ["Chef's Pairing Special"],
        note: `Paired with ${food.name}`,
      });
      toast.success(`Added ${food.name} & ${pairing.name} to cart!`);
    } else {
      toast.success(`${food.name} added to cart`);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {food && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog panel */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-h-[92dvh] max-w-lg overflow-y-auto rounded-3xl bg-card border shadow-glow sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full no-scrollbar"
          >
            {/* Close button */}
            <button
              onClick={() => {
                playTap();
                onClose();
              }}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-background transition-all"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero image with floating feel */}
            <div className="relative h-60 overflow-hidden rounded-t-3xl">
              <motion.img
                key={food.id}
                src={food.image_url ?? "/images/hero.jpg"}
                alt={food.name}
                loading="lazy"
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, var(--card) 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 50% 100%, oklch(0.68 0.16 55 / 0.2), transparent)",
                }}
              />
              {food.is_special && (
                <span className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" /> Chef's Signature
                </span>
              )}
            </div>

            <div className="space-y-5 p-5">
              {/* Header */}
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2 font-display text-2xl font-bold">
                    <VegBadge isVeg={food.is_veg} />
                    <span className="truncate">{food.name}</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">{food.description}</p>
                </div>
                <span className="shrink-0 font-display text-2xl font-bold text-primary">
                  {money(Number(food.price))}
                </span>
              </div>

              {/* Key Stats Bar (Replaced kcal with Portion Guide) */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-muted/60 border p-2.5 transition-colors">
                  <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <span className="font-semibold">{food.prep_time} mins</span>
                </div>
                <div className="rounded-2xl bg-muted/60 border p-2.5 transition-colors">
                  <Star className="mx-auto mb-1 h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{Number(food.rating).toFixed(1)} Rating</span>
                </div>
                <div className="rounded-2xl bg-muted/60 border p-2.5 transition-colors">
                  <Users className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <span className="font-semibold">Serves 1–2</span>
                </div>
              </div>

              {/* Interactive Spice Level Selector */}
              <div className="rounded-2xl bg-muted/40 border p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-orange-500" /> Spice Calibration
                  </span>
                  <span className="text-primary font-bold">
                    {SPICE_LEVELS.find((s) => s.level === selectedSpice)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {SPICE_LEVELS.map((spice) => {
                    const isSelected = selectedSpice === spice.level;
                    return (
                      <button
                        key={spice.level}
                        type="button"
                        onClick={() => {
                          playTap();
                          setSelectedSpice(spice.level);
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs border transition-all ${
                          isSelected
                            ? `${spice.bg} border-current ${spice.color} font-bold ring-2 ring-primary/40 scale-102`
                            : "border-transparent bg-background/60 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="text-base">{spice.icon}</span>
                        <span className="mt-0.5 text-[11px]">{spice.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sommelier Drink Pairing Suggestion */}
              {pairing && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-primary/20 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary">
                        <Wine className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">
                          Sommelier Pairing
                        </span>
                        <span className="text-sm font-semibold">{pairing.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold">{money(pairing.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 ml-10">{pairing.desc}</p>
                  <div className="mt-2.5 ml-10">
                    <button
                      type="button"
                      onClick={() => {
                        playTap();
                        setIncludePairing(!includePairing);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                        includePairing
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-primary/40 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {includePairing ? "✓ Pairing Included" : `+ Add Pairing (${money(pairing.price)})`}
                    </button>
                  </div>
                </div>
              )}

              {/* Customizations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Customise</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CUSTOMIZATIONS.map((opt) => (
                    <motion.button
                      key={opt}
                      onClick={() => toggle(opt)}
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ scale: 1.02 }}
                      className={
                        options.includes(opt)
                          ? "rounded-full border border-primary bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"
                          : "rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 transition-colors"
                      }
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Special Instructions Note */}
              <textarea
                value={note}
                maxLength={200}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Special preparation instructions (e.g. less salt, well done)..."
                className="min-h-16 w-full rounded-2xl border bg-background/80 p-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />

              {/* Sticky Action Row */}
              <div className="sticky bottom-0 bg-card pt-2 pb-1 flex items-center gap-3 border-t">
                <div className="flex items-center gap-3 rounded-full border px-3.5 py-2.5 bg-background">
                  <motion.button
                    onClick={() => {
                      playTap();
                      setQty(Math.max(1, qty - 1));
                    }}
                    whileTap={{ scale: 0.85 }}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <motion.span
                    key={qty}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-6 text-center font-bold"
                  >
                    {qty}
                  </motion.span>
                  <motion.button
                    onClick={() => {
                      playTap();
                      setQty(Math.min(20, qty + 1));
                    }}
                    whileTap={{ scale: 0.85 }}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                <motion.button
                  disabled={!food.is_available}
                  onClick={handleAdd}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="gradient-ember flex-1 rounded-full py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
                >
                  Add {qty} · {money(qty * Number(food.price) + (includePairing ? pairing.price : 0))}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
