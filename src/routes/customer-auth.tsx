import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { loginCustomer, registerCustomer } from "@/lib/customer-api";
import { isOptionalMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";

function CustomerAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function redirectAfterAuth() {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    window.location.href = redirect?.startsWith("/") ? redirect : "/cart";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!isOptionalMobileNumber(phone)) {
          setError(MOBILE_NUMBER_ERROR);
          setLoading(false);
          return;
        }
        await registerCustomer({ name, email, phone, password });
      } else {
        await loginCustomer(email, password);
      }
      redirectAfterAuth();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-surface px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-brand relative hidden overflow-hidden p-10 text-primary-foreground lg:block">
          <div className="bg-gold-grad absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">
                RDG customer account
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold">
                Shop with your own saved cart.
              </h1>
              <p className="mt-5 leading-relaxed text-primary-foreground/75">
                Create a customer login so your products and quantities stay separate from every
                other customer.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/75">
              <LockKeyhole className="h-4 w-4 text-gold" /> Secure account access
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-12">
          <div className="flex gap-2 rounded-full bg-surface p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                }}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  mode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-8 text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Customer access
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {mode === "login"
              ? "Login to view your personal cart."
              : "Register once to save products to your own cart."}
          </p>
          <form onSubmit={submit} className="mt-7 grid gap-4">
            {mode === "register" && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field"
                placeholder="Full name"
                required
              />
            )}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="field"
              placeholder="Email address"
              required
            />
            {mode === "register" && (
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                inputMode="numeric"
                maxLength={16}
                className="field"
                placeholder="Mobile number (optional)"
              />
            )}
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (8+ characters)"
              minLength={8}
              required
            />
            {error && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="bg-brand mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <UserRound className="h-4 w-4" />{" "}
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Login to shop"
                  : "Create customer account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <a href="/products" className="mt-7 inline-flex text-sm font-semibold text-primary">
            Continue browsing products
          </a>
        </div>
      </div>
    </section>
  );
}

export default CustomerAuth;
