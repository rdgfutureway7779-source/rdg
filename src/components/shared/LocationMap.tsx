import { ExternalLink, MapPin } from "lucide-react";
import { company } from "@/data/site";

export function LocationMap({ className = "" }: { className?: string }) {
  const zoom = 15;
  const tileCount = 2 ** zoom;
  const { lat, lng } = company.mapCoordinates;
  const x = ((lng + 180) / 360) * tileCount;
  const y = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * tileCount;
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const tileOffsetX = (x - tileX) * 256;
  const tileOffsetY = (y - tileY) * 256;
  const tiles = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, column) => ({
      src: `https://tile.openstreetmap.org/${zoom}/${tileX + column - 1}/${tileY + row - 1}.png`,
      key: `${row}-${column}`,
    })),
  ).flat();

  return (
    <div className={`overflow-hidden rounded-3xl border border-border shadow-soft ${className}`}>
      <div
        className="relative h-72 w-full overflow-hidden bg-[#dbe8ef]"
        aria-label="Map showing the RDG Future Way head office"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[768px] w-[768px]"
          style={{
            marginLeft: `${-(256 + tileOffsetX)}px`,
            marginTop: `${-(256 + tileOffsetY)}px`,
          }}
        >
          <div className="grid h-full w-full grid-cols-3 grid-rows-3">
            {tiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                aria-hidden="true"
                className="h-64 w-64 max-w-none"
                loading="eager"
              />
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/10" />
        <MapPin className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-full fill-primary text-white drop-shadow-lg" />
        <span className="absolute bottom-2 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-slate-600 shadow-sm">
          © OpenStreetMap contributors
        </span>
      </div>
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
