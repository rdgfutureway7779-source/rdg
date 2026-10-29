import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import bottleImage from "@/assets/optimized/anmol-ratan-juice-bottle.webp";
import bottleThumbnailImage from "@/assets/optimized/anmol-ratan-juice-bottle-thumb.webp";
import type { Product } from "@/data/site";

function resolveProductImage(imageUrl?: string | null, compact = false) {
  const isCatalogAsset =
    imageUrl?.startsWith("/src/assets/catalog/") ||
    imageUrl?.startsWith("/src/assets/optimized/catalog");
  return imageUrl && (!imageUrl.startsWith("/src/") || isCatalogAsset)
    ? imageUrl
    : compact
      ? bottleThumbnailImage
      : bottleImage;
}

export function ProductVisual({
  compact = false,
  imageUrl,
  productName = "Anmol Ratan Juice",
}: {
  compact?: boolean;
  imageUrl?: string | null;
  productName?: string;
}) {
  const [image, setImage] = useState(() => resolveProductImage(imageUrl, compact));

  useEffect(() => {
    setImage(resolveProductImage(imageUrl, compact));
  }, [compact, imageUrl]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7fbe9] via-[#fff7d6] to-[#d7eff7] ${compact ? "h-56 min-h-0" : "min-h-[30rem]"}`}
      aria-label={`${productName} product image`}
    >
      <div className="absolute -top-12 -right-10 h-44 w-44 rounded-full bg-[#a8d66d]/40 blur-3xl" />
      <div className="absolute -bottom-14 -left-8 h-48 w-48 rounded-full bg-[#e8a72d]/25 blur-3xl" />
      <img
        src={image}
        alt={`${productName} product image`}
        width={compact ? 208 : 512}
        height={compact ? 312 : 768}
        loading={compact ? "lazy" : "eager"}
        decoding="async"
        fetchPriority={compact ? "low" : "high"}
        onError={() => setImage(compact ? bottleThumbnailImage : bottleImage)}
        className={`relative max-h-full w-auto object-contain drop-shadow-2xl ${compact ? "h-52" : "h-[29rem]"}`}
      />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-sheen group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <ProductVisual compact imageUrl={product.imageUrl} productName={product.name} />
      <div className="flex flex-1 flex-col p-6">
        <span className="bg-gold-grad inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-gold-foreground">
          {product.badge}
        </span>
        <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {product.category}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{product.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.subtitle}</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {product.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {highlight}
            </li>
          ))}
        </ul>
        <a
          href={`/products/${product.slug || product.id}`}
          className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
        >
          View product details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
}
