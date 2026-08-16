import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Printer, Download, Sparkles, SlidersHorizontal } from "lucide-react";
import { playTap } from "@/lib/audio";
import { toast } from "sonner";

export function QrStudio() {
  const [tables, setTables] = useState(12);
  const [restaurantName, setRestaurantName] = useState("Saffron & Ember");
  const [tagline, setTagline] = useState("Scan to browse digital menu & place order");
  const [themeColor, setThemeColor] = useState<"gold" | "obsidian" | "emerald">("gold");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handlePrint = () => {
    playTap();
    window.print();
  };

  const downloadQr = (tableNum: number) => {
    playTap();
    const canvas = document.getElementById(`qr-canvas-${tableNum}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `Table-${tableNum}-QR.png`;
    a.href = url;
    a.click();
    toast.success(`Downloaded QR Code for Table ${tableNum}`);
  };

  const getThemeClass = () => {
    switch (themeColor) {
      case "obsidian":
        return "bg-zinc-950 text-amber-100 border-amber-500/30";
      case "emerald":
        return "bg-emerald-950 text-emerald-100 border-emerald-500/30";
      case "gold":
      default:
        return "bg-gradient-to-b from-amber-950 via-stone-900 to-black text-amber-50 border-amber-500/40";
    }
  };

  return (
    <section className="space-y-6">
      {/* Control Bar (hidden during print) */}
      <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Table QR Stand Studio
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Generate luxury branded table cards with embedded table codes. Print or export directly.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="gradient-ember flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
          >
            <Printer className="h-4 w-4" /> Print All Table Stands
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Restaurant Brand Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Table Card Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Card Material Theme
            </label>
            <div className="flex gap-2">
              {[
                { id: "gold", label: "Golden Brass" },
                { id: "obsidian", label: "Obsidian Dark" },
                { id: "emerald", label: "Emerald Royal" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    playTap();
                    setThemeColor(t.id as any);
                  }}
                  className={`flex-1 rounded-xl py-2 px-2 text-[11px] font-bold border transition-all ${
                    themeColor === t.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>
              <SlidersHorizontal className="inline h-3.5 w-3.5 mr-1" /> Active Tables: {tables}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={36}
            value={tables}
            onChange={(e) => setTables(Number(e.target.value))}
            className="mt-2 w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Printable Grid of Acrylic Stand Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {Array.from({ length: tables }).map((_, i) => {
          const number = i + 1;
          const url = `${origin}/table/${number}`;
          return (
            <div
              key={number}
              className={`relative overflow-hidden rounded-3xl border p-6 text-center shadow-soft flex flex-col items-center justify-between min-h-[320px] transition-all hover:scale-102 ${getThemeClass()}`}
            >
              {/* Stand Header */}
              <div className="space-y-1 w-full border-b border-amber-500/20 pb-3">
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-80">
                  Welcome to
                </span>
                <h4 className="font-display text-xl font-bold tracking-wide">{restaurantName}</h4>
              </div>

              {/* QR Centerpiece */}
              <div className="my-4 rounded-2xl bg-white p-3.5 shadow-xl ring-4 ring-amber-500/30">
                {origin ? (
                  <QRCodeCanvas
                    id={`qr-canvas-${number}`}
                    value={url}
                    size={130}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="h-[130px] w-[130px] bg-stone-100" />
                )}
              </div>

              {/* Table Info & Call to Action */}
              <div className="w-full space-y-1">
                <div className="inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1">
                  <span className="font-display text-lg font-bold text-amber-200">Table {number}</span>
                </div>
                <p className="text-[11px] opacity-80 max-w-[220px] mx-auto leading-relaxed pt-1">
                  {tagline}
                </p>
              </div>

              {/* Hover Actions (hidden during print) */}
              <div className="mt-3 flex items-center gap-2 print:hidden w-full pt-2 border-t border-amber-500/20">
                <button
                  onClick={() => downloadQr(number)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Save PNG
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
