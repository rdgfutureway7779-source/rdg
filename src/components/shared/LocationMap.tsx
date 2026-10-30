import { ExternalLink, MapPin } from "lucide-react";
import { company } from "@/data/site";

export function LocationMap({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-border shadow-soft ${className}`}>
      <iframe
        title="RDG Future Way location"
        src={company.mapEmbedUrl}
        width="600"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-72 w-full bg-surface"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">RDG Future Way head office</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{company.address}</p>
          </div>
        </div>
        <a
          href={company.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
