import { CheckCircle2, Eye, Flag, Quote, Target } from "lucide-react";
import { SectionHeading } from "@/components/layout/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { stats } from "@/data/site";
import { company } from "@/data/site";
import aboutBreadcrumbImage from "@/assets/about-breadcrumb.png";
import certificatesImage from "@/assets/about-certificates.png";
import foundersImage from "@/assets/about-founders.png";

const title = "About RDG Future Way — Our Story, Vision & Mission";
const description =
  "RDG Future Way Pvt. Ltd. is an Indian direct selling company manufacturing ayurvedic, healthcare, agricultural and lifestyle products for 50,000+ families.";

const pillars = [
  {
    icon: Eye,
    title: "Our Vision",
    text: "To make certified, affordable wellness and lifestyle products reachable in every Indian household while creating one lakh self-reliant entrepreneurs.",
  },
  {
    icon: Target,
    title: "Our Mission",
    text: "Manufacture with integrity, price with fairness, train relentlessly and pay every rupee of bonus on time — month after month.",
  },
  {
    icon: Flag,
    title: "Our Values",
    text: "Transparency in payouts, honesty in labelling, respect for distributors and long-term thinking over short-term volume.",
  },
];

function About() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={aboutBreadcrumbImage}
          alt="About Us"
          width={2067}
          height={761}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <SectionHeading
            align="left"
            eyebrow="Our story"
            title={title}
            description={description}
          />
        </div>
      </section>

      <section className="py-20">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="card-tilt h-full rounded-3xl border border-border bg-card p-8 shadow-soft">
                <span className="bg-brand flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground">
                  <p.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
                  {p.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <div className="rounded-[2rem] border border-border bg-card p-10 shadow-card">
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-6 text-lg leading-relaxed text-foreground">
                “We did not start RDG to sell more boxes. We started it so a family in a small town
                could buy a trustworthy ayurvedic medicine at a fair price — and, if they choose,
                turn that trust into a dignified income. Every policy we write is tested against
                that single sentence.”
              </p>
              <footer className="mt-8">
                <p className="font-display font-semibold text-foreground">Chairman's Message</p>
                <p className="text-sm text-muted-foreground">
                  Founder & Chairman, RDG Future Way Pvt. Ltd.
                </p>
              </footer>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="By the numbers"
              title="Growth measured in families served"
              description="Every metric below is a household that chose RDG for their monthly needs or their monthly income."
            />
            <div className="mt-10 grid grid-cols-2 gap-5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="card-glow rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <p className="font-display text-3xl font-extrabold text-gradient">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Company profile & leadership"
            title="Trust is built with transparency"
            description="Explore RDG's credentials and leadership through separate, focused documents instead of one crowded banner."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <article className="card-glow h-full overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-card">
                <div className="flex items-center gap-3 px-4 pb-4 pt-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-primary-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      Company credentials
                    </p>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Certificates & registration
                    </h3>
                  </div>
                </div>
                <img
                  src={certificatesImage}
                  alt="RDG Future Way incorporation and registration certificates"
                  loading="lazy"
                  width={1536}
                  height={1024}
                  className="h-auto w-full rounded-[1.5rem] object-contain"
                />
              </article>
            </Reveal>
            <Reveal delay={0.08}>
              <article className="card-glow h-full overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-card">
                <div className="flex items-center gap-3 px-4 pb-4 pt-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-primary-foreground">
                    <Eye className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      Leadership team
                    </p>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Meet the founders
                    </h3>
                  </div>
                </div>
                <img
                  src={foundersImage}
                  alt="M.M. Shaikh, C.M.D. and Sameer Shaikh, M.D. founders of RDG Future Way"
                  loading="lazy"
                  width={1774}
                  height={887}
                  className="h-auto w-full rounded-[1.5rem] object-contain"
                />
              </article>
            </Reveal>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-3 md:grid-cols-3">
            {[
              "RDG Future Way Pvt. Ltd. company profile and registration references",
              "Leadership details for M.M. Shaikh (C.M.D.) and Sameer Shaikh (M.D.)",
              `Official support through ${company.phone} and ${company.email}`,
            ].map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="/contact"
              className="bg-brand inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"
            >
              Contact the RDG team
            </a>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Milestones" title="The road so far" />
          <Stagger className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              {
                year: "2019",
                text: "RDG Future Way incorporated with a focus on trusted wellness.",
              },
              { year: "2021", text: "Agriculture and organic food divisions launched." },
              { year: "2023", text: "Generation Plan v2 released with royalty pool." },
              { year: "2026", text: "25+ cities and Anmol Ratan Juice as the signature product." },
            ].map((m) => (
              <StaggerItem key={m.year}>
                <div className="card-sheen h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <p className="font-display text-2xl font-bold text-primary">{m.year}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

export default About;
