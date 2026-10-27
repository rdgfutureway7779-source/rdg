import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/shared/ProductCard";
import { catalogDemoProducts, products } from "@/data/site";
import { getPublicProducts, type PublicProduct } from "@/lib/cms";
import {
  addToCustomerCart,
  broadcastCustomerCartChange,
  customerCartSyncKey,
  getCustomerCart,
  updateCustomerCart,
} from "@/lib/customer-api";

const productPackages = [
  { id: "pack-1", label: "Package 1", units: 5, price: 3500 },
  { id: "pack-2", label: "Package 2", units: 10, price: 7000 },
  { id: "pack-3", label: "Package 3", units: 15, price: 10500 },
  { id: "pack-4", label: "Package 4", units: 20, price: 14000 },
];

const ANMOL_RATAN_UNIT_PRICE = 1200;

const isNonAnmolPackage = (name: string, category?: string | null) =>
  name !== "Anmol Ratan Juice" && /package|bundle/i.test(`${name} ${category || ""}`);

const money = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "Price available on request"
    : `₹${Number(value).toLocaleString("en-IN")}`;

function quantityFromUrl() {
  const value = Number(new URLSearchParams(window.location.search).get("quantity"));
  return Number.isInteger(value) ? Math.min(99, Math.max(1, value)) : 1;
}

function ProductDetail() {
  const slug = typeof window === "undefined" ? "" : window.location.pathname.split("/").pop() || "";
  const [product, setProduct] = useState<(PublicProduct & { badge?: string }) | null>(null);
  const [quantity, setQuantity] = useState(quantityFromUrl);
  const [selectedPackageId, setSelectedPackageId] = useState(productPackages[0].id);
  const [cartItemExists, setCartItemExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const quantityRef = useRef(quantity);
  const cartItemExistsRef = useRef(cartItemExists);
  const productRef = useRef(product);

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    cartItemExistsRef.current = cartItemExists;
  }, [cartItemExists]);

  useEffect(() => {
    productRef.current = product;
  }, [product]);

  useEffect(() => {
    if (typeof product?.id !== "number") return;
    let active = true;
    getCustomerCart()
      .then((items) => {
        if (!active) return;
        const cartItem = items.find((item) => Number(item.productId) === Number(product.id));
        cartItemExistsRef.current = Boolean(cartItem);
        setCartItemExists(Boolean(cartItem));
        if (cartItem) {
          const displayQuantity =
            product?.name === "Anmol Ratan Juice"
              ? Math.max(1, Math.round(cartItem.quantity / productPackages[0].units))
              : cartItem.quantity;
          quantityRef.current = displayQuantity;
          setQuantity(displayQuantity);
        }
      })
      .catch(() => {
        if (active) {
          cartItemExistsRef.current = false;
          setCartItemExists(false);
        }
      });
    return () => {
      active = false;
    };
  }, [product?.id, product?.name]);

  useEffect(() => {
    getPublicProducts()
      .then((items) => {
        const fallback = [...products, ...catalogDemoProducts].find(
          (item) =>
            (item.id === slug || item.slug === slug || item.name === slug) &&
            !isNonAnmolPackage(item.name, item.category),
        );
        const mapped = (items || []).find(
          (item) =>
            (item.slug === slug || String(item.id) === slug) &&
            !isNonAnmolPackage(item.name, item.category),
        );
        const mappedPrice = mapped ? Number(mapped.price) : NaN;
        setProduct(
          mapped
            ? {
                ...mapped,
                price:
                  Number.isFinite(mappedPrice) && mappedPrice > 0
                    ? mappedPrice
                    : mapped.name === "Anmol Ratan Juice"
                      ? ANMOL_RATAN_UNIT_PRICE
                      : null,
                badge: mapped.name === "Anmol Ratan Juice" ? "Signature Product" : "RDG Product",
              }
            : fallback
              ? {
                  ...fallback,
                  slug: fallback.id,
                  price:
                    Number(fallback.price) > 0
                      ? fallback.price
                      : fallback.name === "Anmol Ratan Juice"
                        ? ANMOL_RATAN_UNIT_PRICE
                        : null,
                  imageUrl: null,
                  id: fallback.id,
                }
              : null,
        );
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const selectedPackage =
    productPackages.find((item) => item.id === selectedPackageId) || productPackages[0];
  const isPackageProduct = product?.name === "Anmol Ratan Juice";
  const unitPrice = isPackageProduct
    ? ANMOL_RATAN_UNIT_PRICE
    : product?.price == null
      ? null
      : Number(product.price);
  const packageTotal =
    isPackageProduct && unitPrice !== null ? selectedPackage.price * quantity : null;
  const cartQuantity = (isPackageProduct ? selectedPackage.units : 1) * quantity;
  const maxQuantity = isPackageProduct ? Math.floor(99 / selectedPackage.units) : 99;

  async function addToCart(buyNow = false) {
    if (!product || typeof product.id !== "number") {
      setError("This product is not available for online ordering yet.");
      return;
    }
    try {
      setAdding(true);
      setError("");
      const items = cartItemExists
        ? await updateCustomerCart(product.id, cartQuantity)
        : await addToCustomerCart(product.id, cartQuantity);
      const saved = items.find((item) => Number(item.productId) === Number(product.id));
      cartItemExistsRef.current = Boolean(saved);
      setCartItemExists(Boolean(saved));
      quantityRef.current = saved?.quantity ?? cartQuantity;
      setQuantity(saved?.quantity ?? cartQuantity);
      broadcastCustomerCartChange(product.id, saved?.quantity ?? cartQuantity);
      setAdded(true);
      if (buyNow) window.location.href = "/checkout";
    } catch (reason) {
      if ((reason as Error & { status?: number }).status === 401) {
        window.location.href = `/customer/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      setError(
        reason instanceof Error ? reason.message : "Unable to add this product to your cart.",
      );
    } finally {
      setAdding(false);
    }
  }

  const changeQuantity = useCallback(
    async (delta: number) => {
      const currentProduct = productRef.current;
      const nextQuantity = Math.min(maxQuantity, Math.max(1, quantityRef.current + delta));
      const nextCartQuantity = (isPackageProduct ? selectedPackage.units : 1) * nextQuantity;
      quantityRef.current = nextQuantity;
      setQuantity(nextQuantity);
      setAdded(false);
      if (!currentProduct || typeof currentProduct.id !== "number" || !cartItemExistsRef.current)
        return;

      try {
        const items = await updateCustomerCart(currentProduct.id, nextCartQuantity);
        const cartItem = items.find((item) => Number(item.productId) === Number(currentProduct.id));
        cartItemExistsRef.current = Boolean(cartItem);
        setCartItemExists(Boolean(cartItem));
        quantityRef.current = cartItem
          ? isPackageProduct
            ? Math.max(1, Math.round(cartItem.quantity / selectedPackage.units))
            : cartItem.quantity
          : nextQuantity;
        setQuantity(quantityRef.current);
        broadcastCustomerCartChange(currentProduct.id, cartItem?.quantity ?? nextCartQuantity);
      } catch (reason) {
        if ((reason as Error & { status?: number }).status !== 401) {
          setError(reason instanceof Error ? reason.message : "Unable to update cart quantity.");
        }
      }
    },
    [isPackageProduct, maxQuantity, selectedPackage.units],
  );

  useEffect(() => {
    function handleQuantityAction(event: MouseEvent) {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-quantity-action]")
          : null;
      const action = target?.dataset.quantityAction;
      if (!action) return;
      event.preventDefault();
      const nextQuantity = Math.min(
        maxQuantity,
        Math.max(1, quantityRef.current + (action === "increase" ? 1 : -1)),
      );
      const valueElement =
        target?.parentElement?.querySelector<HTMLElement>("[data-quantity-value]");
      if (valueElement) {
        valueElement.textContent = String(nextQuantity);
        valueElement.setAttribute("aria-label", `Quantity ${nextQuantity}`);
      }
      void changeQuantity(action === "increase" ? 1 : -1);
    }

    document.addEventListener("click", handleQuantityAction, true);
    return () => document.removeEventListener("click", handleQuantityAction, true);
  }, [changeQuantity, maxQuantity]);

  useEffect(() => {
    function syncFromAnotherTab(event: StorageEvent) {
      if (event.key !== customerCartSyncKey || !event.newValue || !product?.id) return;
      try {
        const change = JSON.parse(event.newValue) as {
          productId?: number;
          quantity?: number | null;
        };
        if (Number(change.productId) !== Number(product.id)) return;
        const nextQuantity =
          change.quantity === null
            ? 1
            : product?.name === "Anmol Ratan Juice"
              ? Math.max(1, Math.round((change.quantity || 1) / selectedPackage.units))
              : Math.max(1, change.quantity || 1);
        quantityRef.current = nextQuantity;
        cartItemExistsRef.current = change.quantity !== null;
        setQuantity(nextQuantity);
        setCartItemExists(change.quantity !== null);
      } catch {
        // Ignore malformed cross-tab events.
      }
    }

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, [product?.id, product?.name, selectedPackage.units]);

  if (loading) {
    return (
      <div className="container-x py-32 text-center text-muted-foreground">Loading product…</div>
    );
  }

  if (!product) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <a href="/products" className="mt-5 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </a>
      </div>
    );
  }

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-x">
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all products
        </a>
        <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
            <ProductVisual imageUrl={product.imageUrl} productName={product.name} />
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-7 shadow-card sm:p-10">
            <span className="bg-gold-grad inline-flex rounded-full px-4 py-2 text-xs font-bold text-gold-foreground uppercase">
              {product.badge || "RDG Product"}
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {product.category || "RDG wellness product"}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight font-bold text-foreground">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{product.subtitle}</p>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-bold text-primary">{money(unitPrice)}</p>
              <span className="pb-1 text-sm text-muted-foreground">per product</span>
            </div>

            {isPackageProduct && (
              <div className="mt-7 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-foreground">
                    Product package
                  </span>
                  <select
                    value={selectedPackageId}
                    onChange={(event) => setSelectedPackageId(event.target.value)}
                    className="field bg-card"
                  >
                    {productPackages.map((packageOption) => (
                      <option key={packageOption.id} value={packageOption.id}>
                        {packageOption.label} — {money(packageOption.price)} ({packageOption.units}{" "}
                        bottles)
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <PackageCheck className="h-4 w-4 text-secondary" /> {selectedPackage.units}{" "}
                    bottles in this package
                  </span>
                  <span className="font-bold text-primary">{money(packageTotal)}</span>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-border bg-surface">
                <a
                  href={`${window.location.pathname}?quantity=${Math.max(1, quantity - 1)}`}
                  data-quantity-action="decrease"
                  className="cursor-pointer p-3 text-primary select-none"
                  aria-label="Decrease quantity"
                  role="button"
                >
                  <Minus className="pointer-events-none h-4 w-4" />
                </a>
                <span
                  data-quantity-value
                  className="min-w-10 text-center text-sm font-bold"
                  aria-live="polite"
                  aria-label={`Quantity ${quantity}`}
                >
                  {quantity}
                </span>
                <a
                  href={`${window.location.pathname}?quantity=${Math.min(maxQuantity, quantity + 1)}`}
                  data-quantity-action="increase"
                  className="cursor-pointer p-3 text-primary select-none"
                  aria-label="Increase quantity"
                  role="button"
                >
                  <Plus className="pointer-events-none h-4 w-4" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => void addToCart(true)}
                disabled={adding}
                className="bg-brand inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-60"
              >
                <Zap className="h-4 w-4" /> {adding ? "Processing…" : "Buy now"}
              </button>
              <button
                type="button"
                onClick={() => void addToCart()}
                disabled={adding}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-6 py-3.5 text-sm font-semibold text-primary shadow-soft disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4" /> {adding ? "Adding…" : "Add to cart"}
              </button>
            </div>

            {added && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
                <span>Added to your customer cart.</span>
                <a href="/cart" className="underline">
                  View cart
                </a>
              </div>
            )}
            {error && (
              <p className="mt-5 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-9 border-t border-border pt-7">
              <h2 className="font-display text-xl font-bold">Product information</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>
              <ul className="mt-6 space-y-3">
                {product.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-3 text-sm leading-relaxed text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Secure customer cart", "Your cart is stored separately for your customer account."],
            ["Order support", "Confirm current price, pack size and delivery details with RDG."],
            [
              "Product care",
              "Follow the serving and storage instructions printed on the current pack.",
            ],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-display font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
