import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { SectionHeading } from "@/components/layout/PageHeader";
import franchiseBreadcrumbImage from "@/assets/franchise-breadcrumb.png";
import { LocationMap } from "@/components/shared/LocationMap";
import { submitPublicEnquiry } from "@/lib/public-api";
import { isValidMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";

type FranchiseForm = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  businessType: string;
  investment: string;
  message?: string;
};

const benefits = [
  {
    icon: Store,
    title: "A focused product model",
    desc: "Build around Anmol Ratan Juice and a clear, easy-to-explain wellness proposition.",
  },
  {
    icon: Users,
    title: "Launch and training support",
    desc: "Get practical guidance for local outreach, product education and team development.",
  },
  {
    icon: ShieldCheck,
    title: "A brand customers can trust",
    desc: "Present a professional RDG identity backed by quality-focused product communication.",
  },
  {
    icon: Wallet,
    title: "A growth-ready format",
    desc: "Discuss the right operating model, territory and commercial terms for your location.",
  },
];

const steps = [
  {
    number: "01",
    title: "Share your details",
    desc: "Tell us about your city, experience and business goals.",
  },
  {
    number: "02",
    title: "Talk with our team",
    desc: "A regional representative will explain availability and requirements.",
  },
  {
    number: "03",
    title: "Plan your launch",
    desc: "Finalize the format, territory, support plan and next steps.",
  },
  {
    number: "04",
    title: "Open and grow",
    desc: "Launch with ongoing product, training and business support.",
  },
];

function Franchise() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FranchiseForm>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      await submitPublicEnquiry({
        type: "franchise",
        name: values.fullName,
        phone: values.phone,
        email: values.email,
        city: values.city,
        businessType: values.businessType,
        investmentRange: values.investment,
        message: values.message,
      });
      setSent(true);
      reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit your enquiry.");
    }
  });

  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={franchiseBreadcrumbImage}
          alt="Franchise opportunity with RDG Future Way"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-brand relative h-full overflow-hidden rounded-[2rem] p-8 text-primary-foreground shadow-lift sm:p-10"
          >
            <div className="bg-gold-grad absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary-foreground/70 uppercase">
                Why franchise with RDG?
              </p>
              <h2 className="mt-4 max-w-md font-display text-3xl leading-tight font-bold">
                A simple conversation can become your next growth chapter.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-primary-foreground/80">
                We help you understand the opportunity before you commit—location, operating model,
                support and commercial terms included.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Clear next steps",
                  "Local market guidance",
                  "Product-led business",
                  "Ongoing support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-gold" /> {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-3 border-t border-primary-foreground/15 pt-5 text-sm text-primary-foreground/75">
                <MapPin className="h-4 w-4 text-gold" />
                Currently serving growing markets across India
              </div>
            </div>
          </motion.div>

          <div id="franchise-enquiry" className="scroll-mt-28">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                Start here
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Request franchise details
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Share a few details and your email app will prepare an enquiry for the RDG team.
              </p>
            </div>
            <form
              onSubmit={onSubmit}
              className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
            >
              {sent && (
                <p className="mb-6 rounded-2xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
                  Your enquiry draft is ready. Please send it from your email app so our team can
                  respond.
                </p>
              )}
              {error && (
                <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Full name" error={errors.fullName?.message}>
                  <input
                    {...register("fullName", { required: "Name is required" })}
                    className="field"
                    placeholder="Your name"
                  />
                </FormField>
                <FormField label="Mobile number" error={errors.phone?.message}>
                  <input
                    {...register("phone", {
                      required: "Mobile number is required",
                      validate: (value) => isValidMobileNumber(value) || MOBILE_NUMBER_ERROR,
                    })}
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    className="field"
                    placeholder="+91 ..."
                  />
                </FormField>
                <FormField label="Email" error={errors.email?.message}>
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    className="field"
                    placeholder="you@example.com"
                  />
                </FormField>
                <FormField label="City / district" error={errors.city?.message}>
                  <input
                    {...register("city", { required: "City is required" })}
                    className="field"
                    placeholder="Where will you operate?"
                  />
                </FormField>
                <FormField label="Business background">
                  <select {...register("businessType")} className="field">
                    <option value="First business">First business</option>
                    <option value="Retail or distribution">Retail or distribution</option>
                    <option value="Wellness or FMCG">Wellness or FMCG</option>
                    <option value="Existing entrepreneur">Existing entrepreneur</option>
                  </select>
                </FormField>
                <FormField label="Investment range">
                  <select {...register("investment")} className="field">
                    <option value="To be discussed">To be discussed</option>
                    <option value="Below ₹5 lakh">Below ₹5 lakh</option>
                    <option value="₹5–10 lakh">₹5–10 lakh</option>
                    <option value="₹10 lakh+">₹10 lakh+</option>
                  </select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Message (optional)">
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="field"
                      placeholder="Tell us about your plans"
                    />
                  </FormField>
                </div>
              </div>
              <button
                type="submit"
                className="bg-brand mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
              >
                Send franchise enquiry <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Franchise availability, terms and investment are confirmed after a discussion with
                the RDG team.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="RDG location"
              title="Plan your local opportunity with the right team"
              description="Use the verified RDG location below when planning your franchise conversation, territory and support requirements."
            />
          </div>
          <LocationMap />
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="The RDG advantage"
            title="Support that helps you move from interest to launch"
            description="Every market is different. Our team helps you understand the right path for yours."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.07 }}
                className="card-glow rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="bg-gold-grad flex h-12 w-12 items-center justify-center rounded-2xl text-gold-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="How it works"
            title="Four clear steps to explore your franchise"
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-4">
            {steps.map(({ number, title, desc }, index) => (
              <div
                key={number}
                className="card-tilt relative rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold text-primary-foreground">
                  {number}
                </span>
                {index < steps.length - 1 && (
                  <span className="bg-primary/15 absolute top-11 -right-3 hidden h-px w-6 md:block" />
                )}
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              This page is an enquiry pathway, not a promise of income. Final franchise
              availability, territory, pricing, support and eligibility are subject to written RDG
              terms.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
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

export default Franchise;
