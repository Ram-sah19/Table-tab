import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { BrandLogo } from "@/components/BrandLogo";
import { loginServerFn, registerServerFn } from "@/lib/api";
import { getStoredStaffSession, setStoredStaffSession } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Saffron & Ember" },
      { name: "description", content: "Restaurant staff sign in for the live order dashboard." },
      { property: "og:title", content: "Staff sign in — Saffron & Ember" },
      { property: "og:description", content: "Sign in to manage live orders and the menu." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getStoredStaffSession();
    if (session?.token) {
      navigate({ to: "/staff/dashboard" });
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const result = await loginServerFn({ data: parsed.data });
        setStoredStaffSession(result);
        toast.success("Welcome back!");
        navigate({ to: "/staff/dashboard" });
      } else {
        const result = await registerServerFn({
          data: {
            ...parsed.data,
            full_name: parsed.data.email.split("@")[0],
          },
        });
        setStoredStaffSession(result);
        toast.success("Staff account created and signed in!");
        navigate({ to: "/staff/dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <BrandLogo size="lg" showText={true} />
        </div>
        <h1 className="font-display text-3xl font-bold mt-3">Staff access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to see live orders, manage the menu and view analytics.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-2xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-2xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="gradient-ember w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create staff account"}
          </button>
        </form>

        <div className="mt-4 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo Credentials:</p>
          <p>Email: <code className="text-primary font-mono">staff@restaurant.com</code></p>
          <p>Password: <code className="text-primary font-mono">staff123</code></p>
        </div>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground"
        >
          {mode === "signin" ? "New here? Create a staff account" : "Already have an account? Sign in"}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground">
          ← Back to the guest experience
        </Link>
      </div>
    </main>
  );
}
