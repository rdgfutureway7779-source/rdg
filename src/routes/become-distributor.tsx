import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, CircleDollarSign, Network, ShoppingBag } from "lucide-react";
import { useState } from "react";
import distributorBreadcrumbImage from "@/assets/distributor-breadcrumb.png";
import { LocationMap } from "@/components/shared/LocationMap";
import { bonuses, directReferralPlans } from "@/data/site";
import { submitPublicEnquiry } from "@/lib/public-api";
import { isValidMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const title = "Become a Distributor — RDG Future Way";
const description =
  "Join RDG Future Way as a distributor with a ₹599 annual membership. Renew every year to keep your account active and access wholesale pricing, training support and the generation income plan.";

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  sponsorId?: string;
  message?: string;
};

function BecomeDistributor() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      await submitPublicEnquiry({
        type: "distributor",
        name: values.fullName,
        phone: values.phone,
        email: values.email,
        city: values.city,
        message: [values.sponsorId ? `Sponsor ID: ${values.sponsorId}` : "", values.message || ""]
          .filter(Boolean)
          .join("\n"),
      });
      setSubmitted(true);
      reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit your application.");
    }
  });

  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={distributorBreadcrumbImage}
          alt="Become a distributor with RDG Future Way"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="bg-surface py-14 sm:py-18">
        <div className="container-x">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Distributor commission structure
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Understand how the RDG plan is calculated
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              The plan has product packages plus qualification-based retail, team and leadership
              income streams. Use the exact package values below as a starting point; final
              eligibility and payout terms are confirmed by RDG.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-3">
                <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground">
                  <CircleDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Product packages
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose one package before registration
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {directReferralPlans.map((item) => (
                  <div
                    key={item.packageValue}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Package {item.packageCount}
                    </p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-secondary">
                      {money(item.packageValue)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.packageCount} × {money(3500)} package
                    </p>
                  </div>
                ))}
              </div>
              <a
                href="/income-calculator"
                className="bg-brand mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Calculate your scenario <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/distributor/login"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-3 text-sm font-semibold text-primary"
              >
                Choose package and register <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
                  <Network className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Other commission streams
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Qualification-based plan components
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {bonuses.map((bonus) => (
                  <div
                    key={bonus.name}
                    className="flex items-start justify-between gap-4 rounded-2xl bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">
                        {bonus.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {bonus.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-xs font-bold text-primary">
                      {bonus.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
            <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              These figures are plan references, not a guaranteed salary or profit. Retail margin,
              performance, matching, generation, leadership and royalty payouts depend on product
              sales, active IDs, qualification and the official RDG terms.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              RDG location
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              Connect with the distributor support team
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Submit your details above and use the verified RDG location below as a reference for
              your onboarding and distributor support conversation.
            </p>
          </div>
          <LocationMap />
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {[
              "₹599 annual distributor membership; renews every year",
              "Distributor support for Anmol Ratan Juice",
              "Monthly bonus payouts by the 10th",
              "Free access to the RDG Training Academy",
              "Dedicated support in 7 Indian languages",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl bg-surface p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm text-foreground">{point}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-card p-8 shadow-card"
          >
            {submitted && (
              <p className="mb-6 rounded-2xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
                Thank you! Your application has been received. Our team will contact you shortly.
              </p>
            )}
            {error && (
              <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input
                  {...register("fullName", { required: "Name is required" })}
                  className="field"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Mobile number" error={errors.phone?.message}>
                <input
                  {...register("phone", {
                    required: "Mobile number is required",
                    validate: (value) => isValidMobileNumber(value) || MOBILE_NUMBER_ERROR,
                  })}
                  type="tel"
                  inputMode="numeric"
                  maxLength={16}
                  className="field"
                  placeholder="+91 …"
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="field"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input
                  {...register("city", { required: "City is required" })}
                  className="field"
                  placeholder="City"
                />
              </Field>
              <Field label="Sponsor ID (optional)">
                <input {...register("sponsorId")} className="field" placeholder="RDG123456" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Message (optional)">
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="field"
                    placeholder="Tell us about your goals"
                  />
                </Field>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand mt-8 w-full rounded-full py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export default BecomeDistributor;
