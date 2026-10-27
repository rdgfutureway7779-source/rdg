import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Car,
  Coins,
  GraduationCap,
  HeartHandshake,
  Plane,
  Quote,
  Sparkles,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import { getPublicProducts } from "@/lib/cms";
import opportunityImage from "@/assets/opportunity-network-v2.png";
import {
  bonuses,
  events,
  getCatalogImageForCategory,
  journey,
  posts,
  products,
  stats,
  testimonials,
  trainings,
  whyChoose,
} from "@/data/site";

export function StatsBand() {
  return (
    <section className="relative -mt-10 pb-4">
      <div className="container-x">
        <div className="glass grid gap-6 rounded-3xl p-8 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-4xl font-extrabold text-gradient">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const [items, setItems] = useState(products);

  useEffect(() => {
    getPublicProducts().then((data) => {
      if (data?.length) {
        setItems(
          data.map((item) => {
            const storedPrice = Number(item.price);
            return {
              id: String(item.id),
              slug: item.slug,
              name: item.name,
              category: item.category || "RDG Product",
              subtitle: item.subtitle || "Discover the RDG product range.",
              description: item.description || "",
              highlights: item.highlights || [],
              badge: item.name === "Anmol Ratan Juice" ? "Signature Product" : "RDG Product",
              price:
                Number.isFinite(storedPrice) && storedPrice > 0
                  ? storedPrice
                  : item.name === "Anmol Ratan Juice"
                    ? 1200
                    : null,
              imageUrl: item.imageUrl || getCatalogImageForCategory(item.category),
            };
          }),
        );
      }
    });
  }, []);

  return (
    <section className="bg-surface py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Our Signature Product"
            title="One carefully presented wellness drink"
          />
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            View product details <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

const whyIcons = [BadgeCheck, Wallet, Sparkles, Coins, GraduationCap, Truck, HeartHandshake, Award];

export function WhyChoose() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why Choose RDG"
          title="Built on quality, priced for families, designed for growth"
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((item, i) => {
            const Icon = whyIcons[i % whyIcons.length]!;
            return (
              <StaggerItem key={item.title}>
                <motion.div
                  whileHover={{ y: -9, scale: 1.02 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                  className="card-lift group h-full rounded-3xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="bg-leaf flex h-12 w-12 items-center justify-center rounded-2xl text-secondary-foreground transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function OpportunitySection() {
  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-24">
      <div className="bg-brand absolute -top-48 -left-48 h-[34rem] w-[34rem] rounded-full opacity-[0.06] blur-3xl" />
      <div className="container-x relative grid items-center gap-12 lg:items-stretch lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-14">
        <Reveal className="h-full">
          <div className="relative h-full min-h-[22rem] overflow-hidden rounded-[2.25rem] border border-border/80 bg-[#edf8fb] shadow-card lg:min-h-[36rem]">
            <img
              src={opportunityImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <img
              src={opportunityImage}
              alt="Illustration of a growing direct selling distributor network"
              loading="lazy"
              width={1536}
              height={1024}
              className="relative z-10 h-full min-h-[22rem] w-full object-contain object-center lg:min-h-[36rem]"
            />
          </div>
        </Reveal>
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            Business Opportunity
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight font-bold tracking-tight text-primary-dark sm:text-4xl">
            Direct selling, without the guesswork
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            You share Anmol Ratan Juice with people who already trust you and earn when your network
            repurchases. No stock pressure, no hidden fees.
          </p>
          <div className="mt-8 space-y-4">
            {journey.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card/90 px-4 py-4 shadow-soft backdrop-blur-sm sm:px-5">
                  <span className="bg-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-primary-foreground shadow-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground">
                      {step.step}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <a
            href="/business-opportunity"
            className="bg-brand mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
          >
            Understand the plan <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function BonusGrid() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Generation Plan"
          title="Six income streams from a single business"
          description="Transparent, published payout structure with monthly cycles and no capping games."
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bonuses.map((b) => (
            <StaggerItem key={b.name}>
              <div className="card-sheen h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                <span className="bg-gold-grad inline-flex rounded-full px-3 py-1 text-[11px] font-bold text-gold-foreground">
                  {b.value}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {b.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.detail}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a
            href="/generation-plan"
            className="bg-brand inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card"
          >
            View full plan
          </a>
          <a
            href="/income-calculator"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-6 py-3 text-sm font-semibold text-primary hover:bg-accent"
          >
            Open income calculator
          </a>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-primary-dark py-24 text-primary-foreground">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
            Success Stories
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Real families. Real results.</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="rounded-3xl border border-primary-foreground/10 bg-primary-foreground/5 p-7 backdrop-blur"
            >
              <Quote className="h-7 w-7 text-gold" />
              <p className="mt-4 leading-relaxed text-primary-foreground/85">“{t.quote}”</p>
              <footer className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold">{t.name}</p>
                  <p className="text-sm text-primary-foreground/60">{t.role}</p>
                </div>
                <span className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventsAndTraining() {
  return (
    <section className="py-24">
      <div className="container-x grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading align="left" eyebrow="Events" title="Upcoming seminars & launches" />
          <div className="mt-8 space-y-4">
            {events.slice(0, 3).map((e) => (
              <Reveal key={e.title}>
                <div className="card-tilt flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="bg-brand flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-primary-foreground">
                    <span className="font-display text-lg leading-none font-bold">
                      {new Date(e.date).getDate()}
                    </span>
                    <span className="text-[10px] uppercase">
                      {new Date(e.date).toLocaleString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.type} • {e.city} • {e.seats} seats
                    </p>
                  </div>
                  <CalendarDays className="ml-auto h-5 w-5 shrink-0 text-primary" />
                </div>
              </Reveal>
            ))}
          </div>
          <a
            href="/events"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            All events <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Training Academy"
            title="Learn the business, module by module"
          />
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
            {trainings.map((t) => (
              <StaggerItem key={t.title}>
                <div className="card-glow h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  <p className="mt-3 font-display text-sm font-semibold text-foreground">
                    {t.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                  <p className="mt-3 text-[11px] font-semibold text-primary">{t.modules} modules</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export function RewardsTimeline() {
  const rewards = [
    {
      icon: Award,
      title: "Rank Achievement",
      desc: "Star to Crown, celebrated on stage every quarter.",
    },
    { icon: Car, title: "Car Fund", desc: "Monthly car fund from Platinum rank onwards." },
    {
      icon: HeartHandshake,
      title: "House Fund",
      desc: "Down-payment support for Diamond achievers.",
    },
    { icon: Plane, title: "Foreign Tour", desc: "Annual international leadership retreat." },
  ];
  return (
    <section className="bg-surface py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Rewards & Recognition"
          title="A luxury reward ladder that keeps climbing"
        />
        <div className="relative mt-16">
          <div className="bg-brand absolute top-8 right-0 left-0 hidden h-px opacity-30 lg:block" />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rewards.map((r) => (
              <StaggerItem key={r.title}>
                <div className="card-float relative rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
                  <span className="bg-gold-grad mx-auto -mt-14 flex h-16 w-16 items-center justify-center rounded-full text-gold-foreground shadow-gold">
                    <r.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export function BlogPreview() {
  return (
    <section className="py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="From the Blog"
            title="Health, business and lifestyle insights"
          />
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Read the blog <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <StaggerItem key={post.slug}>
              <a
                href="/blog"
                className="card-sheen block h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="bg-brand relative h-40 opacity-90">
                  <span className="glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold text-primary">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    • {post.read} min read
                  </p>
                  <h3 className="mt-2 font-display text-base leading-snug font-semibold text-foreground">
                    {post.title}
                  </h3>
                </div>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function CTABand() {
  return (
    <section className="pb-8">
      <div className="container-x">
        <div className="bg-brand relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center text-primary-foreground shadow-lift md:px-16">
          <div className="bg-gold-grad animate-blob absolute -top-20 -right-16 h-72 w-72 rounded-full opacity-30 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
            Start your RDG journey today — ₹599 annual distributor membership
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join 5,000+ distributors building income with a product their families can enjoy.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="/distributor/login"
              className="bg-gold-grad rounded-full px-7 py-3.5 text-sm font-semibold text-gold-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Become a Distributor
            </a>
            <a
              href="/contact"
              className="rounded-full border border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              Talk to our team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
