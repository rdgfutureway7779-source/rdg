import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Menu,
  Search,
  ShoppingCart,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { catalogDemoProducts, navigation, products } from "@/data/site";
import { getCustomerCart, getCustomerMe, type Customer } from "@/lib/customer-api";
import { getPublicProducts } from "@/lib/cms";
import { languageOptions, useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [productCategories, setProductCategories] = useState(() =>
    Array.from(
      new Set(
        [...products, ...catalogDemoProducts].map((product) => product.category).filter(Boolean),
      ),
    ),
  );
  const { language, setLanguage } = useLanguage();
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    getCustomerMe().then(setCustomer);
    getCustomerCart()
      .then((items) => setCartCount(items.reduce((total, item) => total + item.quantity, 0)))
      .catch(() => setCartCount(0));
  }, []);

  useEffect(() => {
    getPublicProducts().then((items) => {
      if (!items?.length) return;
      const categories = Array.from(
        new Set([
          ...[...products, ...catalogDemoProducts].map((product) => product.category),
          ...(items.map((item) => item.category?.trim()).filter(Boolean) as string[]),
        ]),
      );
      if (categories.length) setProductCategories(categories);
    });
  }, []);

  const navigationItems = navigation.map((item) =>
    item.label === "Products"
      ? {
          ...item,
          children: [
            {
              label: "All Categories",
              to: "/products",
              desc: "Browse the complete product collection",
            },
            ...productCategories.map((category) => ({
              label: category,
              to: `/products?category=${encodeURIComponent(category)}`,
              desc: `Browse ${category} products`,
            })),
          ],
        }
      : item,
  );

  const isActive = (to: string) => (to === "/" ? currentPath === "/" : currentPath.startsWith(to));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="w-full">
        <div
          className={cn(
            "glass rounded-none border-x-0 border-t-0 border-white/70 bg-white/80 shadow-[0_16px_45px_-28px_rgba(6,31,77,0.55)] backdrop-blur-xl transition-all duration-300",
            scrolled ? "shadow-[0_18px_42px_-22px_rgba(6,31,77,0.42)]" : "",
          )}
        >
          <div className="flex min-h-[4.5rem] items-center gap-3 px-4 py-2 sm:gap-5 sm:px-7 lg:px-9">
            <a href="/" className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
                <img
                  src={logo}
                  alt="RDG Future Way logo"
                  width={88}
                  height={74}
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
              </span>
              <span className="hidden h-11 w-px bg-primary/20 sm:block" />
              <span className="hidden min-w-0 leading-tight sm:block">
                <span className="block whitespace-nowrap font-display text-base font-extrabold tracking-tight text-primary-dark md:text-lg">
                  RDG FUTURE WAY
                </span>
                <span className="mt-1 block text-[10px] font-medium tracking-[0.26em] text-primary uppercase md:text-[11px]">
                  PVT. LTD.
                </span>
              </span>
            </a>

            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex"
              onMouseLeave={() => setMenu(null)}
            >
              {navigationItems.map((item) => (
                <div key={item.label} className="relative" onMouseEnter={() => setMenu(item.label)}>
                  <a
                    href={item.to}
                    className={cn(
                      "relative flex items-center gap-1 rounded-full px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors xl:px-4",
                      isActive(item.to)
                        ? "text-primary"
                        : "text-primary-dark/90 hover:bg-accent hover:text-primary",
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
                    {isActive(item.to) && (
                      <span className="absolute right-3 -bottom-1 left-3 h-1 rounded-full bg-primary" />
                    )}
                  </a>
                  <AnimatePresence>
                    {item.children && menu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-4"
                      >
                        <div className="glass max-h-[70vh] overflow-y-auto rounded-3xl bg-white/90 p-2 shadow-card">
                          {item.children.map((child) => (
                            <a
                              key={child.label}
                              href={child.to}
                              className="block rounded-2xl px-4 py-3 transition-colors hover:bg-accent"
                            >
                              <span className="block text-sm font-semibold text-foreground">
                                {child.label}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {child.desc}
                              </span>
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <a
                href="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary-dark transition-colors hover:bg-accent hover:text-primary"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </a>
              <a
                href={customer ? "/account/orders" : "/customer/login"}
                className="hidden items-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold text-primary-dark transition-colors hover:bg-accent hover:text-primary sm:flex"
              >
                <UserRound className="h-4 w-4" /> {customer ? "Account" : "Login"}
              </a>
              <button
                type="button"
                aria-label="Search"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-primary-dark transition-colors hover:bg-accent hover:text-primary md:flex"
              >
                <Search className="h-5 w-5" />
              </button>
              <span className="hidden h-8 w-px bg-primary/20 md:block" />
              <div className="relative hidden md:block">
                <button
                  type="button"
                  aria-label="Switch language"
                  aria-expanded={languageOpen}
                  onClick={() => setLanguageOpen((value) => !value)}
                  className="flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-primary-dark transition-colors hover:bg-accent hover:text-primary"
                >
                  <Globe className="h-4.5 w-4.5" /> {language.toUpperCase()}{" "}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {languageOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border bg-white p-1.5 shadow-card">
                    {languageOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        data-no-translate
                        onClick={() => {
                          setLanguage(option.code);
                          setLanguageOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                          language === option.code
                            ? "bg-accent font-semibold text-primary"
                            : "text-foreground",
                        )}
                      >
                        <span>{option.nativeLabel}</span>
                        <span className="text-xs text-muted-foreground">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a
                href="/distributor/login"
                className="bg-brand hidden items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5 xl:flex"
              >
                <UserPlus className="h-4 w-4" />
                <span className="max-w-[7rem] whitespace-normal text-center leading-tight">
                  Become Distributor
                </span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setOpen((value) => !value)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary-dark transition-colors hover:bg-accent lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mt-3 overflow-hidden rounded-3xl bg-white/95 shadow-card lg:hidden"
            >
              <div className="max-h-[70vh] space-y-1 overflow-y-auto p-4">
                {navigationItems.map((item) => (
                  <div key={item.label}>
                    <a
                      href={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-2xl px-4 py-3 font-display font-semibold",
                        isActive(item.to) ? "bg-accent text-primary" : "text-foreground",
                      )}
                    >
                      {item.label}
                    </a>
                    {item.children?.map((child) => (
                      <a
                        key={child.label}
                        href={child.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-7 py-2 text-sm text-muted-foreground"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ))}
                <div className="mt-3 rounded-2xl border border-border bg-white/70 p-3">
                  <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Language
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {languageOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        data-no-translate
                        onClick={() => setLanguage(option.code)}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-xs font-semibold transition-colors",
                          language === option.code
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:bg-accent",
                        )}
                      >
                        {option.nativeLabel}
                      </button>
                    ))}
                  </div>
                </div>
                <a
                  href="/distributor/login"
                  onClick={() => setOpen(false)}
                  className="bg-brand mt-3 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4" /> Become a Distributor{" "}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={customer ? "/account/orders" : "/customer/login"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-primary/20 px-4 py-3 text-sm font-semibold text-primary"
                  >
                    <UserRound className="h-4 w-4" /> {customer ? "Account" : "Customer login"}
                  </a>
                  <a
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-primary/20 px-4 py-3 text-sm font-semibold text-primary"
                  >
                    <ShoppingCart className="h-4 w-4" /> Cart {cartCount ? `(${cartCount})` : ""}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
