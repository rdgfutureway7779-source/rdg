import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Calculator as CalculatorIcon, Info, Network, Wallet } from "lucide-react";
import bottleImage from "@/assets/optimized/anmol-ratan-juice-bottle.webp";
import incomeCalculatorBreadcrumbImage from "@/assets/income-calculator-breadcrumb.png";
import { bonuses, directReferralPlans, planLevels } from "@/data/site";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function Calculator() {
  const [activeIds, setActiveIds] = useState(100);
  const [directPlanIndex, setDirectPlanIndex] = useState(0);

  const result = useMemo(() => {
    const levelIndex = Math.min(
      planLevels.length - 1,
      Math.max(0, Math.floor(activeIds / 100) - 1),
    );
    const level = planLevels[levelIndex]!;
    const directPlan = directReferralPlans[directPlanIndex]!;
    const packageCount = 100;
    const distributorIncome = level.packageValue * packageCount;
    const next = planLevels[levelIndex + 1];
    const progress = next
      ? Math.min(100, Math.round((activeIds / ((levelIndex + 2) * 100)) * 100))
      : 100;

    return {
      levelIndex,
      level,
      directPlan,
      packageCount,
      distributorIncome,
      next,
      progress,
    };
  }, [activeIds, directPlanIndex]);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={incomeCalculatorBreadcrumbImage}
          alt="Calculate your distributor income"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-3">
              <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground">
                <CalculatorIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  Choose your assumptions
                </p>
                <p className="text-sm text-muted-foreground">
                  Each completed level uses 100 packages for the income calculation.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <label className="font-display text-sm font-semibold text-foreground">
                  ID package level
                </label>
                <span className="font-display text-sm font-bold text-primary">
                  Level {result.level.level} · {money(result.level.packageValue)} per package
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {planLevels.map((item, index) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setActiveIds((index + 1) * 100)}
                    className={
                      result.levelIndex === index
                        ? "bg-brand rounded-xl px-2 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft"
                        : "rounded-xl border border-border px-2 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                    }
                  >
                    L{item.level}
                    <span className="mt-0.5 block text-[10px] opacity-80">
                      {money(item.packageValue)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-9">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="active-ids"
                  className="font-display text-sm font-semibold text-foreground"
                >
                  Completed IDs
                </label>
                <span className="font-display font-bold text-primary">{activeIds} IDs</span>
              </div>
              <input
                id="active-ids"
                type="range"
                min={100}
                max={1500}
                step={100}
                value={activeIds}
                onChange={(event) => setActiveIds(Number(event.target.value))}
                className="mt-4 w-full accent-primary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Formula: {money(result.level.packageValue)} × {result.packageCount} packages ={" "}
                {money(result.distributorIncome)}
              </p>
            </div>

            <div className="mt-9">
              <label
                htmlFor="direct-package"
                className="font-display text-sm font-semibold text-foreground"
              >
                Product package
              </label>
              <select
                id="direct-package"
                value={directPlanIndex}
                onChange={(event) => setDirectPlanIndex(Number(event.target.value))}
                className="field mt-3"
              >
                {directReferralPlans.map((item, index) => (
                  <option key={item.packageValue} value={index}>
                    Package {item.packageCount} → {money(item.packageValue)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Selected package: {result.directPlan.packageCount} package(s), total value{" "}
                {money(result.directPlan.packageValue)}.
              </p>

              <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[6.5rem_1fr] sm:items-center">
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f7fbe9] via-[#fff7d6] to-[#d7eff7]">
                  <img
                    src={bottleImage}
                    alt="Anmol Ratan Juice bottle"
                    width={1024}
                    height={1536}
                    className="h-28 w-auto object-contain drop-shadow-xl"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Package product reference
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                    Anmol Ratan Juice
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Product reference for the selected distributor package.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand rounded-3xl p-6 text-primary-foreground shadow-lift sm:p-8">
            <p className="text-sm tracking-[0.18em] uppercase opacity-75">Illustrative scenario</p>
            <motion.div
              key={result.distributorIncome}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <p className="text-xs uppercase opacity-70">Distributor income</p>
              <p className="mt-1 font-display text-4xl font-extrabold sm:text-5xl">
                {money(result.distributorIncome)}
              </p>
            </motion.div>

            <div className="mt-8 space-y-3 text-sm">
              <ResultRow
                icon={Network}
                label="Distributor income"
                value={result.distributorIncome}
              />
              <ResultRow
                icon={Wallet}
                label="Selected package"
                value={result.directPlan.packageValue}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-primary-foreground/10 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="opacity-80">Current reward qualification</span>
                <span className="font-semibold">Level {result.level.level}</span>
              </div>
              <p className="mt-2 font-display font-semibold">{result.level.reward}</p>
              {result.next && (
                <>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
                    <motion.div
                      className="h-full rounded-full bg-gold"
                      animate={{ width: `${result.progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="mt-2 text-xs opacity-70">
                    {result.progress}% toward Level {result.next.level}: {result.next.reward}
                  </p>
                </>
              )}
            </div>

            <p className="mt-8 text-xs leading-relaxed opacity-70">
              This is a plan illustration, not a guaranteed profit statement. Confirm eligibility,
              payout timing, taxes and final settlement conditions with RDG.
            </p>
            <a
              href="/generation-plan"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary-dark transition-transform hover:-translate-y-0.5"
            >
              View complete plan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Distributor income structure
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              More than one way to build income
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The calculator shows the requested 100-package milestone income and the product count
              in each available package. Other streams require their own sales and qualification
              conditions.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bonuses
              .filter((bonus) => bonus.name !== "Performance Bonus")
              .map((bonus, index) => (
                <motion.article
                  key={bonus.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-3xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="bg-gold flex h-10 w-10 items-center justify-center rounded-2xl text-gold-foreground">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {bonus.value}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                    {bonus.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {bonus.detail}
                  </p>
                </motion.article>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-x">
          <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              This calculator uses the requested milestone formula: package rate × 100 packages.
              Confirm eligibility, payout timing, taxes and final settlement conditions with RDG
              before making a business decision.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function ResultRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Network;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3">
      <span className="flex items-center gap-2 opacity-80">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-semibold">{money(value)}</span>
    </div>
  );
}

export default Calculator;
