import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ordersQuery, parseLines } from "@/lib/menu";
import { money } from "@/lib/store";

export function Analytics() {
  const { data: orders = [] } = useQuery(ordersQuery);

  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const revenue = todays
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => ["received", "confirmed", "preparing"].includes(o.status));
  const completed = orders.filter((o) => o.status === "served");
  const avgPrep =
    completed.length === 0
      ? 0
      : Math.round(
          completed.reduce(
            (sum, o) =>
              sum + (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000,
            0,
          ) / completed.length,
        );

  const dishCount = new Map<string, number>();
  orders.forEach((o) =>
    parseLines(o.items).forEach((l) => dishCount.set(l.name, (dishCount.get(l.name) ?? 0) + l.qty)),
  );
  const popular = [...dishCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const label = date.toLocaleDateString([], { weekday: "short" });
    const total = orders
      .filter(
        (o) =>
          o.status !== "cancelled" && new Date(o.created_at).toDateString() === date.toDateString(),
      )
      .reduce((sum, o) => sum + Number(o.total), 0);
    return { label, total: Number(total.toFixed(2)) };
  });

  const monthRevenue = orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's orders" value={String(todays.length)} />
        <Stat label="Today's revenue" value={money(revenue)} />
        <Stat label="Pending" value={String(pending.length)} />
        <Stat label="Completed" value={String(completed.length)} />
        <Stat label="Avg prep time" value={`${avgPrep} min`} />
        <Stat label="This month" value={money(monthRevenue)} />
        <Stat label="Popular dish" value={popular[0]?.[0] ?? "—"} />
        <Stat
          label="Avg order value"
          value={money(orders.length ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0)}
        />
      </div>

      <div className="rounded-3xl border bg-card p-4 shadow-soft">
        <h3 className="font-display text-xl">Revenue this week</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={44} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-4 shadow-soft">
        <h3 className="font-display text-xl">Most ordered</h3>
        {popular.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {popular.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-semibold">{name}</span>
                <span className="shrink-0 text-muted-foreground">{count} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-soft">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-display text-2xl">{value}</p>
    </div>
  );
}
