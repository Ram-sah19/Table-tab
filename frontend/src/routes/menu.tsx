import { useMemo, useState, useRef, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingBag, Sparkles, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { CallWaiter } from "@/components/CallWaiter";
import { BottomNav } from "@/components/BottomNav";
import { FoodCard, VegBadge } from "@/components/FoodCard";
import { FoodDialog } from "@/components/FoodDialog";
import { categoriesQuery, foodsQuery, type Food } from "@/lib/menu";
import { money, useCart, useFavorites, useGuest } from "@/lib/store";
import { cn } from "@/lib/utils";
import { playAddToCart, playTap } from "@/lib/audio";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Saffron & Ember" },
      {
        name: "description",
        content:
          "Browse the full Saffron & Ember menu: veg, non-veg, fast food, snacks, drinks and desserts.",
      },
      { property: "og:title", content: "Menu — Saffron & Ember" },
      { property: "og:description", content: "Browse the full menu and order from your table." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const navigate = useNavigate();
  const { guest } = useGuest();
  const cart = useCart();
  const { favorites, toggle } = useFavorites();
  const { data: categories = [], isLoading: catLoading } = useQuery(categoriesQuery);
  const { data: foods = [], isLoading } = useQuery(foodsQuery);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string>("all");
  const [selected, setSelected] = useState<Food | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter((f) => {
      const inCategory =
        active === "all" ||
        (active === "special" && f.is_special) ||
        f.category_id === active;
      const matches = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [foods, search, active]);

  const popular = foods.filter((f) => f.is_popular).slice(0, 6);

  const quickAdd = (food: Food) => {
    playAddToCart();
    cart.add({
      foodId: food.id,
      name: food.name,
      price: Number(food.price),
      image: food.image_url,
      qty: 1,
      options: [],
      note: "",
    });
    toast.success(`${food.name} added`);
  };

  return (
    <main className="min-h-dvh pb-36">
      {/* Hero Header */}
      <header className="relative h-48 md:h-60 overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Saffron & Ember dining room"
          width={1600}
          height={1000}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/65 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:py-6">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {guest ? `Hi ${guest.name}` : "Welcome"}
              </p>
              <h1 className="truncate font-display text-3xl md:text-4xl text-foreground">
                Saffron & Ember
              </h1>
            </div>
            <span className="shrink-0 rounded-full border border-border/80 bg-background/80 px-4 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md">
              Table {guest?.table ?? "—"}
            </span>
          </div>
        </div>
      </header>

      {/* Sticky Search & Category Filter Navigation */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-col-reverse gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between">
          {/* Category Filter Pills */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5">
            {[
              { id: "all", name: "All" },
              { id: "special", name: "Today's Special" },
              ...categories.map((c) => ({ id: c.id, name: c.name })),
            ].map((c) => (
              <motion.button
                key={c.id}
                onClick={() => {
                  playTap();
                  setActive(c.id);
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-150",
                  active === c.id
                    ? "gradient-ember border-transparent text-primary-foreground shadow-sm"
                    : "bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                {c.name}
              </motion.button>
            ))}
          </div>

          {/* Search Input Bar */}
          <div className="relative flex w-full items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-4 py-2.5 shadow-inner transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 md:w-80">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={60}
              placeholder="Search dishes or ingredients…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  playTap();
                  setSearch("");
                }}
                aria-label="Clear search"
                className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popular Section */}
      {popular.length > 0 && active === "all" && !search && (
        <section className="mx-auto max-w-6xl px-5 pt-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl md:text-2xl">
            <Sparkles className="h-5 w-5 text-primary" /> Popular right now
          </h2>
          <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
            {popular.map((f) => (
              <PopularCard
                key={f.id}
                food={f}
                onSelect={() => {
                  playTap();
                  setSelected(f);
                }}
                onQuickAdd={() => quickAdd(f)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Menu Dishes Grid */}
      <section className="mx-auto max-w-6xl px-5 pt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl md:text-2xl">
            {active === "special"
              ? "Today's Specials"
              : search
              ? `Search results for "${search}"`
              : active === "all"
              ? "All Dishes"
              : categories.find((c) => c.id === active)?.name ?? "The Menu"}
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {filtered.length} dish{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        {isLoading || catLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-muted/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
            <p className="font-display text-2xl">No dishes found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching for something else or pick another category.
            </p>
            {(search || active !== "all") && (
              <button
                onClick={() => {
                  playTap();
                  setSearch("");
                  setActive("all");
                }}
                className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold text-primary hover:bg-card"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  favorite={favorites.includes(food.id)}
                  onToggleFavorite={() => toggle(food.id)}
                  onOpen={() => setSelected(food)}
                  onAdd={() => quickAdd(food)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Floating View Cart Trigger */}
      <AnimatePresence>
        {cart.count > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            onClick={() => {
              playTap();
              navigate({ to: "/cart" });
            }}
            className="gradient-ember fixed bottom-24 left-1/2 z-40 flex w-[min(92vw,26rem)] -translate-x-1/2 items-center justify-between rounded-full px-5 py-3.5 text-primary-foreground shadow-glow"
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <ShoppingBag className="h-4 w-4" /> {cart.count} item{cart.count > 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold">View cart · {money(cart.subtotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <FoodDialog food={selected} onClose={() => setSelected(null)} />
      <CallWaiter />
      <BottomNav />

      <footer className="mx-auto max-w-6xl px-5 pt-12 text-center">
        <p className="text-xs text-muted-foreground">
          Restaurant staff? <Link to="/auth" onClick={() => playTap()} className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </footer>
    </main>
  );
}

// Popular card with 3D tilt and instant audio feedback
function PopularCard({
  food,
  onSelect,
  onQuickAdd,
}: {
  food: any;
  onSelect: () => void;
  onQuickAdd: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isCoarse = typeof window !== "undefined"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
  const enable3d = !shouldReduceMotion && !isCoarse;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3d || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    cardRef.current.style.transform =
      `perspective(600px) rotateX(${cy * -4}deg) rotateY(${cx * 5}deg) translateZ(6px) translateY(-3px)`;
  }, [enable3d]);

  const handleMouseLeave = useCallback(() => {
    if (!enable3d || !cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)";
  }, [enable3d]);

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="group relative w-44 md:w-48 shrink-0 overflow-hidden rounded-3xl border border-border/70 bg-card text-left shadow-soft cursor-pointer select-none transition-all hover:border-primary/40"
      style={{
        transition: enable3d ? "transform 0.14s cubic-bezier(0.23,1,0.32,1), box-shadow 0.14s ease" : undefined,
        willChange: enable3d ? "transform" : undefined,
      }}
    >
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={food.image_url ?? "/images/hero.jpg"}
          alt={food.name}
          loading="lazy"
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.07]"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "linear-gradient(to top, oklch(0.68 0.16 55 / 0.22), transparent 55%)",
          }}
        />
        {/* Veg Badge on Popular Card */}
        <div className="absolute top-2.5 left-2.5">
          <VegBadge isVeg={food.is_veg} />
        </div>
      </div>
      
      <div className="p-3">
        <p className="truncate text-sm font-bold text-foreground">{food.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-primary">{money(Number(food.price))}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            aria-label={`Add ${food.name}`}
            className="grid h-7 w-7 place-items-center rounded-full gradient-ember text-primary-foreground shadow-sm hover:scale-110 active:scale-95 transition-transform"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
