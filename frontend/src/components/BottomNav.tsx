import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ReceiptText, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useCart, useLastOrder } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home",  label: "Home",  icon: Home,            to: "/" },
  { id: "menu",  label: "Menu",  icon: UtensilsCrossed, to: "/menu" },
  { id: "cart",  label: "Cart",  icon: ShoppingBag,     to: "/cart" },
  { id: "order", label: "Order", icon: ReceiptText,     to: "/order" },
] as const;

export function BottomNav() {
  const { count } = useCart();
  const { orderId } = useLastOrder();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function getActiveId() {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/menu")) return "menu";
    if (pathname.startsWith("/cart")) return "cart";
    if (pathname.startsWith("/order")) return "order";
    return "";
  }

  const activeId = getActiveId();

  const handleOrderClick = (e: React.MouseEvent) => {
    if (!orderId) {
      e.preventDefault();
      toast.info("No active order yet — explore the menu and place an order!");
      navigate({ to: "/menu" });
    }
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div
        className="pointer-events-auto mx-auto mb-3 flex max-w-md items-center justify-around gap-1 rounded-3xl border border-border/50 bg-background/88 p-1.5 backdrop-blur-xl"
        style={{ boxShadow: "0 8px 32px -8px oklch(0 0 0 / 0.35), 0 2px 8px -2px oklch(0 0 0 / 0.12)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          const inner = (
            <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-2xl">
              {/* Active pill background */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.68 0.16 55 / 0.18), oklch(0.8 0.15 78 / 0.12))",
                      border: "1px solid oklch(0.78 0.15 68 / 0.25)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  <Icon
                    className={cn(
                      "relative h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </motion.div>
                {/* Cart badge */}
                {item.id === "cart" && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                  >
                    {count}
                  </motion.span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "relative truncate text-[11px] font-semibold transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.id === "order") {
            return orderId ? (
              <Link
                key={item.id}
                to="/order/$id"
                params={{ id: orderId }}
                className="relative flex min-w-0 flex-1 text-center"
                aria-label={item.label}
              >
                {inner}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={handleOrderClick}
                className="relative flex min-w-0 flex-1 text-center"
                aria-label={item.label}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.to}
              className="relative flex min-w-0 flex-1 text-center"
              aria-label={item.label}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
