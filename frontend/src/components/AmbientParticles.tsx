import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  phase: number;
  speed: number;
}

const WARM_COLORS = [
  "oklch(0.78 0.15 68 / ",   // amber
  "oklch(0.85 0.12 80 / ",   // saffron
  "oklch(0.7 0.1 55 / ",     // deep amber
  "oklch(0.9 0.08 90 / ",    // warm cream
];

export function AmbientParticles({ count = 28 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const visibleRef = useRef(true);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Intersection Observer — pause when not visible
    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(canvas);

    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const particleCount = isMobile ? Math.floor(count * 0.45) : count;

    let W = 0, H = 0;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx!.scale(dpr, dpr);
    }

    function spawnParticle(): Particle {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -(Math.random() * 0.18 + 0.06),
        size: Math.random() * 1.4 + 0.4,
        opacity: 0,
        maxOpacity: Math.random() * 0.35 + 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.008 + 0.004,
      };
    }

    resize();
    for (let i = 0; i < particleCount; i++) {
      const p = spawnParticle();
      p.y = Math.random() * H; // scatter initial position
      p.opacity = Math.random() * p.maxOpacity;
      particles.push(p);
    }

    window.addEventListener("resize", resize);

    function draw(t: number) {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      ctx!.clearRect(0, 0, W, H);

      for (const p of particles) {
        // Sinusoidal drift for organic movement
        p.x += p.vx + Math.sin(t * 0.0004 + p.phase) * 0.12;
        p.y += p.vy;
        p.opacity = p.maxOpacity * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));

        // Wrap around
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        const colorBase = WARM_COLORS[Math.floor(Math.abs(p.phase * 10)) % WARM_COLORS.length];
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `${colorBase}${p.opacity.toFixed(3)})`;
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, [shouldReduceMotion, count]);

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none", zIndex: 2 }}
      aria-hidden="true"
    />
  );
}
