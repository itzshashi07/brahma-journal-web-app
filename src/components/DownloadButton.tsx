import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
export function PlayMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 3.8v16.4L20 12 5 3.8Z" />
    </svg>
  );
}
export function DownloadButton({
  label = "Get it on Google Play",
  className = "",
  compact = false,
}: {
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={site.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`download-button ${compact ? "compact" : ""} ${className}`}
      aria-label={`${label} — opens Google Play`}
    >
      <PlayMark size={compact ? 18 : 23} />
      <span>{label}</span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
