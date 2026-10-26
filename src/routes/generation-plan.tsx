import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Crown,
  HandCoins,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import generationPlanBreadcrumbImage from "@/assets/generation-plan-breadcrumb.png";
import rankPlanImage from "@/assets/ai-rank-plan.png";
import rankSymbol01 from "@/assets/rank-symbols/level-01.png";
import rankSymbol02 from "@/assets/rank-symbols/level-02.png";
import rankSymbol03 from "@/assets/rank-symbols/level-03.png";
import rankSymbol04 from "@/assets/rank-symbols/level-04.png";
import rankSymbol05 from "@/assets/rank-symbols/level-05.png";
import rankSymbol06 from "@/assets/rank-symbols/level-06.png";
import rankSymbol07 from "@/assets/rank-symbols/level-07.png";
import rankSymbol08 from "@/assets/rank-symbols/level-08.png";
import rankSymbol09 from "@/assets/rank-symbols/level-09.png";
import rankSymbol10 from "@/assets/rank-symbols/level-10.png";
import rankSymbol11 from "@/assets/rank-symbols/level-11.png";
import rankSymbol12 from "@/assets/rank-symbols/level-12.png";
import rankSymbol13 from "@/assets/rank-symbols/level-13.png";
import rankSymbol14 from "@/assets/rank-symbols/level-14.png";
import rankSymbol15 from "@/assets/rank-symbols/level-15.png";
import { bonuses, directReferralPlans, planLevels } from "@/data/site";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const rankNames = [
  "Distributor",
  "Senior Distributor",
  "Star Associate",
  "Bronze Leader",
  "Silver Leader",
  "Gold Leader",
  "Platinum Leader",
  "Diamond Leader",
  "Double Diamond",
  "Triple Diamond",
  "Crown Diamond",
  "Ruby Crown",
  "Emerald Crown",
  "Sapphire Crown",
  "Royal Diamond Ambassador",
];

const rankThemes = [
  "border-sky-200 bg-sky-50 text-sky-950",
  "border-emerald-200 bg-emerald-50 text-emerald-950",
  "border-rose-200 bg-rose-50 text-rose-950",
  "border-amber-200 bg-amber-50 text-amber-950",
  "border-slate-300 bg-slate-100 text-slate-950",
  "border-yellow-300 bg-yellow-50 text-yellow-950",
  "border-cyan-200 bg-cyan-50 text-cyan-950",
  "border-blue-200 bg-blue-50 text-blue-950",
  "border-violet-200 bg-violet-50 text-violet-950",
  "border-teal-200 bg-teal-50 text-teal-950",
  "border-purple-200 bg-purple-50 text-purple-950",
  "border-red-200 bg-red-50 text-red-950",
  "border-green-200 bg-green-50 text-green-950",
  "border-indigo-200 bg-indigo-50 text-indigo-950",
  "border-orange-200 bg-orange-50 text-orange-950",
];

const rankSymbolImages = [
  rankSymbol01,
  rankSymbol02,
  rankSymbol03,
  rankSymbol04,
  rankSymbol05,
  rankSymbol06,
  rankSymbol07,
  rankSymbol08,
  rankSymbol09,
  rankSymbol10,
  rankSymbol11,
  rankSymbol12,
  rankSymbol13,
  rankSymbol14,
  rankSymbol15,
];

function RankSymbol({ level }: { level: number }) {
  return (
    <span
      title={`${rankNames[level - 1]} symbol`}
      className="relative -translate-y-2 flex h-24 w-24 shrink-0 items-center justify-center overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none"
    >
      <img
        aria-hidden="true"
        alt=""
        src={rankSymbolImages[level - 1]}
        className="h-full w-full object-contain drop-shadow-[0_5px_6px_rgba(15,23,42,0.2)]"
      />
    </span>
  );
}

const heroStats = [
  { value: "15", label: "recognition levels", icon: Crown },
  { value: "1 leg", label: "simple network view", icon: Network },
  { value: "100 IDs", label: "reference example", icon: Users },
];

function GenerationPlan() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={generationPlanBreadcrumbImage}
          alt="Income Plan and Generation Plan"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>
      <section className="hidden relative isolate overflow-hidden bg-primary-dark pt-32 pb-16 text-primary-foreground sm:pt-40 sm:pb-20 md:pt-48">
        <div className="absolute -top-48 right-[-10rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-primary opacity-50 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-[-12rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-gold opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <img src={rankPlanImage} alt="" className="h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/65 to-transparent" />
        </div>
        <div className="container-x relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              <Sparkles className="h-3.5 w-3.5" /> RDG Future Way
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
              Build one strong leg. <span className="text-gold">Grow through 15 ranks.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              A clear reference guide to the single-leg income and generation plan—package values,
              product package details and the recognition ladder in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#rank-plan"
                className="bg-gold-grad inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-gold-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Explore the rank plan <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/income-calculator"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/15"
              >
                Open calculator <Calculator className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {heroStats.map(({ value, label, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
              >
                <Icon className="h-5 w-5 text-gold" />
                <p className="mt-4 font-display text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-sm text-primary-foreground/65">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative -mt-6 py-0 sm:-mt-8">
        <div className="container-x">
          <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-card sm:grid-cols-3 sm:p-7">
            <PlanStep
              number="01"
              icon={HandCoins}
              title="Choose a package"
              detail="Start with the ID package that fits your plan."
            />
            <PlanStep
              number="02"
              icon={Users}
              title="Build one active leg"
              detail="Grow a customer and distributor network with support."
            />
            <PlanStep
              number="03"
              icon={BadgeCheck}
              title="Unlock recognition"
              detail="Track network value and qualify for the next rank."
            />
          </div>
        </div>
      </section>

      <section id="rank-plan" className="scroll-mt-24 py-20 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                15-level rank plan
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                Your next milestone is visible.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The rank ladder below follows the supplied RDG reference poster—from Distributor to
                Royal Diamond Ambassador. Each card keeps the package, 100-ID reference and reward
                together for quick scanning.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Network className="h-4 w-4" /> Package value × active IDs
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {planLevels.map((item, index) => (
              <motion.article
                key={item.level}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (index % 5) * 0.05 }}
                className={
                  "card-glow overflow-hidden rounded-3xl border p-5 shadow-soft " +
                  rankThemes[index]
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-dark font-display text-lg font-extrabold text-primary-foreground shadow-soft">
                    {item.level}
                  </span>
                  <RankSymbol level={item.level} />
                </div>
                <h3 className="mt-5 min-h-12 font-display text-lg leading-tight font-extrabold capitalize">
                  {rankNames[index]}
                </h3>
                <div className="mt-5 space-y-3 border-t border-current/15 pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="opacity-65">Package</span>
                    <span className="font-bold">{money(item.packageValue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="opacity-65">100-ID value</span>
                    <span className="font-bold">{money(item.networkValue)}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed opacity-70">{item.reward}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Product package reference
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              See the package product details.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These are the four product packages requested for the RDG plan. Each package contains
              a defined number of products; confirm final product and payout terms with RDG.
            </p>
            <div className="mt-8 rounded-3xl bg-brand p-6 text-primary-foreground shadow-lift sm:p-8">
              <ShieldCheck className="h-7 w-7 text-gold" />
              <h3 className="mt-5 font-display text-xl font-bold">Transparent by design</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                Product packages, qualification values and rewards are kept separate so the page
                does not present qualification values as guaranteed personal income.
              </p>
              <a
                href="/income-calculator"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary-dark transition-transform hover:-translate-y-0.5"
              >
                Model your scenario <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {directReferralPlans.map((item, index) => (
              <motion.div
                key={item.packageValue}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.08 }}
                className="card-tilt flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Package value
                  </p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-foreground">
                    {money(item.packageValue)}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-right">
                  <p className="text-xs font-semibold tracking-[0.16em] text-secondary uppercase">
                    Packages selected
                  </p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-secondary">
                    {item.packageCount}
                  </p>
                </div>
              </motion.div>
            ))}
            <p className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Package example:</strong>{" "}
              {directReferralPlans[0].packageCount} package ={" "}
              {money(directReferralPlans[0].packageValue)}. Final package, tax and payout terms
              should be confirmed with RDG.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Additional income streams
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Recognition grows with the business.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These plan components are qualification-based and separate from the single-leg product
              packages above.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bonuses.map((bonus, index) => (
              <motion.article
                key={bonus.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (index % 3) * 0.06 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="bg-gold flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-gold-foreground">
                    {index + 1}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {bonus.value}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                  {bonus.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bonus.detail}</p>
              </motion.article>
            ))}
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              Actual earnings depend on product sales, personal and group volume, active IDs, rank
              qualification, company terms, taxes and payout timing. This page is an informational
              plan reference—not a promise of income.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function PlanStep({
  number,
  icon: Icon,
  title,
  detail,
}: {
  number: string;
  icon: typeof HandCoins;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl p-2 sm:p-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-bold text-primary">
        {number}
      </span>
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-secondary" />
          <h3 className="font-display font-bold text-foreground">{title}</h3>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export default GenerationPlan;
