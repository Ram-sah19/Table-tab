import { useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { ChefHat, ScanLine } from "lucide-react";
import { AmbientParticles } from "@/components/AmbientParticles";
import { useGuest } from "@/lib/store";

// Steam wsp positions
const STEAM_WSPS = [
  { left: "48%", delay: "0s", height: "20px" },
  { left: "51%", delay: "0.8s", height: "14px" },
  { left: "45%", delay: "1.5s", height: "17px" },
  { left: "54%", delay: "0.3s", height: "12px" },
];

export function Welcome({ presetTable }: { presetTable?: string }) {
  const navigate = useNavigate();
  const { guest, setGuest } = useGuest();
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [table, setTable] = useState(presetTable ?? "");
  const [error, setError] = useState("");
  const [exiting, setExiting] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const dishRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse parallax for hero layers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    // Hero image subtle parallax
    if (heroRef.current) {
      heroRef.current.style.transform = `translate(${cx * -12}px, ${cy * -8}px) scale(1.06)`;
    }
    // Dish 3D tilt
    if (dishRef.current) {
      const rx = cy * -6;  // ±3 deg
      const ry = cx *  8;  // ±4 deg
      dishRef.current.style.setProperty("--dish-rx", `${rx}deg`);
      dishRef.current.style.setProperty("--dish-ry", `${ry}deg`);
      dishRef.current.style.transform =
        `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(12px)`;
    }
  }, [shouldReduceMotion]);

  const handleMouseLeave = useCallback(() => {
    if (heroRef.current) heroRef.current.style.transform = "translate(0,0) scale(1.06)";
    if (dishRef.current) {
      dishRef.current.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  }, []);

  const goToMenu = useCallback(() => {
    setExiting(true);
    setTimeout(() => navigate({ to: "/menu" }), 620);
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanTable = (presetTable ?? table).trim();
    if (cleanName.length < 2 || cleanName.length > 60) return setError("Enter your full name");
    if (!cleanTable) return setError("Enter your table number");
    setGuest({ name: cleanName, table: cleanTable });
    goToMenu();
  };

  return (
    <motion.main
      className="relative min-h-dvh overflow-hidden"
      animate={exiting ? { opacity: 0, scale: 1.04, filter: "blur(8px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Parallax hero image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={heroRef as React.RefObject<HTMLImageElement>}
          src="/images/hero.jpg"
          alt="Candlelit table at Saffron & Ember"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: "scale(1.06)",
            transition: shouldReduceMotion ? "none" : "transform 0.15s cubic-bezier(0.23,1,0.32,1)",
            willChange: "transform",
          }}
        />
      </div>

      {/* Ambient warm glow orb */}
      {!shouldReduceMotion && (
        <div
          className="hero-glow-orb absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 40% at 50% 40%, oklch(0.78 0.15 68 / 0.18), transparent 70%)",
            zIndex: 1,
          }}
        />
      )}

      {/* Ambient dust particles */}
      <AmbientParticles count={24} />

      {/* Dark veil layers */}
      <div className="absolute inset-0 bg-background/72" style={{ zIndex: 3 }} />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, var(--background) 30%, transparent)", zIndex: 4 }}
      />

      {/* 3D Dish Centerpiece — pseudo 3D with layered divs */}
      {!shouldReduceMotion && (
        <div
          className="absolute left-1/2 top-[18%] -translate-x-1/2 pointer-events-none select-none"
          style={{ zIndex: 5, width: 220, height: 220 }}
          aria-hidden="true"
        >
          {/* Plate shadow ring */}
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 140,
              height: 22,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, oklch(0 0 0 / 0.45), transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          {/* Dish float wrapper with tilt */}
          <div
            ref={dishRef}
            className="dish-float"
            style={{
              transformStyle: "preserve-3d",
              transition: shouldReduceMotion ? "none" : "transform 0.18s cubic-bezier(0.23,1,0.32,1)",
              willChange: "transform",
            }}
          >
            {/* Plate base */}
            <div
              style={{
                width: 160,
                height: 160,
                margin: "0 auto",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, oklch(0.38 0.02 60), oklch(0.22 0.02 60))",
                boxShadow:
                  "0 2px 0 oklch(0.5 0.03 80 / 0.3) inset, 0 16px 40px -8px oklch(0 0 0 / 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Inner plate ring */}
              <div
                style={{
                  position: "absolute",
                  inset: 12,
                  borderRadius: "50%",
                  border: "1px solid oklch(0.5 0.04 80 / 0.2)",
                }}
              />
              {/* Food image on plate */}
              <img
                src="/images/hero.jpg"
                alt=""
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.6)",
                  filter: "brightness(0.92) saturate(1.15)",
                }}
              />
              {/* Warm amber light reflection on plate */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 18,
                  width: 50,
                  height: 20,
                  borderRadius: "50%",
                  background: "oklch(0.85 0.12 80 / 0.12)",
                  filter: "blur(4px)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Steam wisps above the dish */}
            {STEAM_WSPS.map((s, i) => (
              <span
                key={i}
                className="steam-wsp"
                style={{
                  left: s.left,
                  bottom: "76%",
                  animationDelay: s.delay,
                  height: s.height,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-end px-5 pb-10 pt-16" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-4"
        >
          <motion.span
            className="gradient-ember inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow"
            whileHover={{ scale: 1.08, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <ChefHat className="h-7 w-7 text-primary-foreground" />
          </motion.span>
          <h1 className="font-display text-5xl leading-tight">
            Saffron <span className="text-ember">&</span> Ember
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome to your table. Browse the kitchen's finest, order straight from your phone and
            follow every step in real time.
          </p>
          {presetTable && (
            <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
              <ScanLine className="h-4 w-4 text-primary" /> Table {presetTable} detected
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!started && !guest ? (
            <motion.button
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              onClick={() => setStarted(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="gradient-ember mt-8 rounded-full py-4 text-base font-bold text-primary-foreground shadow-glow"
            >
              Start your order
            </motion.button>
          ) : null}

          {guest && !started ? (
            <motion.div
              key="returning"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="mt-8 space-y-3"
            >
              <motion.button
                onClick={goToMenu}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="gradient-ember w-full rounded-full py-4 text-base font-bold text-primary-foreground shadow-glow"
              >
                Continue as {guest.name} · Table {guest.table}
              </motion.button>
              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full border py-3 text-sm font-semibold transition-colors hover:bg-muted/30"
              >
                Not you? Start fresh
              </button>
            </motion.div>
          ) : null}

          {started ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              onSubmit={submit}
              className="glass-panel mt-8 space-y-3 rounded-3xl p-5 shadow-soft"
            >
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Full name
                <input
                  value={name}
                  maxLength={60}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm font-medium tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </label>
              {!presetTable && (
                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Table number
                  <input
                    value={table}
                    maxLength={10}
                    onChange={(e) => setTable(e.target.value)}
                    placeholder="e.g. 12"
                    className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 text-sm font-medium tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </label>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-semibold text-destructive"
                >
                  {error}
                </motion.p>
              )}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="gradient-ember w-full rounded-full py-4 text-base font-bold text-primary-foreground shadow-glow"
              >
                Continue
              </motion.button>
            </motion.form>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
