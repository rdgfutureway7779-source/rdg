import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Info,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/shared/ProductCard";
import { catalogDemoProducts, getCatalogImageForCategory, products } from "@/data/site";
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
  const [pincode, setPincode] = useState("834001");
  const [deliveryMessage, setDeliveryMessage] = useState("");
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
            product.name === "Anmol Ratan Juice"
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
                imageUrl: mapped.imageUrl || getCatalogImageForCategory(mapped.category),
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
                  imageUrl: getCatalogImageForCategory(fallback.category),
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
  const dpPrice = product?.dpPrice == null ? null : Number(product.dpPrice);
  const isOutOfStock =
    product?.stockQuantity !== null &&
    product?.stockQuantity !== undefined &&
    Number(product.stockQuantity) <= 0;
  const isUnavailable = Boolean(product && (product.isServiceable === false || isOutOfStock));
  const productCode = `RDG-${String(product?.id || "PRODUCT").toUpperCase()}`;

  function checkDelivery() {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage("Enter a valid 6-digit pincode.");
      return;
    }
    setDeliveryMessage(`Delivery availability checked for ${pincode}.`);
  }

  async function addToCart(buyNow = false) {
    if (!product || typeof product.id !== "number") {
      setError("This product is not available for online ordering yet.");
      return;
    }
    if (isUnavailable) {
      setError(
        isOutOfStock
          ? "This product is currently out of stock."
          : "This product is not serviceable to your area.",
      );
      return;
    }
    try {
      setAdding(true);
      setError("");
      const items = cartItemExists
        ? await updateCustomerCart(product.id, cartQuantity)
        : await addToCustomerCart(product.id, cartQuantity);
      const saved = items.find((item) => Number(item.productId) === Number(product.id));
      const savedQuantity = saved?.quantity ?? cartQuantity;
      const savedDisplayQuantity = isPackageProduct
        ? Math.max(1, Math.round(savedQuantity / selectedPackage.units))
        : savedQuantity;
      cartItemExistsRef.current = Boolean(saved);
      setCartItemExists(Boolean(saved));
      quantityRef.current = savedDisplayQuantity;
      setQuantity(savedDisplayQuantity);
      broadcastCustomerCartChange(product.id, savedQuantity);
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
      void changeQuantity(action === "increase" ? 1 : -1);
    }

    document.addEventListener("click", handleQuantityAction, true);
    return () => document.removeEventListener("click", handleQuantityAction, true);
  }, [changeQuantity]);

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
            : product.name === "Anmol Ratan Juice"
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
    <section className="bg-[#fafbf7] py-8 sm:py-12">
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <a href="/products" className="font-semibold text-primary hover:underline">
            Products
          </a>
          <span>/</span>
          <span>{product.category || "RDG product"}</span>
          <span>/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(26rem,0.98fr)] lg:items-start">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-soft sm:p-5">
            <div className="overflow-hidden rounded-xl border border-border bg-[#f4f8ec]">
              <ProductVisual imageUrl={product.imageUrl} productName={product.name} />
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                className="h-20 w-20 overflow-hidden rounded-xl border-2 border-primary bg-[#f4f8ec] p-1"
                aria-label={`Preview ${product.name}`}
              >
                <ProductVisual compact imageUrl={product.imageUrl} productName={product.name} />
              </button>
              <div className="flex items-center text-xs text-muted-foreground">
                Product image shown for illustration. Check the current pack for final details.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
                  {product.category || "RDG wellness product"}
                </p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  {product.badge || "RDG Product"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(window.location.href)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.subtitle}
            </p>

            <div className="mt-6 border-y border-border py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">MRP</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{money(unitPrice)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">DP Price</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{money(dpPrice)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-secondary">Inclusive of all taxes</p>
              <p
                className={`mt-3 text-xs font-semibold ${isUnavailable ? "text-destructive" : "text-secondary"}`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : product.isServiceable === false
                    ? "Not serviceable"
                    : product.stockQuantity == null
                      ? "Availability confirmed at checkout"
                      : `${product.stockQuantity} in stock`}
              </p>
              {isPackageProduct && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-[#fafbf7] px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Selected package total</span>
                  <span className="font-bold text-primary">{money(packageTotal)}</span>
                </div>
              )}
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <span>
                  <strong className="font-semibold text-foreground">SAP Code:</strong> {productCode}
                </span>
                <span>
                  <strong className="font-semibold text-foreground">Net content:</strong>{" "}
                  {isPackageProduct ? `${selectedPackage.units} bottles` : "1 unit"}
                </span>
              </div>
            </div>

            {isPackageProduct && (
              <div className="mt-6 rounded-xl border border-primary/15 bg-[#f5faee] p-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-foreground">
                    Choose pack size
                  </span>
                  <select
                    value={selectedPackageId}
                    onChange={(event) => setSelectedPackageId(event.target.value)}
                    className="field bg-white"
                  >
                    {productPackages.map((packageOption) => (
                      <option key={packageOption.id} value={packageOption.id}>
                        {packageOption.label} — {money(packageOption.price)} ({packageOption.units}{" "}
                        bottles)
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <PackageCheck className="h-4 w-4 text-secondary" /> {selectedPackage.units}{" "}
                    bottles in this package
                  </span>
                  <span className="font-bold text-primary">{money(packageTotal)}</span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-foreground">Quantity</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-border bg-white">
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
                  disabled={adding || isUnavailable}
                  className="bg-brand inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-60 sm:flex-none"
                >
                  <Zap className="h-4 w-4" /> {adding ? "Processing…" : "Buy now"}
                </button>
                <button
                  type="button"
                  onClick={() => void addToCart()}
                  disabled={adding || isUnavailable}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-soft disabled:opacity-60 sm:flex-none"
                >
                  <ShoppingCart className="h-4 w-4" /> {adding ? "Adding…" : "Add to cart"}
                </button>
              </div>
            </div>

            {added && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
                <span>Added to your customer cart.</span>
                <a href="/cart" className="underline">
                  View cart
                </a>
              </div>
            )}
            {error && (
              <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-7 rounded-xl border border-border bg-[#fafbf7] p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Deliver to</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={pincode}
                      onChange={(event) =>
                        setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      aria-label="Delivery pincode"
                      className="field bg-white py-2.5"
                    />
                    <button
                      type="button"
                      onClick={checkDelivery}
                      className="rounded-lg border border-primary/25 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                      Check
                    </button>
                  </div>
                  {deliveryMessage && (
                    <p className="mt-2 text-xs text-secondary">{deliveryMessage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white shadow-soft">
          <details open className="group border-b border-border p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
              About this item
              <ChevronDown className="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </details>
          <details open className="group border-b border-border p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
              Key features
              <ChevronDown className="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  {highlight}
                </li>
              ))}
            </ul>
          </details>
          <details className="group p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
              Additional information
              <ChevronDown className="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <p className="flex gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary" /> Current pack details apply.
              </p>
              <p className="flex gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary" /> Prices are shown in Indian
                rupees.
              </p>
              <p className="flex gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary" /> Follow the label for storage and
                use.
              </p>
            </div>
          </details>
        </div>

        <a
          href="/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all products
        </a>
      </div>
    </section>
  );
}

export default ProductDetail;
