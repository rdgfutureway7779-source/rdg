import {
  ArrowRight,
  Baby,
  BookOpen,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Filter,
  Footprints,
  Gem,
  HeartPulse,
  Home,
  Leaf,
  LayoutGrid,
  Music,
  Search,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sprout,
  Tv,
  type LucideIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import aiLearningImage from "@/assets/optimized/banners/ai-learning.webp";
import aiWellnessImage from "@/assets/optimized/banners/ai-wellness-product.webp";
import anmolRatanHeroImage from "@/assets/optimized/banners/anmol-ratan-hero-v2.webp";
import familyWellnessImage from "@/assets/optimized/banners/hero.webp";
const productsBannerImage = "/products-banner.webp";
const productsBannerMobileImage = "/products-banner-mobile.webp";
import { ProductVisual } from "@/components/shared/ProductCard";
import {
  catalogDemoProducts,
  getCatalogImageForCategory,
  products,
  type Product,
} from "@/data/site";
import { getPublicProducts } from "@/lib/cms";

const money = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "Price on request"
    : `₹${Number(value).toLocaleString("en-IN")}`;

const categoryCatalog = [
  "Mobiles & Computers",
  "TV, Appliances & Electronics",
  "Men's Fashion",
  "Women's Fashion",
  "Footwear",
  "Toys, Baby Products & Kids' Fashion",
  "Car, Motorbike & Industrial",
  "Books",
  "Movies, Music & Video Games",
  "Ayurvedic & Herbal",
  "Wellness & Nutrition",
  "Personal Care",
  "Home, Kitchen & Pets",
  "Beauty, Health & Grocery",
  "Sports, Fitness, Bags & Luggage",
  "Agriculture & Garden",
];

const categoryIcons: Record<string, LucideIcon> = {
  "All categories": LayoutGrid,
  "Mobiles & Computers": Smartphone,
  "TV, Appliances & Electronics": Tv,
  "Men's Fashion": Shirt,
  "Women's Fashion": Shirt,
  Footwear: Footprints,
  "Toys, Baby Products & Kids' Fashion": Baby,
  "Car, Motorbike & Industrial": Car,
  Books: BookOpen,
  "Movies, Music & Video Games": Music,
  "Ayurvedic & Herbal": Leaf,
  "Wellness & Nutrition": HeartPulse,
  "Personal Care": Sparkles,
  "Home, Kitchen & Pets": Home,
  "Beauty, Health & Grocery": Gem,
  "Sports, Fitness, Bags & Luggage": Dumbbell,
  "Agriculture & Garden": Sprout,
};

const getCategoryIcon = (label: string) => categoryIcons[label] || LayoutGrid;

const productBanners = [
  {
    image: productsBannerImage,
    eyebrow: "RDG product catalogue",
    title: "Products for wellness and opportunity",
    description: "Explore the RDG collection and find the products that fit your everyday routine.",
    href: "/products",
  },
  {
    image: anmolRatanHeroImage,
    eyebrow: "Signature product",
    title: "Meet Anmol Ratan Juice",
    description: "Discover the herbal and mixed-berry product at the heart of RDG Future Way.",
    href: "/products/anmol-ratan-juice",
  },
  {
    image: aiWellnessImage,
    eyebrow: "Everyday wellness",
    title: "Thoughtful products for daily routines",
    description: "Browse product details, pricing and highlights before you choose.",
    href: "/products",
  },
  {
    image: familyWellnessImage,
    eyebrow: "Family-first choices",
    title: "Made for the routines that matter",
    description: "Explore a growing collection across wellness, personal care and lifestyle.",
    href: "/products",
  },
  {
    image: aiLearningImage,
    eyebrow: "Explore with RDG",
    title: "Learn more about every product",
    description: "Compare descriptions, prices and product information in one place.",
    href: "/products",
  },
];

const isProductPackage = (product: Product) => {
  const searchable = `${product.name} ${product.category}`.toLowerCase();
  return product.name !== "Anmol Ratan Juice" && /package|bundle/.test(searchable);
};

function Products() {
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window === "undefined") return "All categories";
    return new URLSearchParams(window.location.search).get("category") || "All categories";
  });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(
    [...products, ...catalogDemoProducts].filter((item) => !isProductPackage(item)),
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);

  useEffect(() => {
    if (bannerPaused) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % productBanners.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [bannerPaused]);

  const moveBanner = (direction: number) => {
    setActiveBanner(
      (current) => (current + direction + productBanners.length) % productBanners.length,
    );
  };

  useEffect(() => {
    getPublicProducts().then((data) => {
      if (!data?.length) return;
      const liveProducts = data.map((item) => {
        const storedPrice = Number(item.price);
        return {
          id: String(item.id),
          slug: item.slug,
          name: item.name,
          category: item.category || "RDG product",
          subtitle: item.subtitle || "Discover the RDG product range.",
          description: item.description || "",
          highlights: item.highlights || [],
          badge: item.name === "Anmol Ratan Juice" ? "Signature product" : "RDG product",
          price:
            Number.isFinite(storedPrice) && storedPrice > 0
              ? storedPrice
              : item.name === "Anmol Ratan Juice"
                ? 1200
                : null,
          dpPrice:
            item.dpPrice === null || item.dpPrice === undefined ? null : Number(item.dpPrice),
          stockQuantity:
            item.stockQuantity === null || item.stockQuantity === undefined
              ? null
              : Number(item.stockQuantity),
          isServiceable: item.isServiceable !== false,
          imageUrl: item.imageUrl || getCatalogImageForCategory(item.category),
        };
      });
      const filteredLiveProducts = liveProducts.filter((item) => !isProductPackage(item));
      const liveSlugs = new Set(filteredLiveProducts.map((item) => item.slug));
      setCatalogProducts([
        ...filteredLiveProducts,
        ...catalogDemoProducts.filter(
          (item) => !isProductPackage(item) && !liveSlugs.has(item.slug),
        ),
      ]);
    });
  }, []);

  const categories = useMemo(
    () => [
      { label: "All categories", count: catalogProducts.length, icon: LayoutGrid },
      ...categoryCatalog.map((label) => ({
        label,
        icon: getCategoryIcon(label),
        count: catalogProducts.filter(
          (item) => item.category === label || item.category.includes(label),
        ).length,
      })),
      ...Array.from(new Set(catalogProducts.map((item) => item.category).filter(Boolean)))
        .filter((category) => !categoryCatalog.some((label) => category.includes(label)))
        .map((category) => ({
          label: category,
          icon: getCategoryIcon(category),
          count: catalogProducts.filter((item) => item.category === category).length,
        })),
    ],
    [catalogProducts],
  );

  const carouselCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.label !== "All categories" &&
          Boolean(getCatalogImageForCategory(category.label)),
      ),
    [categories],
  );

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = catalogProducts.filter((item) => {
      const matchesCategory =
        activeCategory === "All categories" ||
        item.category === activeCategory ||
        (categoryCatalog.includes(activeCategory) && item.category.includes(activeCategory));
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
    setActiveCategory("All categories");
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
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    activeCategory === category.label
                      ? "bg-white/15 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <category.icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span className="min-w-0">{category.label}</span>
              </span>
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
    <section className="bg-[#fafbf7] py-8 sm:py-12">
      <div className="container-x products-page-container">
        <div className="rounded-2xl border border-primary/10 bg-[linear-gradient(120deg,#f1f8ec_0%,#fffdf5_52%,#eef7f9_100%)] px-6 py-8 shadow-soft sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl leading-tight font-bold text-primary-dark sm:text-5xl">
                Find exactly what you need.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Explore the RDG collection by category, compare product information and view current
                prices before adding a product to your customer cart.
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

        <section
          className="product-banner-carousel mt-7"
          aria-label="RDG product promotions"
          onMouseEnter={() => setBannerPaused(true)}
          onMouseLeave={() => setBannerPaused(false)}
          onFocusCapture={() => setBannerPaused(true)}
          onBlurCapture={() => setBannerPaused(false)}
        >
          <div
            className="product-banner-track"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
            aria-live="polite"
          >
            {productBanners.map((banner, index) => (
              <article key={banner.title} className="product-banner-slide">
                {index === activeBanner && (
                  <picture>
                    {index === 0 && (
                      <source media="(max-width: 639px)" srcSet={productsBannerMobileImage} />
                    )}
                    <img
                      src={banner.image}
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </picture>
                )}
                <div className="product-banner-copy">
                  <h2 className="max-w-xl font-display text-3xl leading-tight font-bold text-primary-dark sm:text-5xl">
                    {banner.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {banner.description}
                  </p>
                  <a
                    href={banner.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
                  >
                    Explore products <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="product-banner-arrow product-banner-arrow-left"
            onClick={() => moveBanner(-1)}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="product-banner-arrow product-banner-arrow-right"
            onClick={() => moveBanner(1)}
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="product-banner-dots" aria-label="Choose banner">
            {productBanners.map((banner, index) => (
              <button
                key={`banner-dot-${banner.title}`}
                type="button"
                onClick={() => setActiveBanner(index)}
                className={index === activeBanner ? "is-active" : ""}
                aria-label={`Show banner ${index + 1}`}
                aria-current={index === activeBanner ? "true" : undefined}
              />
            ))}
          </div>
        </section>

        <div className="category-showcase mt-7 border-y border-border bg-white py-6 shadow-soft sm:py-7">
          <div className="category-showcase-heading">
            <span />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Categories
              </p>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Find Exactly What You Need.
              </p>
            </div>
            <span />
          </div>
          <div className="category-carousel mt-7" aria-label="Product categories carousel">
            <div className="category-carousel-track">
              {[...carouselCategories, ...carouselCategories].map((category, index) => {
                const imageUrl = getCatalogImageForCategory(category.label);
                return (
                  <button
                    key={`${category.label}-${index}`}
                    type="button"
                    onClick={() => setActiveCategory(category.label)}
                    className={`category-carousel-card ${activeCategory === category.label ? "is-active" : ""}`}
                    aria-label={`View ${category.label}`}
                  >
                    <span className="category-carousel-image">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" loading="eager" decoding="async" />
                      ) : (
                        <category.icon className="h-10 w-10 text-primary" aria-hidden="true" />
                      )}
                    </span>
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
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
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card"
                  >
                    <a href={`/products/${item.slug || item.id}`} className="block">
                      <ProductVisual compact imageUrl={item.imageUrl} productName={item.name} />
                    </a>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                          {item.category}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#f7f1d7] px-2.5 py-1 text-[10px] font-bold text-gold-foreground">
                          {item.badge || "RDG product"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                        {item.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.subtitle}
                      </p>
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">MRP</p>
                        <p className="mt-0.5 text-xl font-bold text-primary">{money(item.price)}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Inclusive of all taxes
                        </p>
                        <p
                          className={`mt-2 text-[11px] font-semibold ${item.isServiceable === false ? "text-destructive" : "text-secondary"}`}
                        >
                          {item.isServiceable === false
                            ? "Not serviceable"
                            : item.stockQuantity == null
                              ? "Availability confirmed at checkout"
                              : item.stockQuantity > 0
                                ? `${item.stockQuantity} in stock`
                                : "Out of stock"}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Product details
                        </span>
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
