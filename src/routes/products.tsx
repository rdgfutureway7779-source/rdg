import {
  ArrowRight,
  CheckCircle2,
  Filter,
  LayoutGrid,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductVisual } from "@/components/shared/ProductCard";
import { products, type Product } from "@/data/site";
import { getPublicProducts } from "@/lib/cms";

const money = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "Price on request"
    : `₹${Number(value).toLocaleString("en-IN")}`;

function Products() {
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window === "undefined") return "All products";
    return new URLSearchParams(window.location.search).get("category") || "All products";
  });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    getPublicProducts().then((data) => {
      if (!data?.length) return;
      setCatalogProducts(
        data.map((item) => ({
          id: String(item.id),
          slug: item.slug,
          name: item.name,
          category: item.category || "RDG product",
          subtitle: item.subtitle || "Discover the RDG product range.",
          description: item.description || "",
          highlights: item.highlights || [],
          badge: item.name === "Anmol Ratan Juice" ? "Signature product" : "RDG product",
          price: item.price,
          imageUrl: item.imageUrl,
        })),
      );
    });
  }, []);

  const categories = useMemo(
    () => [
      { label: "All products", count: catalogProducts.length },
      ...Array.from(new Set(catalogProducts.map((item) => item.category).filter(Boolean))).map(
        (category) => ({
          label: category,
          count: catalogProducts.filter((item) => item.category === category).length,
        }),
      ),
    ],
    [catalogProducts],
  );

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = catalogProducts.filter((item) => {
      const matchesCategory = activeCategory === "All products" || item.category === activeCategory;
      const matchesSearch =
        !query ||
        [item.name, item.category, item.subtitle, item.description].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      return a.name.localeCompare(b.name);
    });
  }, [activeCategory, catalogProducts, search, sort]);

  const clearFilters = () => {
    setActiveCategory("All products");
    setSearch("");
    setSort("featured");
  };

  const filterPanel = (
    <aside className="rounded-3xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-28 lg:h-fit">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-bold">Filters</h2>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Categories
        </p>
        <div className="mt-3 space-y-1.5">
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              onClick={() => {
                setActiveCategory(category.label);
                setMobileFiltersOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                activeCategory === category.label
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-primary"
              }`}
            >
              <span>{category.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeCategory === category.label
                    ? "bg-white/15 text-primary-foreground"
                    : "bg-surface text-muted-foreground"
                }`}
              >
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Shop confidently
        </p>
        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Product details shown on every listing
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Save products to your customer cart
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Order support from RDG Future Way
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="container-x">
        <div className="rounded-[2rem] border border-primary/10 bg-[linear-gradient(120deg,#eef6ff_0%,#fffdf5_50%,#edf8f0_100%)] px-6 py-8 shadow-soft sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                <Sparkles className="h-4 w-4" /> RDG product store
              </div>
              <h1 className="mt-3 font-display text-4xl leading-tight font-bold text-primary-dark sm:text-5xl">
                Choose products for your everyday wellness journey.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Browse the RDG collection, compare product information and add your favourites to a
                saved customer cart.
              </p>
            </div>
            <a
              href="/cart"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
            >
              <ShoppingCart className="h-4 w-4" /> View cart <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 lg:hidden">
          <p className="text-sm font-semibold text-foreground">Shop the collection</p>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-soft"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
        {mobileFiltersOpen && <div className="mt-4 lg:hidden">{filterPanel}</div>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
          <div className="hidden lg:block">{filterPanel}</div>

          <div className="min-w-0">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{visibleItems.length}</span>{" "}
                  {visibleItems.length === 1 ? "product" : "products"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {activeCategory}
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block min-w-0 sm:w-60">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products"
                    className="field pl-9"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="whitespace-nowrap">Sort by</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="field py-2"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>

            {visibleItems.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map((item) => (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card"
                  >
                    <a href={`/products/${item.slug || item.id}`} className="block">
                      <ProductVisual compact imageUrl={item.imageUrl} productName={item.name} />
                    </a>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                          {item.category}
                        </p>
                        <span className="shrink-0 rounded-full bg-gold-grad px-2.5 py-1 text-[10px] font-bold text-gold-foreground">
                          {item.badge || "RDG product"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold text-foreground">
                        {item.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.subtitle}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-lg font-bold text-primary">{money(item.price)}</p>
                        <a
                          href={`/products/${item.slug || item.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                        >
                          View details{" "}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <LayoutGrid className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-display text-xl font-bold">No products found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another search or clear the current filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <X className="h-4 w-4" /> Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
