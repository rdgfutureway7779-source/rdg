import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import logo from "@/assets/optimized/logo-small.webp";
import { company } from "@/data/site";

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Anmol Ratan Juice", to: "/products" },
  { label: "Business Opportunity", to: "/business-opportunity" },
  { label: "Generation Plan", to: "/generation-plan" },
  { label: "Income Calculator", to: "/income-calculator" },
  { label: "Success Stories", to: "/success-stories" },
];

const resourceLinks = [
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Blog", to: "/blog" },
  { label: "Downloads", to: "/downloads" },
  { label: "FAQs", to: "/faqs" },
  { label: "Career", to: "/career" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Contact", to: "/contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1H16jWGmVB/",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mushtak2296/",
    Icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@royaldiamondgroup4794",
    Icon: Youtube,
  },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-primary-dark text-primary-foreground sm:mt-24">
      <div className="container-x grid gap-10 py-12 sm:gap-12 sm:py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/90">
              <img
                src={logo}
                alt="RDG Future Way logo"
                loading="lazy"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="font-display text-xl font-bold">RDG Future Way</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            An Indian direct selling company presenting Anmol Ratan Juice — paired with a
            transparent generation income plan.
          </p>
          <div className="mt-6 space-y-3 text-sm text-primary-foreground/80">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {company.address}
            </p>
            <p className="flex gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold" /> {company.phone} /{" "}
              {company.secondaryPhone}
            </p>
            <p className="flex min-w-0 gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold" />{" "}
              <span className="break-words">{company.email}</span>
            </p>
            <p className="flex min-w-0 gap-3">
              <span className="w-4 shrink-0 text-center text-gold">@</span>{" "}
              <span className="break-words">{company.website}</span>
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit RDG Future Way on ${label}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Quick Links" links={quickLinks} />
        <FooterCol title="Resources" links={resourceLinks} />

        <div>
          <h4 className="font-display text-sm font-semibold tracking-widest uppercase text-gold">
            Newsletter
          </h4>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Product launches, offers and business updates — once a month.
          </p>
          <form
            className="mt-4 flex items-center gap-2 rounded-full bg-primary-foreground/10 p-1.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              aria-label="Email address"
              className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-primary-foreground/50"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-gold-grad flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gold-foreground"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <h4 className="mt-8 font-display text-sm font-semibold tracking-widest uppercase text-gold">
            Policies
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {policyLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.to}
                  className="text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>Income depends on effort and results. This is not a guaranteed-income scheme.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold tracking-widest uppercase text-gold">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.to} className="text-primary-foreground/70 transition-colors hover:text-gold">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
