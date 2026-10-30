import { ArrowRight, PackageCheck, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";
import {
  changeCustomerPassword,
  getCustomerMe,
  getCustomerOrder,
  getCustomerOrders,
  logoutCustomer,
  type Customer,
  type CustomerOrder,
  type CustomerOrderSummary,
} from "@/lib/customer-api";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function CustomerOrders() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [selected, setSelected] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const placed = new URLSearchParams(window.location.search).get("placed");

  useEffect(() => {
    getCustomerMe().then((profile) => {
      if (!profile) {
        setLoading(false);
        return;
      }
      setCustomer(profile);
      getCustomerOrders()
        .then(setOrders)
        .catch((reason) =>
          setError(reason instanceof Error ? reason.message : "Unable to load orders."),
        )
        .finally(() => setLoading(false));
    });
  }, []);

  async function showDetails(order: CustomerOrderSummary) {
    try {
      setError("");
      setSelected(await getCustomerOrder(order.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load order details.");
    }
  }

  async function signOut() {
    await logoutCustomer();
    window.location.href = "/customer/login";
  }

  if (loading)
    return (
      <div className="container-x py-32 text-center text-muted-foreground">Loading orders…</div>
    );

  if (!customer) {
    return (
      <section className="bg-surface py-24">
        <div className="container-x max-w-xl rounded-[2rem] border border-border bg-card p-10 text-center shadow-card">
          <PackageCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl font-bold">Login to view your orders</h1>
          <a
            href="/customer/login?redirect=/account/orders"
            className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Customer login <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Customer account
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold">Welcome, {customer.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your orders and delivery details in one place.
            </p>
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <a href="/products" className="text-primary">
              Shop products
            </a>
            <button type="button" onClick={() => void signOut()} className="text-primary">
              Sign out
            </button>
          </div>
        </div>
        {placed && (
          <p className="mt-7 rounded-2xl bg-secondary/10 px-5 py-4 text-sm font-semibold text-secondary">
            Order {placed} placed successfully. RDG will contact you to confirm delivery.
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-8">
          <ChangePasswordForm onSubmit={changeCustomerPassword} />
        </div>
        {!orders.length ? (
          <div className="mt-10 rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft">
            <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold">No orders yet</h2>
            <a
              href="/products"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                        {order.orderNumber}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.itemCount}{" "}
                        item{order.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Status status={order.status} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivering to</p>
                      <p className="mt-1 text-sm font-semibold">
                        {order.shippingCity}, {order.shippingState}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="mt-1 text-lg font-bold text-primary">{money(order.total)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void showDetails(order)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary"
                    >
                      View details <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {selected ? (
              <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">{selected.orderNumber}</h2>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-sm text-muted-foreground"
                  >
                    Close
                  </button>
                </div>
                <Status status={selected.status} />
                <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                  {selected.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.productName}`}
                      className="flex justify-between gap-3"
                    >
                      <span className="text-muted-foreground">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-semibold">{money(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(selected.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{selected.shippingFee ? money(selected.shippingFee) : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{money(selected.total)}</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-surface p-4 text-sm leading-relaxed">
                  <p className="font-semibold">Shipping address</p>
                  <p className="mt-2 text-muted-foreground">
                    {selected.shippingName}
                    <br />
                    {selected.shippingAddressLine1}
                    <br />
                    {selected.shippingAddressLine2 && (
                      <>
                        {selected.shippingAddressLine2}
                        <br />
                      </>
                    )}
                    {selected.shippingCity}, {selected.shippingState} {selected.shippingPostalCode}
                    <br />
                    {selected.shippingPhone}
                  </p>
                </div>
              </aside>
            ) : (
              <aside className="h-fit rounded-3xl border border-primary/15 bg-primary/5 p-6 text-sm leading-relaxed text-muted-foreground">
                <Truck className="h-6 w-6 text-primary" />
                <p className="mt-4 font-semibold text-foreground">Order tracking</p>
                <p className="mt-2">
                  Your order starts as pending, then moves through confirmation, processing,
                  shipping and delivery.
                </p>
              </aside>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Status({ status }: { status: string }) {
  const cancelled = status === "cancelled";
  const Icon = cancelled
    ? XCircle
    : status === "shipped" || status === "delivered"
      ? Truck
      : PackageCheck;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${cancelled ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}
    >
      <Icon className="h-3.5 w-3.5" /> {status}
    </span>
  );
}

export default CustomerOrders;
