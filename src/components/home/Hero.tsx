import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Ban, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import heroImage from "@/assets/optimized/banners/anmol-ratan-hero-v2.webp";
import { getPublicCmsConfig, type PublicCmsConfig } from "@/lib/cms";

const highlights = [
  { icon: Leaf, label: "100%", detail: "Natural" },
  { icon: Ban, label: "No Added", detail: "Preservatives" },
  { icon: ShieldCheck, label: "Immunity", detail: "Support" },
  { icon: Sparkles, label: "Rich in", detail: "Antioxidants" },
];

export function Hero() {
  const [cms, setCms] = useState<PublicCmsConfig | null>(null);

  useEffect(() => {
    getPublicCmsConfig().then(setCms);
  }, []);

  const banner = cms?.banners[0];
  const heroTitle =
    banner?.title || cms?.settings.hero_title || "Pure Herbal Nutrition for a Healthier Tomorrow";
  const heroDescription =
    banner?.description ||
    cms?.settings.hero_description ||
    "Anmol Ratan Juice is a herbal and mixed berry wellness drink for Indian families who want a refreshing, fruit-forward addition to their everyday routine.";
  const heroCtaLabel = banner?.ctaLabel || cms?.settings.hero_cta_label || "Discover the Goodness";
  const heroCtaUrl = banner?.ctaUrl || cms?.settings.hero_cta_url || "/products";
  const titleParts = heroTitle.endsWith(" Tomorrow") ? [heroTitle.slice(0, -8), "Tomorrow"] : null;
  // Older local database exports contain source-only paths such as
  // `/src/assets/anmol-ratan-hero-v2.png`. Those paths do not exist after Vite
  // builds the app, so use the bundled image when a legacy path is returned.
  const heroVisual =
    banner?.imageUrl && !banner.imageUrl.startsWith("/src/") ? banner.imageUrl : heroImage;

  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10">
      <img
        src={heroVisual}
        alt={
          banner?.altText ||
          "Anmol Ratan Juice bottle, berry juice and fresh mixed berries in a natural setting"
        }
        width={1984}
        height={793}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/10 sm:via-background/68" />
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-t from-background/45 via-transparent to-transparent" />

      <div className="container-x relative w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#6a9d78]/45 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-[#205d48] shadow-sm backdrop-blur sm:text-sm"
          >
            <Leaf className="h-4 w-4 fill-[#2e8b57] text-[#2e8b57]" />
            Natural Goodness <span className="text-[#6a9d78]">•</span> Herbal Care
            <span className="text-[#6a9d78]">•</span> Better Tomorrow
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7 }}
            className="mt-6 max-w-2xl text-4xl leading-[1.04] font-extrabold tracking-tight text-primary-dark sm:text-5xl lg:text-6xl"
          >
            {titleParts ? (
              <>
                {titleParts[0]} <span className="text-[#24804f] italic">{titleParts[1]}</span>
              </>
            ) : (
              heroTitle
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.7 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-primary-dark/75 sm:text-lg"
          >
            {heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.7 }}
            className="mt-7 grid max-w-2xl grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-y-0"
          >
            {highlights.map(({ icon: Icon, label, detail }, index) => (
              <div
                key={detail}
                className={`flex items-center gap-3 pr-4 sm:block sm:px-5 sm:text-center ${index > 0 ? "sm:border-l sm:border-primary-dark/15" : ""}`}
              >
                <span className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3f0d9] text-[#237148] shadow-sm sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-left sm:mt-2 sm:block sm:text-center">
                  <span className="block text-xs font-bold text-[#164f3b] sm:text-sm">{label}</span>
                  <span className="block text-xs font-semibold text-primary-dark/75 sm:text-sm">
                    {detail}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7 }}
            href={heroCtaUrl}
            className="bg-brand group mt-9 inline-flex items-center gap-4 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-14px_rgba(18,92,196,0.55)] transition-transform hover:-translate-y-0.5"
          >
            {heroCtaLabel}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
