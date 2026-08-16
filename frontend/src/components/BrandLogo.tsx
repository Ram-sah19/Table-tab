import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function BrandLogo({ className, size = "md", showText = false }: BrandLogoProps) {
  const sizeMap = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className={cn("relative shrink-0", sizeMap[size])}>
        <img
          src="/favicon.svg"
          alt="Saffron & Ember emblem"
          className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-bold leading-tight tracking-tight text-foreground text-lg sm:text-xl">
            Saffron & Ember
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
            Table Tap · Dining
          </span>
        </div>
      )}
    </div>
  );
}
