import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import bottleImage from "@/assets/anmol-ratan-juice-bottle.png";
import {
  getCustomerCart,
  getCustomerMe,
  broadcastCustomerCartChange,
  customerCartSyncKey,
  logoutCustomer,
  removeFromCustomerCart,
  updateCustomerCart,
  type Customer,
  type CustomerCartItem,
} from "@/lib/customer-api";

function CartProductImage({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  const [src, setSrc] = useState(
    imageUrl && !imageUrl.startsWith("/src/") ? imageUrl : bottleImage,
  );

  return (
    <img
      src={src}
      alt={name}
      onError={() => setSrc(bottleImage)}
      className="h-full w-full object-contain p-3"
    />
  );
}

function Cart() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<CustomerCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomerMe().then((profile) => {
      if (!profile) {
        setLoading(false);
        return;
      }
      setCustomer(profile);
      getCustomerCart()
        .then(setItems)
        .catch((reason) =>
          setError(reason instanceof Error ? reason.message : "Unable to load cart."),
        )
        .finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    function syncFromAnotherTab(event: StorageEvent) {
      if (event.key !== customerCartSyncKey || !event.newValue) return;
      try {
        const change = JSON.parse(event.newValue) as {
          productId?: number;
          quantity?: number | null;
        };
        if (!change.productId) return;
        setItems((current) => {
          if (change.quantity === null) {
            return current.filter((item) => item.productId !== change.productId);
          }
          return current.map((item) =>
            item.productId === change.productId
              ? { ...item, quantity: change.quantity || item.quantity }
              : item,
          );
        });
      } catch {
        // Ignore malformed cross-tab events.
      }
    }

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  async function changeQuantity(item: CustomerCartItem, quantity: number) {
    try {
      setItems(await updateCustomerCart(item.productId, quantity));
      broadcastCustomerCartChange(item.productId, quantity);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update cart.");
    }
  }

  async function remove(item: CustomerCartItem) {
    try {
      setItems(await removeFromCustomerCart(item.productId));
      broadcastCustomerCartChange(item.productId, null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove cart item.");
    }
  }

  async function signOut() {
    await logoutCustomer();
    window.location.href = "/customer/login";
  }

  if (loading)
    return (
      <div className="container-x py-32 text-center text-muted-foreground">Loading your cart…</div>
    );

  if (!customer) {
    return (
      <section className="bg-surface px-4 py-24">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-card sm:p-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl font-bold">Login to see your cart</h1>
          <p className="mt-3 text-muted-foreground">Each customer has a separate saved cart.</p>
          <a
            href="/customer/login"
            className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Customer login <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    );
  }

  const hasPrices = items.every((item) => item.price !== null && item.price !== undefined);
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Customer cart
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold">Hello, {customer.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Only products saved to your account appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-sm font-semibold text-primary"
          >
            Sign out
          </button>
        </div>
        {error && (
          <p className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {!items.length ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h2>
            <a
              href="/products"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Browse products <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center"
                >
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface">
                    <CartProductImage imageUrl={item.imageUrl} name={item.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                      {item.category}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold">{item.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                    <p className="mt-3 text-sm font-semibold text-primary">
                      {item.price
                        ? `₹${Number(item.price).toLocaleString("en-IN")}`
                        : "Price on request"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => void changeQuantity(item, Math.max(1, item.quantity - 1))}
                        className="p-2.5 text-primary"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void changeQuantity(item, Math.min(99, item.quantity + 1))}
                        className="p-2.5 text-primary"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      className="rounded-full p-2.5 text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-bold">Order summary</h2>
              <div className="mt-5 flex justify-between gap-4 text-sm text-muted-foreground">
                <span>Items</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="mt-4 flex justify-between gap-4 border-t border-border pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{hasPrices ? `₹${total.toLocaleString("en-IN")}` : "Price on request"}</span>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Secure checkout includes shipping details, cash on delivery and order tracking.
              </p>
              <a
                href="/checkout"
                className="bg-brand mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-card"
              >
                Continue to checkout <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
