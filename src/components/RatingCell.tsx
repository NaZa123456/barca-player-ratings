import { cn } from "@/lib/utils";

export function ratingColor(rating?: number): string {
  if (rating === undefined || Number.isNaN(rating)) return "bg-muted text-muted-foreground";
  if (rating >= 9) return "bg-gradient-blaugrana text-primary-foreground shadow-glow";
  if (rating >= 8) return "bg-[oklch(0.65_0.18_145)] text-white";
  if (rating >= 7) return "bg-[oklch(0.75_0.15_145)] text-[oklch(0.20_0.05_145)]";
  if (rating >= 6) return "bg-[oklch(0.85_0.12_90)] text-[oklch(0.25_0.08_90)]";
  if (rating >= 5) return "bg-[oklch(0.80_0.14_50)] text-[oklch(0.25_0.10_50)]";
  return "bg-[oklch(0.65_0.20_25)] text-white";
}

export function RatingBadge({ rating, className }: { rating?: number; className?: string }) {
  const display = rating === undefined || Number.isNaN(rating) ? "—" : rating.toFixed(1);
  return (
    <span
      className={cn(
        "inline-flex h-9 w-12 items-center justify-center rounded-md font-display text-base tabular-nums",
        ratingColor(rating),
        className,
      )}
    >
      {display}
    </span>
  );
}
