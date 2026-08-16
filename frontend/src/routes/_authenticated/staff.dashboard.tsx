import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, BellRing, ClipboardList, LogOut, Moon, QrCode, Sun, UtensilsCrossed } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Analytics } from "@/components/staff/Analytics";
import { MenuManager } from "@/components/staff/MenuManager";
import { OrdersBoard } from "@/components/staff/OrdersBoard";
import { QrStudio } from "@/components/staff/QrStudio";
import { RequestsBoard } from "@/components/staff/RequestsBoard";
import { clearStoredStaffSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/staff/dashboard")({
  head: () => ({
    meta: [
      { title: "Staff dashboard — Saffron & Ember" },
      { name: "description", content: "Live orders, menu management and analytics for staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const TABS = [
  { id: "orders", label: "Live orders", icon: ClipboardList },
  { id: "requests", label: "Requests", icon: BellRing },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "qr", label: "QR codes", icon: QrCode },
] as const;

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearStoredStaffSession();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-dvh px-5 pb-16 pt-6">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <BrandLogo size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Saffron & Ember
            </p>
            <h1 className="truncate font-display text-3xl font-bold">Kitchen Dashboard</h1>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full border"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="no-scrollbar mx-auto mt-5 flex max-w-6xl gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold",
                tab === t.id
                  ? "gradient-ember border-transparent text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 max-w-6xl">
        {tab === "orders" && <OrdersBoard />}
        {tab === "requests" && <RequestsBoard />}
        {tab === "menu" && <MenuManager />}
        {tab === "analytics" && <Analytics />}
        {tab === "qr" && <QrStudio />}
      </div>
    </main>
  );
}
