import {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/shared/FloatingWhatsApp";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { LanguageProvider } from "@/lib/i18n";
import Products from "@/routes/products";

const Home = lazy(() => import("@/routes/index"));
const About = lazy(() => import("@/routes/about"));
const Blog = lazy(() => import("@/routes/blog"));
const BusinessOpportunity = lazy(() => import("@/routes/business-opportunity"));
const Career = lazy(() => import("@/routes/career"));
const Contact = lazy(() => import("@/routes/contact"));
const BecomeDistributor = lazy(() => import("@/routes/become-distributor"));
const Downloads = lazy(() => import("@/routes/downloads"));
const Events = lazy(() => import("@/routes/events"));
const Faqs = lazy(() => import("@/routes/faqs"));
const Franchise = lazy(() => import("@/routes/franchise"));
const Gallery = lazy(() => import("@/routes/gallery"));
const GenerationPlan = lazy(() => import("@/routes/generation-plan"));
const IncomeCalculator = lazy(() => import("@/routes/income-calculator"));
const PrivacyPolicy = lazy(() => import("@/routes/privacy-policy"));
const RefundPolicy = lazy(() => import("@/routes/refund-policy"));
const ShippingPolicy = lazy(() => import("@/routes/shipping-policy"));
const SuccessStories = lazy(() => import("@/routes/success-stories"));
const Terms = lazy(() => import("@/routes/terms"));
const Cart = lazy(() => import("@/routes/cart"));
const Checkout = lazy(() => import("@/routes/checkout"));
const CustomerAuth = lazy(() => import("@/routes/customer-auth"));
const CustomerOrders = lazy(() => import("@/routes/customer-orders"));
const DistributorAuth = lazy(() => import("@/routes/distributor-auth"));
const DistributorDashboard = lazy(() => import("@/routes/distributor-dashboard"));
const ProductDetail = lazy(() => import("@/routes/product-detail"));
const AdminLogin = lazy(() =>
  import("@/routes/admin").then(({ AdminLogin }) => ({ default: AdminLogin })),
);
const AdminDashboard = lazy(() =>
  import("@/routes/admin").then(({ AdminDashboard }) => ({ default: AdminDashboard })),
);

const pages: Record<string, ComponentType> = {
  "/": Home,
  "/about": About,
  "/blog": Blog,
  "/business-opportunity": BusinessOpportunity,
  "/career": Career,
  "/contact": Contact,
  "/become-distributor": BecomeDistributor,
  "/downloads": Downloads,
  "/events": Events,
  "/faqs": Faqs,
  "/franchise": Franchise,
  "/gallery": Gallery,
  "/generation-plan": GenerationPlan,
  "/income-calculator": IncomeCalculator,
  "/products": Products,
  "/cart": Cart,
  "/checkout": Checkout,
  "/customer/login": CustomerAuth,
  "/account/orders": CustomerOrders,
  "/distributor/login": DistributorAuth,
  "/distributor/dashboard": DistributorDashboard,
  "/privacy-policy": PrivacyPolicy,
  "/refund-policy": RefundPolicy,
  "/shipping-policy": ShippingPolicy,
  "/success-stories": SuccessStories,
  "/terms": Terms,
  "/admin/login": AdminLogin,
  "/admin/dashboard": AdminDashboard,
};

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error("Application error", error);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            This page didn&apos;t load
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong on our end. Try refreshing or head back home.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const siteUrl = "https://rdgfutureway.com";
const defaultSeo = {
  title: "RDG Future Way | Wellness Products & Business Opportunities",
  description:
    "Explore RDG Future Way wellness, lifestyle and nutrition products, product details, pricing and business opportunities.",
};
const seoByPath: Record<string, { title: string; description: string }> = {
  "/": defaultSeo,
  "/products": {
    title: "Products | RDG Future Way",
    description:
      "Browse RDG Future Way wellness, nutrition, personal care and lifestyle products with product details and pricing.",
  },
  "/about": {
    title: "About RDG Future Way | Quality Products & Opportunity",
    description:
      "Learn about RDG Future Way, our product journey, wellness focus and direct selling opportunity.",
  },
  "/business-opportunity": {
    title: "Business Opportunity | RDG Future Way",
    description:
      "Discover the RDG Future Way direct selling business opportunity, product model and distributor support.",
  },
  "/contact": {
    title: "Contact RDG Future Way",
    description:
      "Contact RDG Future Way for product, distributor and business opportunity information.",
  },
  "/blog": {
    title: "RDG Future Way Blog | Wellness & Business",
    description:
      "Read RDG Future Way articles about wellness, products, lifestyle and business growth.",
  },
};

function updateMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function useSeo(path: string) {
  useEffect(() => {
    const normalizedPath = path.startsWith("/products/") ? "/products" : path;
    const seo = seoByPath[normalizedPath] || defaultSeo;
    const isPrivatePage = /^(\/admin|\/customer|\/distributor|\/account|\/cart|\/checkout)/.test(
      path,
    );
    const pageTitle = path.startsWith("/products/")
      ? `${decodeURIComponent(path.split("/").pop() || "Product")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())} | RDG Future Way`
      : seo.title;
    const canonicalUrl = `${siteUrl}${path === "/" ? "" : path}`;

    document.title = pageTitle;
    document.documentElement.lang = "en-IN";
    updateMeta("name", "description", seo.description);
    updateMeta("name", "robots", isPrivatePage ? "noindex,nofollow" : "index,follow");
    updateMeta("property", "og:title", pageTitle);
    updateMeta("property", "og:description", seo.description);
    updateMeta("property", "og:url", canonicalUrl);
    updateMeta("property", "og:type", path.startsWith("/products/") ? "product" : "website");
    updateMeta("name", "twitter:title", pageTitle);
    updateMeta("name", "twitter:description", seo.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let structuredData = document.getElementById("rdg-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "rdg-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": path.startsWith("/products/") ? "Product" : "Organization",
      name: pageTitle,
      description: seo.description,
      url: canonicalUrl,
      ...(path.startsWith("/products/")
        ? { brand: { "@type": "Brand", name: "RDG Future Way" } }
        : {
            logo: `${siteUrl}/favicon.png`,
            telephone: "+91 73979 67779",
            email: "rdgfutureway7779@gmail.com",
          }),
    });
  }, [path]);
}

export function App() {
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/$/, "") || "/");

  useSeo(path);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname.replace(/\/$/, "") || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const Page = pages[path] ?? (path.startsWith("/products/") ? ProductDetail : NotFound);
  const isAdmin = path.startsWith("/admin");
  const pageFallback = (
    <div className="container-x flex min-h-[40vh] items-center justify-center py-20 text-sm text-muted-foreground">
      Loading RDG Future Way…
    </div>
  );

  if (isAdmin) {
    return (
      <LanguageProvider>
        <Suspense fallback={pageFallback}>
          <Page />
        </Suspense>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AppErrorBoundary>
        <SmoothScroll />
        <Navbar />
        <main>
          <Suspense fallback={pageFallback}>
            <Page />
          </Suspense>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </AppErrorBoundary>
    </LanguageProvider>
  );
}
