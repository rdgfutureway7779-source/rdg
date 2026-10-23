import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { directReferralPlans } from "@/data/site";
import { loginDistributor, registerDistributor } from "@/lib/distributor-api";
import { isValidMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function DistributorAuth() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [sponsorFromInvite] = useState(
    () => new URLSearchParams(window.location.search).get("sponsor")?.trim() || "",
  );
  const [sponsorCode, setSponsorCode] = useState(sponsorFromInvite);
  const [packageValue, setPackageValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!isValidMobileNumber(phone)) {
          setError(MOBILE_NUMBER_ERROR);
          setLoading(false);
          return;
        }
        const distributor = await registerDistributor({
          name,
          username,
          email,
          phone,
          city,
          sponsorCode,
          packageValue: Number(packageValue),
          password,
        });
        setMode("login");
        setPassword("");
        setNotice(
          `Package purchase request submitted for ${money(Number(packageValue))}. Your account will become active after RDG confirms the payment. Distributor ID: ${distributor.distributorCode}.`,
        );
      } else {
        await loginDistributor(username, password);
        window.location.href = "/distributor/dashboard";
      }
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
                RDG distributor access
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold">
                Build your RDG journey with one secure account.
              </h1>
              <p className="mt-5 leading-relaxed text-primary-foreground/75">
                Select and purchase an RDG product package first. Your distributor access activates
                after payment confirmation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/75">
              <LockKeyhole className="h-4 w-4 text-gold" /> Secure distributor access
            </div>
          </div>
        </div>

        <div key={mode} className="p-7 sm:p-12">
          <div className="flex gap-2 rounded-full bg-surface p-1">
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Login
            </button>
          </div>

          <p className="mt-8 text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Distributor account
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {mode === "register"
              ? "Register once to receive your distributor ID and secure login access."
              : "Login with the username and password you created."}
          </p>
          <p className="mt-3 hidden rounded-2xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            Annual distributor membership: ₹599 per year, renewed every year. Product packages are A
            A product package purchase is required before distributor access is activated.
          </p>

          <p className="mt-3 rounded-2xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            Annual membership is ₹599 per year. A product package purchase is required before
            distributor access is activated.
          </p>

          <form onSubmit={submit} className="mt-7 grid gap-4">
            {mode === "register" && (
              <>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field"
                  placeholder="Full name"
                  required
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="field"
                  placeholder="Email address"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    className="field"
                    placeholder="Mobile number"
                    minLength={10}
                    required
                  />
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="field"
                    placeholder="City"
                    required
                  />
                </div>
                <input
                  value={sponsorCode}
                  onChange={(event) => setSponsorCode(event.target.value)}
                  className="field"
                  placeholder="Parent Sponsor ID (required for a team placement)"
                  readOnly={Boolean(sponsorFromInvite)}
                />
                <p className="-mt-2 text-xs text-muted-foreground">
                  Enter the distributor ID whose team you want to join. Leave blank only when
                  creating a top-level distributor. An invite link fills this automatically.
                </p>
                <label className="block text-sm font-semibold text-foreground">
                  Choose product package
                  <select
                    value={packageValue}
                    onChange={(event) => setPackageValue(event.target.value)}
                    className="field"
                    required
                  >
                    <option value="" disabled>
                      Select one package (required)
                    </option>
                    {directReferralPlans.map((item) => (
                      <option key={item.packageValue} value={item.packageValue}>
                        Package {item.packageCount} — {money(item.packageValue)}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Your account remains pending until this package payment is confirmed by RDG.
                  </span>
                </label>
              </>
            )}
            <label className="block text-sm font-semibold text-foreground">
              Username (not email)
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
                name="distributor-username"
                className="field"
                placeholder="Choose a username"
                autoComplete={mode === "register" ? "new-password" : "username"}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              {mode === "register" && (
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  Use 4–80 letters, numbers, dot, underscore or hyphen. Keep email in the email
                  field above.
                </span>
              )}
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="field"
              placeholder="Password (8+ characters)"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
            {notice && (
              <p className="rounded-2xl bg-secondary/10 px-4 py-3 text-sm text-secondary">
                {notice}
              </p>
            )}
            {error && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-brand mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Please wait…" : mode === "register" ? "Create account" : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <a
            href="/become-distributor"
            className="mt-7 inline-flex text-sm font-semibold text-primary"
          >
            Back to distributor information
          </a>
        </div>
      </div>
    </section>
  );
}

export default DistributorAuth;
