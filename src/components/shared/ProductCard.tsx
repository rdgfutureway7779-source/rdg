import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import bottleImage from "@/assets/optimized/anmol-ratan-juice-bottle.webp";
import bottleThumbnailImage from "@/assets/optimized/anmol-ratan-juice-bottle-thumb.webp";
import { getCatalogImageForCategory, getDefaultProductNetContent, type Product } from "@/data/site";

function resolveProductImage(
  imageUrl?: string | null,
  compact = false,
  productName = "",
  category?: string | null,
) {
  const isAnmolRatan = productName.trim().toLowerCase() === "anmol ratan juice";
  const categoryImage = getCatalogImageForCategory(category);
  const fallback = categoryImage || (compact ? bottleThumbnailImage : bottleImage);

  // Older CMS records stored Vite source paths such as /src/assets/..., which are
  // not public URLs after a production build. Use the bundled category asset instead.
  return imageUrl && !imageUrl.startsWith("/src/")
    ? imageUrl
    : isAnmolRatan
      ? compact
        ? bottleThumbnailImage
        : bottleImage
      : fallback;
}

export function ProductVisual({
  compact = false,
  thumbnail = false,
  imageUrl,
  productName = "Anmol Ratan Juice",
  category,
}: {
  compact?: boolean;
  thumbnail?: boolean;
  imageUrl?: string | null;
  productName?: string;
  category?: string | null;
}) {
  const fallbackImage = resolveProductImage(undefined, compact, productName, category);
  const [image, setImage] = useState(() =>
    resolveProductImage(imageUrl, compact, productName, category),
  );

  useEffect(() => {
    setImage(resolveProductImage(imageUrl, compact, productName, category));
  }, [category, compact, imageUrl, productName]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7fbe9] via-[#fff7d6] to-[#d7eff7] ${thumbnail ? "h-16 min-h-0" : compact ? "h-56 min-h-0" : "min-h-[30rem]"}`}
      aria-label={`${productName} product image`}
    >
      <div className="absolute -top-12 -right-10 h-44 w-44 rounded-full bg-[#a8d66d]/40 blur-3xl" />
      <div className="absolute -bottom-14 -left-8 h-48 w-48 rounded-full bg-[#e8a72d]/25 blur-3xl" />
      <img
        src={image}
        alt={`${productName} product image`}
        width={thumbnail ? 64 : compact ? 208 : 512}
        height={thumbnail ? 96 : compact ? 312 : 768}
        loading={compact ? "lazy" : "eager"}
        decoding="async"
        fetchPriority={compact ? "low" : "high"}
        onError={() => setImage(fallbackImage)}
        className={`relative max-h-full w-auto object-contain drop-shadow-2xl ${thumbnail ? "h-16" : compact ? "h-52" : "h-[29rem]"}`}
      />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-sheen group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <ProductVisual
        compact
        imageUrl={product.imageUrl}
        productName={product.name}
        category={product.category}
      />
      <div className="flex flex-1 flex-col p-6">
        <span className="bg-gold-grad inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-gold-foreground">
          {product.badge}
        </span>
        <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {product.category}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{product.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.subtitle}</p>
        <p className="mt-3 text-xs font-semibold text-secondary">
          {product.netContent || getDefaultProductNetContent(product.name, product.category)}
        </p>
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
