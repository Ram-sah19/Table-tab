import { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Clock, Flame, Heart, Plus, Star, Sparkles } from "lucide-react";
import type { Food } from "@/lib/menu";
import { money } from "@/lib/store";
import { cn } from "@/lib/utils";
import { playAddToCart, playTap } from "@/lib/audio";

export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border",
        isVeg ? "border-veg" : "border-nonveg",
      )}
      aria-label={isVeg ? "Vegetarian" : "Non vegetarian"}
    >
      <span className={cn("h-2 w-2 rounded-full", isVeg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}

export function FoodCard({
  food,
  onOpen,
  onAdd,
  favorite,
  onToggleFavorite,
}: {
  food: Food;
  onOpen: () => void;
  onAdd: () => void;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [heartRipple, setHeartRipple] = useState(false);
  const [cartPop, setCartPop] = useState<{ x: number; y: number } | null>(null);

  const isCoarse = typeof window !== "undefined"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
  const enable3d = !shouldReduceMotion && !isCoarse;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!enable3d || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    const rx = cy * -6;
    const ry = cx * 8;

    cardRef.current.style.transform =
      `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    cardRef.current.style.boxShadow =
      `${ry * 0.5}px ${rx * -0.5 + 12}px 40px -8px oklch(0 0 0 / 0.4), 0 4px 16px -4px var(--shadow-soft)`;

    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${pctX}%`);
    cardRef.current.style.setProperty("--my", `${pctY}%`);
    cardRef.current.style.setProperty("--sheen-opacity", "1");
  }, [enable3d]);

  const handleMouseLeave = useCallback(() => {
    if (!enable3d || !cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    cardRef.current.style.boxShadow = "";
    cardRef.current.style.setProperty("--sheen-opacity", "0");
  }, [enable3d]);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playTap();
    onToggleFavorite();
    setHeartRipple(true);
    setTimeout(() => setHeartRipple(false), 600);
  }, [onToggleFavorite]);

  const handleAdd = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!food.is_available) return;
    playAddToCart();
    const rect = e.currentTarget.getBoundingClientRect();
    setCartPop({ x: rect.left + rect.width / 2, y: rect.top });
    setTimeout(() => setCartPop(null), 700);
    onAdd();
  }, [food.is_available, onAdd]);

  return (
    <motion.article
      ref={cardRef as React.RefObject<HTMLElement>}
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "group overflow-hidden rounded-3xl border bg-card shadow-soft card-sheen transition-all hover:border-primary/40",
        enable3d && "card-3d"
      )}
      style={{
        transition: enable3d
          ? "transform 0.14s cubic-bezier(0.23,1,0.32,1), box-shadow 0.14s ease, border-color 0.2s ease"
          : undefined,
        willChange: enable3d ? "transform" : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => {
          playTap();
          onOpen();
        }}
        className="block w-full text-left"
      >
        <div className="relative aspect-4/3 overflow-hidden">
          <img
            src={food.image_url ?? "/images/hero.jpg"}
            alt={food.name}
            loading="lazy"
            width={800}
            height={600}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]",
              !food.is_available && "grayscale",
            )}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, oklch(0.68 0.16 55 / 0.2), transparent 60%)",
            }}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-wrap gap-1.5">
              {food.is_special && (
                <span className="gradient-ember flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" /> Special
                </span>
              )}
              {!food.is_available && (
                <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase text-destructive-foreground shadow-sm">
                  Sold Out
                </span>
              )}
            </div>

            {/* Favorite button */}
            <div className="relative">
              <motion.span
                role="button"
                tabIndex={0}
                onClick={handleFavorite}
                onKeyDown={(e) => e.key === "Enter" && handleFavorite(e as unknown as React.MouseEvent)}
                whileTap={{ scale: 0.8 }}
                animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className="glass-panel grid h-8 w-8 shrink-0 place-items-center rounded-full cursor-pointer shadow-sm hover:scale-105 transition-transform"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    favorite ? "fill-rose-500 text-rose-500" : "text-foreground"
                  )}
                />
              </motion.span>
              <AnimatePresence>
                {heartRipple && (
                  <motion.span
                    key="ripple"
                    initial={{ opacity: 0.6, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-rose-500"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </button>

      <div className="space-y-2 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <VegBadge isVeg={food.is_veg} />
          <h3 className="truncate text-base font-bold">{food.name}</h3>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{food.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {Number(food.rating).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {food.prep_time} min
          </span>
          {food.spice_level > 0 && (
            <span className="inline-flex items-center gap-0.5">
              {Array.from({ length: food.spice_level }).map((_, i) => (
                <Flame key={i} className="h-3 w-3 text-orange-500" />
              ))}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="font-display text-xl font-bold">{money(Number(food.price))}</span>
          <div className="relative">
            <motion.button
              disabled={!food.is_available}
              onClick={handleAdd}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="gradient-ember inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none"
            >
              <Plus className="h-4 w-4" /> Add
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating +1 cart confirmation */}
      <AnimatePresence>
        {cartPop && (
          <motion.span
            key="cartpop"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -30, scale: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="pointer-events-none fixed z-50 text-xs font-bold text-primary bg-background/90 px-2 py-0.5 rounded-full border shadow-sm"
            style={{ left: cartPop.x - 8, top: cartPop.y - 4 }}
          >
            +1 ✨
          </motion.span>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
