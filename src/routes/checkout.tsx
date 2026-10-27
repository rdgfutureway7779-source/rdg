import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createCustomerPaymentOrder,
  createCustomerOrder,
  getCustomerCart,
  getCustomerMe,
  getCustomerCartLineTotal,
  verifyCustomerPayment,
  type Customer,
  type CustomerCartItem,
} from "@/lib/customer-api";
import { isValidMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";
import { loadRazorpayCheckout, type RazorpayCheckoutResponse } from "@/lib/razorpay";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function Checkout() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<CustomerCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cash_on_delivery">("razorpay");
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "India",
    customerNote: "",
  });

  useEffect(() => {
    getCustomerMe().then((profile) => {
      if (!profile) {
        setLoading(false);
        return;
      }
      setCustomer(profile);
      setForm((current) => ({
        ...current,
        shippingName: profile.name,
        shippingPhone: profile.phone || "",
      }));
      getCustomerCart()
        .then(setItems)
        .catch((reason) =>
          setError(reason instanceof Error ? reason.message : "Unable to load cart."),
        )
        .finally(() => setLoading(false));
    });
  }, []);

  const hasPrices =
    items.length > 0 && items.every((item) => item.price !== null && item.price !== undefined);
  const subtotal = useMemo(
    () => (hasPrices ? items.reduce((sum, item) => sum + getCustomerCartLineTotal(item), 0) : null),
    [hasPrices, items],
  );
  const shippingFee = subtotal === null ? null : subtotal >= 999 ? 0 : 99;
  const total = subtotal === null || shippingFee === null ? null : subtotal + shippingFee;

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isValidMobileNumber(form.shippingPhone)) {
      setError(MOBILE_NUMBER_ERROR);
      return;
    }
    setSubmitting(true);
    let paymentDialogOpened = false;
    try {
      if (paymentMethod === "cash_on_delivery") {
        const order = await createCustomerOrder({ ...form, paymentMethod });
        window.location.href = `/account/orders?placed=${encodeURIComponent(order.orderNumber)}`;
        return;
      }

      const paymentOrder = await createCustomerPaymentOrder();
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "RDG Future Way Pvt. Ltd.",
        description: "Anmol Ratan Juice order",
        order_id: paymentOrder.orderId,
        prefill: {
          name: form.shippingName,
          email: customer?.email || "",
          contact: form.shippingPhone,
        },
        notes: { customer_id: String(customer?.id || "") },
        theme: { color: "#0b6b4b" },
        handler: (response) => {
          void completeOnlinePayment(response);
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      checkout.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setSubmitting(false);
      });
      checkout.open();
      paymentDialogOpened = true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to place your order.");
    } finally {
      if (!paymentDialogOpened) setSubmitting(false);
    }
  }

  async function completeOnlinePayment(response: RazorpayCheckoutResponse) {
    try {
      const order = await verifyCustomerPayment({
        ...form,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      window.location.href = `/account/orders?placed=${encodeURIComponent(order.orderNumber)}`;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to verify your payment.");
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="container-x py-32 text-center text-muted-foreground">Loading checkout…</div>
    );

  if (!customer) {
    return (
      <section className="bg-surface py-24">
        <div className="container-x max-w-xl rounded-[2rem] border border-border bg-card p-10 text-center shadow-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl font-bold">Login before checkout</h1>
          <p className="mt-3 text-muted-foreground">
            Your cart and shipping details are protected inside your customer account.
          </p>
          <a
            href="/customer/login?redirect=/checkout"
            className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Customer login <CheckCircle2 className="h-4 w-4" />
          </a>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-surface py-24">
        <div className="container-x max-w-xl rounded-[2rem] border border-border bg-card p-10 text-center shadow-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl font-bold">Your cart is empty</h1>
          <a
            href="/products"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Browse products <ArrowLeft className="h-4 w-4 rotate-180" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-x">
        <a
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </a>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <form
            onSubmit={submit}
            className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-9"
          >
            <div className="flex items-center gap-3">
              <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  Secure checkout
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold">Shipping details</h1>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Delivering to {customer.email}. We will confirm your order by phone.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.shippingName}
                onChange={(value) => update("shippingName", value)}
                required
              />
              <Field
                label="Mobile number"
                value={form.shippingPhone}
                onChange={(value) => update("shippingPhone", value)}
                required
              />
              <div className="sm:col-span-2">
                <Field
                  label="Address line 1"
                  value={form.shippingAddressLine1}
                  onChange={(value) => update("shippingAddressLine1", value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Address line 2 (optional)"
                  value={form.shippingAddressLine2}
                  onChange={(value) => update("shippingAddressLine2", value)}
                />
              </div>
              <Field
                label="City"
                value={form.shippingCity}
                onChange={(value) => update("shippingCity", value)}
                required
              />
              <Field
                label="State"
                value={form.shippingState}
                onChange={(value) => update("shippingState", value)}
                required
              />
              <Field
                label="PIN code"
                value={form.shippingPostalCode}
                onChange={(value) => update("shippingPostalCode", value)}
                required
              />
              <Field
                label="Country"
                value={form.shippingCountry}
                onChange={(value) => update("shippingCountry", value)}
                required
              />
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Order note (optional)
                  </span>
                  <textarea
                    value={form.customerNote}
                    onChange={(event) => update("customerNote", event.target.value)}
                    rows={3}
                    className="field"
                    placeholder="Landmark or delivery instruction"
                  />
                </label>
              </div>
            </div>
            <div className="mt-7 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">Payment method</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <CreditCard className="h-4 w-4 text-primary" /> Pay online
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      UPI, cards, netbanking and wallets via Razorpay.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={() => setPaymentMethod("cash_on_delivery")}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-foreground">Cash on delivery</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      The RDG team will confirm your order by phone.
                    </span>
                  </span>
                </label>
              </div>
            </div>
            {error && (
              <p className="mt-5 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !hasPrices}
              className="bg-brand mt-7 w-full rounded-full py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {submitting
                ? paymentMethod === "razorpay"
                  ? "Opening Razorpay…"
                  : "Placing order…"
                : hasPrices
                  ? paymentMethod === "razorpay"
                    ? "Pay securely"
                    : "Place order"
                  : "Price unavailable"}
            </button>
          </form>

          <aside className="h-fit rounded-[2rem] border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {item.price === null || item.price === undefined
                      ? "Price on request"
                      : money(getCustomerCartLineTotal(item))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Subtotal</span>
                <span>{subtotal === null ? "Price on request" : money(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {shippingFee === null
                    ? "Calculated after price"
                    : shippingFee
                      ? money(shippingFee)
                      : "Free"}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-lg font-bold">
                <span>Total</span>
                <span>{total === null ? "Price on request" : money(total)}</span>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Free shipping on orders of ₹999 and above. Cash on delivery order will be confirmed by
              the RDG team.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
        type={label === "Mobile number" ? "tel" : "text"}
        inputMode={label === "Mobile number" ? "numeric" : undefined}
        maxLength={label === "Mobile number" ? 16 : undefined}
        required={required}
      />
    </label>
  );
}

export default Checkout;
