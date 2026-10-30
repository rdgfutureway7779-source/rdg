/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { PasswordInput } from "@/components/shared/PasswordInput";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Newspaper,
  Package,
  Pencil,
  Plus,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

type User = { id: number; name: string; email: string; role: string };
type Tab =
  | "dashboard"
  | "pages"
  | "banners"
  | "products"
  | "events"
  | "blog"
  | "enquiries"
  | "orders"
  | "distributors"
  | "transactions"
  | "gallery"
  | "downloads"
  | "settings"
  | "activity";
type RecordItem = Record<string, any>;

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(path, { credentials: "include", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false)
    throw new Error(payload.error || "Request failed.");
  return payload.data;
}

async function uploadAdminImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return api("/api/admin/media", { method: "POST", body });
}

const buttonPrimary =
  "bg-brand inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent";
const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      window.location.href = "/admin/dashboard";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-brand relative hidden overflow-hidden p-10 text-white lg:block">
          <div className="bg-gold-grad absolute -top-28 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                  RDG
                </span>
                <div>
                  <p className="font-display text-lg font-bold">RDG Future Way</p>
                  <p className="text-xs text-white/70">Content management system</p>
                </div>
              </div>
              <h1 className="mt-20 max-w-sm font-display text-4xl leading-tight font-bold">
                Manage the website with confidence.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
                Publish pages, products, banners and articles. Track enquiries and keep every update
                in one secure workspace.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-2 text-sm text-white/75">
              <ShieldCheck className="h-4 w-4 text-gold" /> Secure administrator access
            </div>
          </div>
        </div>
        <div className="p-7 sm:p-12">
          <div className="mb-10 lg:hidden">
            <p className="font-display text-xl font-bold text-primary-dark">RDG Future Way</p>
            <p className="mt-1 text-xs text-muted-foreground">Admin CMS</p>
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Administrator access
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in to manage your public website content.
          </p>
          <form className="mt-8 space-y-5" onSubmit={submit} autoComplete="off">
            <label className="block text-sm font-semibold text-foreground">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="off"
                className={fieldClass}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Password
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className={fieldClass}
                required
              />
            </label>
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button className={`${buttonPrimary} w-full`} disabled={loading}>
              {loading ? "Signing in…" : "Sign in to dashboard"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
          <a
            href="/"
            className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            ← Back to public website
          </a>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        window.location.href = "/admin/login";
      });
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/admin/login";
  }

  const navigation: { id: Tab; label: string; icon: typeof LayoutDashboard; group: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
    { id: "pages", label: "Website Pages", icon: FileText, group: "Content" },
    { id: "banners", label: "Hero Banners", icon: ImageIcon, group: "Content" },
    { id: "products", label: "Products", icon: Package, group: "Content" },
    { id: "events", label: "Events", icon: CalendarDays, group: "Content" },
    { id: "blog", label: "Blog / Insights", icon: Newspaper, group: "Content" },
    { id: "enquiries", label: "Contact Enquiries", icon: Users, group: "Operations" },
    { id: "orders", label: "Customer Orders", icon: Package, group: "Operations" },
    { id: "distributors", label: "Distributors / IDs", icon: UserPlus, group: "Operations" },
    { id: "transactions", label: "Transactions & Payments", icon: Receipt, group: "Operations" },
    { id: "gallery", label: "Gallery", icon: ImageIcon, group: "Operations" },
    { id: "downloads", label: "Downloads", icon: Download, group: "Operations" },
    { id: "settings", label: "Website Settings", icon: Settings2, group: "System" },
    { id: "activity", label: "Activity Logs", icon: Activity, group: "System" },
  ];

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc] text-sm text-muted-foreground">
        Loading secure workspace…
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-primary-dark text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <a href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold">
                RDG
              </span>
              <span>
                <span className="block font-display font-bold">RDG Future Way</span>
                <span className="block text-[11px] text-white/55">Admin CMS</span>
              </span>
            </a>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
            {Array.from(new Set(navigation.map((item) => item.group))).map((group) => (
              <div key={group}>
                <p className="px-3 text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
                  {group}
                </p>
                <div className="mt-2 space-y-1">
                  {navigation
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${tab === item.id ? "bg-white/12 font-semibold text-white" : "text-white/65 hover:bg-white/8 hover:text-white"}`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 pt-4">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/7 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-grad text-xs font-bold text-gold-foreground">
                {user.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/50">{user.role.replace("_", " ")}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-primary-dark/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-border p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                RDG control center
              </p>
              <h1 className="mt-1 font-display text-xl font-bold">
                {navigation.find((item) => item.id === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className={buttonSecondary}>
              View website <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </header>
        <div className="p-5 sm:p-8">
          {error && (
            <div className="mb-5 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {tab === "dashboard" && <DashboardView onNavigate={setTab} />}
          {tab === "pages" && <PagesView setError={setError} />}
          {tab === "banners" && <BannersView setError={setError} />}
          {tab === "products" && <ProductsView setError={setError} />}
          {tab === "events" && <EventsView setError={setError} />}
          {tab === "blog" && <BlogView setError={setError} />}
          {tab === "enquiries" && <EnquiriesView setError={setError} />}
          {tab === "orders" && <OrdersView setError={setError} />}
          {tab === "distributors" && <DistributorsView setError={setError} />}
          {tab === "transactions" && <TransactionsView setError={setError} />}
          {tab === "gallery" && <GalleryView setError={setError} />}
          {tab === "downloads" && <DownloadsView setError={setError} />}
          {tab === "settings" && <SettingsView setError={setError} />}
          {tab === "activity" && <ActivityView setError={setError} />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api("/api/admin/dashboard")
      .then(setData)
      .catch(() => undefined);
  }, []);
  if (!data) return <Loading />;
  const cards = [
    {
      label: "Published pages",
      value: data.metrics.publishedPages,
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Draft pages",
      value: data.metrics.draftPages,
      icon: BarChart3,
      color: "text-gold-foreground",
    },
    {
      label: "Published products",
      value: data.metrics.products,
      icon: Package,
      color: "text-secondary",
    },
    {
      label: "Unread enquiries",
      value: data.metrics.unreadEnquiries,
      icon: Users,
      color: "text-destructive",
    },
    {
      label: "Distributors",
      value: data.metrics.distributors,
      icon: UserPlus,
      color: "text-primary",
    },
    {
      label: "Paid IDs",
      value: data.metrics.totalIds,
      icon: CreditCard,
      color: "text-secondary",
    },
    {
      label: "Paid amount",
      value: `Rs ${Number(data.metrics.totalPaidAmount || 0).toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "text-gold-foreground",
    },
    {
      label: "Pending payments",
      value: `Rs ${Number(data.metrics.pendingPayments || 0).toLocaleString("en-IN")}`,
      icon: Receipt,
      color: "text-destructive",
    },
    {
      label: "Distributor income",
      value: `Rs ${Number(data.metrics.totalIncome || 0).toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "text-secondary",
    },
    {
      label: "Levels passed",
      value: data.metrics.passedLevels || 0,
      icon: Bell,
      color: "text-gold-foreground",
    },
  ];
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">
            Good to see you. Here is your website at a glance.
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold">Good morning, admin.</h2>
        </div>
        <button onClick={() => onNavigate("pages")} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Create page
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-accent ${color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs text-muted-foreground">Live data</span>
            </div>
            <p className="mt-6 font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-gold/35 bg-gold/10 p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold">ID level notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every 100 paid IDs passes one level according to the RDG package chart.
            </p>
          </div>
          <Bell className="h-5 w-5 shrink-0 text-gold-foreground" />
        </div>
        <div className="mt-5 space-y-3">
          {data.levelNotifications?.length ? (
            data.levelNotifications.map((item: any) => (
              <div
                key={`${item.distributorId}-${item.completedLevel}`}
                className="flex flex-col gap-3 rounded-xl border border-gold/25 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.name}
                      {" · "}
                      {item.distributorCode}
                      {" · "}
                      {item.totalIds.toLocaleString("en-IN")} paid IDs
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Current level
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-primary">
                    Level {item.completedLevel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID value Rs {Number(item.currentPackageValue).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))
          ) : data.levelProgress?.length ? (
            <div className="rounded-xl border border-gold/25 bg-card p-4 text-sm text-muted-foreground">
              No level passed yet. Record a paid ID purchase; a notification will appear here after
              every 100 IDs.
            </div>
          ) : (
            <EmptyState label="Add a distributor and paid ID purchase to start level tracking." />
          )}
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Quick actions</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump into the areas you use most.
              </p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Manage pages", tab: "pages" as Tab, icon: FileText },
              { label: "Manage hero banners", tab: "banners" as Tab, icon: ImageIcon },
              { label: "Review enquiries", tab: "enquiries" as Tab, icon: Users },
              { label: "Manage distributors", tab: "distributors" as Tab, icon: UserPlus },
              { label: "Record a payment", tab: "transactions" as Tab, icon: Receipt },
              { label: "Update global settings", tab: "settings" as Tab, icon: Settings2 },
            ].map(({ label, tab, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary/35 hover:bg-accent"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Recent activity</h3>
              <p className="mt-1 text-sm text-muted-foreground">Latest administrative changes.</p>
            </div>
            <button
              onClick={() => onNavigate("activity")}
              className="text-xs font-semibold text-primary"
            >
              View all
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {data.recent.length ? (
              data.recent.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl bg-surface p-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {item.action} {item.entityType.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No activity yet." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PagesView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [search, setSearch] = useState("");
  const blank = {
    title: "",
    slug: "",
    description: "",
    body: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    showInNav: false,
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api(`/api/admin/pages?q=${encodeURIComponent(search)}`)
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [search]);
  function open(item?: RecordItem) {
    setEditing(item || null);
    setForm(
      item
        ? {
            ...item,
            seoTitle: item.seo_title || item.seoTitle || "",
            seoDescription: item.seo_description || item.seoDescription || "",
            showInNav: Boolean(item.show_in_nav ?? item.showInNav),
          }
        : blank,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/pages/${editing.id}` : "/api/admin/pages", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this page?")) return;
    try {
      await api(`/api/admin/pages/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Website pages"
      description="Manage publishable page records, navigation visibility and page SEO."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Add page
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className={`${fieldClass} mt-0 pl-9`}
          />
        </div>
      </div>
      {editing !== null && (
        <Editor title={editing ? "Edit page" : "New page"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <TextField
              label="Short description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              wide
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["draft", "published"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.showInNav}
                onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
              />
              Show in navigation
            </label>
            <TextAreaField
              label="Body content"
              value={form.body}
              onChange={(value) => setForm({ ...form, body: value })}
              wide
              rows={6}
            />
            <TextField
              label="SEO title"
              value={form.seoTitle}
              onChange={(value) => setForm({ ...form, seoTitle: value })}
            />
            <TextField
              label="SEO description"
              value={form.seoDescription}
              onChange={(value) => setForm({ ...form, seoDescription: value })}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save page</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable headers={["Title", "Slug", "Status", "Updated", "Actions"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4 font-semibold">{item.title}</td>
            <td className="px-4 py-4 text-sm text-muted-foreground">/{item.slug}</td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {new Date(item.updated_at || item.updatedAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function BannersView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const blank = {
    title: "",
    subtitle: "",
    description: "",
    ctaLabel: "",
    ctaUrl: "",
    imageUrl: "",
    mobileImageUrl: "",
    altText: "",
    sortOrder: 0,
    active: true,
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api("/api/admin/banners")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  function open(item?: RecordItem) {
    setEditing(item || {});
    setForm(
      item
        ? {
            ...item,
            active: Boolean(item.active),
            sortOrder: Number(item.sortOrder ?? 0),
          }
        : blank,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing?.id ? `/api/admin/banners/${editing.id}` : "/api/admin/banners", {
        method: editing?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this banner?")) return;
    try {
      await api(`/api/admin/banners/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Hero banners"
      description="Control the active hero slides and their calls to action."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Add banner
        </button>
      }
    >
      {editing && (
        <Editor title={editing.id ? "Edit banner" : "New banner"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(value) => setForm({ ...form, subtitle: value })}
            />
            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              wide
            />
            <TextField
              label="CTA label"
              value={form.ctaLabel}
              onChange={(value) => setForm({ ...form, ctaLabel: value })}
            />
            <TextField
              label="CTA URL"
              value={form.ctaUrl}
              onChange={(value) => setForm({ ...form, ctaUrl: value })}
            />
            <ImageUploadField
              label="Desktop image"
              value={form.imageUrl}
              onChange={(value) => setForm({ ...form, imageUrl: value })}
              onError={setError}
              wide
            />
            <ImageUploadField
              label="Mobile image"
              value={form.mobileImageUrl}
              onChange={(value) => setForm({ ...form, mobileImageUrl: value })}
              onError={setError}
              wide
            />
            <TextField
              label="Image alt text"
              value={form.altText}
              onChange={(value) => setForm({ ...form, altText: value })}
            />
            <TextField
              label="Display order"
              type="number"
              value={form.sortOrder}
              onChange={(value) => setForm({ ...form, sortOrder: Number(value) })}
            />
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active slide
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save banner</button>
            </div>
          </form>
        </Editor>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            <div className="flex h-40 items-center justify-center bg-surface">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.altText || item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <StatusBadge status={item.active ? "active" : "inactive"} />
              </div>
              <div className="mt-4 flex justify-end">
                <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

function ProductsView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [categories, setCategories] = useState<RecordItem[]>([]);
  const [categoryEditing, setCategoryEditing] = useState<RecordItem | null>(null);
  const blank = {
    name: "",
    slug: "",
    category: "",
    subtitle: "",
    description: "",
    highlightsText: "",
    price: "",
    dpPrice: "",
    netContent: "",
    stockQuantity: "",
    isServiceable: true,
    imageUrl: "",
    status: "draft",
    sortOrder: 0,
  };
  const blankCategory = { name: "", slug: "", sortOrder: 0 };
  const [form, setForm] = useState<RecordItem>(blank);
  const [categoryForm, setCategoryForm] = useState<RecordItem>(blankCategory);
  const load = () =>
    Promise.all([api("/api/admin/products"), api("/api/admin/product-categories")])
      .then(([rows, categoryRows]) => {
        setItems(rows);
        setCategories(categoryRows);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  function open(item?: RecordItem) {
    setEditing(item || {});
    setForm(
      item
        ? {
            ...item,
            highlightsText: (item.highlights || []).join("\n"),
            isServiceable: item.isServiceable === undefined ? true : Boolean(item.isServiceable),
          }
        : blank,
    );
  }
  function openCategory(item?: RecordItem) {
    setCategoryEditing(item || {});
    setCategoryForm(
      item
        ? { name: item.name || "", slug: item.slug || "", sortOrder: item.sortOrder || 0 }
        : blankCategory,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing?.id ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.price === "" ? null : Number(form.price),
          dpPrice: form.dpPrice === "" ? null : Number(form.dpPrice),
          netContent: form.netContent === "" ? null : String(form.netContent).trim(),
          stockQuantity: form.stockQuantity === "" ? null : Number(form.stockQuantity),
          isServiceable: Boolean(form.isServiceable),
          highlights: String(form.highlightsText || "")
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    try {
      await api(
        categoryEditing?.id
          ? `/api/admin/product-categories/${categoryEditing.id}`
          : "/api/admin/product-categories",
        {
          method: categoryEditing?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        },
      );
      setCategoryEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function removeCategory(id: number) {
    if (!confirm("Delete this product category? Products must be moved first.")) return;
    try {
      await api(`/api/admin/product-categories/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const categoryOptions = Array.from(
    new Set([...categories.map((category) => category.name), form.category].filter(Boolean)),
  );
  return (
    <ModuleShell
      title="Products"
      description="Manage the product catalogue shown to customers and distributors."
      action={
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openCategory()} className={buttonSecondary}>
            <Plus className="h-4 w-4" /> Add category
          </button>
          <button onClick={() => open()} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      }
    >
      {categoryEditing && (
        <Editor
          title={categoryEditing.id ? "Edit product category" : "New product category"}
          onClose={() => setCategoryEditing(null)}
        >
          <form onSubmit={saveCategory} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Category name"
              value={categoryForm.name}
              onChange={(value) =>
                setCategoryForm({
                  ...categoryForm,
                  name: value,
                  ...(categoryEditing.id
                    ? {}
                    : {
                        slug: value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      }),
                })
              }
              required
            />
            <TextField
              label="Slug"
              value={categoryForm.slug}
              onChange={(value) => setCategoryForm({ ...categoryForm, slug: value })}
              required
            />
            <TextField
              label="Display order"
              type="number"
              value={categoryForm.sortOrder}
              onChange={(value) => setCategoryForm({ ...categoryForm, sortOrder: Number(value) })}
            />
            <p className="self-end pb-2 text-xs text-muted-foreground">
              Categories appear in the navbar and Products page after saving.
            </p>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setCategoryEditing(null)}
              >
                Cancel
              </button>
              <button className={buttonPrimary}>Save category</button>
            </div>
          </form>
        </Editor>
      )}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Product categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create categories here, then select them while adding or editing products.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {categories.length} categories
          </span>
        </div>
        <div className="mt-4">
          {categories.length ? (
            <DataTable headers={["Category", "Slug", "Products", "Order", "Actions"]}>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {Number(category.productCount || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{category.sortOrder}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => openCategory(category)}
                      onDelete={() => removeCategory(category.id)}
                    />
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState label="No categories yet. Add your first product category." />
          )}
        </div>
      </div>
      {editing && (
        <Editor
          title={editing.id ? "Edit product" : "New product"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Product name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <SelectField
              label="Category"
              value={form.category || ""}
              options={["", ...categoryOptions]}
              onChange={(value) => setForm({ ...form, category: value })}
            />
            <TextField
              label="MRP"
              type="number"
              value={form.price}
              onChange={(value) => setForm({ ...form, price: value })}
            />
            <TextField
              label="DP price"
              type="number"
              value={form.dpPrice}
              onChange={(value) => setForm({ ...form, dpPrice: value })}
            />
            <TextField
              label="Net quantity / content"
              value={form.netContent}
              onChange={(value) => setForm({ ...form, netContent: value })}
              placeholder="500 ml per bottle, 1 piece, 1 set"
            />
            <TextField
              label="Stock quantity"
              type="number"
              value={form.stockQuantity}
              onChange={(value) => setForm({ ...form, stockQuantity: value })}
            />
            <CheckboxField
              label="Serviceable for customer delivery"
              checked={form.isServiceable !== false}
              onChange={(checked) => setForm({ ...form, isServiceable: checked })}
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(value) => setForm({ ...form, subtitle: value })}
              wide
            />
            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              wide
            />
            <TextAreaField
              label="Highlights (one per line)"
              value={form.highlightsText}
              onChange={(value) => setForm({ ...form, highlightsText: value })}
            />
            <ImageUploadField
              label="Product image"
              value={form.imageUrl}
              onChange={(value) => setForm({ ...form, imageUrl: value })}
              onError={setError}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["draft", "published"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save product</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable
        headers={[
          "Product",
          "Category",
          "MRP / DP",
          "Net content",
          "Availability",
          "Status",
          "Actions",
        ]}
      >
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">/{item.slug}</p>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">{item.category || "—"}</td>
            <td className="px-4 py-4 text-sm">
              <div>MRP: {item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "—"}</div>
              <div className="text-xs text-muted-foreground">
                DP: {item.dpPrice ? `₹${Number(item.dpPrice).toLocaleString("en-IN")}` : "—"}
              </div>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">{item.netContent || "—"}</td>
            <td className="px-4 py-4 text-sm">
              <div>
                {item.stockQuantity === null || item.stockQuantity === undefined
                  ? "Stock not tracked"
                  : `${item.stockQuantity} available`}
              </div>
              <div
                className={`text-xs ${item.isServiceable === false ? "text-destructive" : "text-secondary"}`}
              >
                {item.isServiceable === false ? "Not serviceable" : "Serviceable"}
              </div>
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function EventsView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const blank = {
    title: "",
    slug: "",
    description: "",
    eventDate: "",
    city: "",
    eventType: "",
    seats: 0,
    registrationUrl: "",
    status: "published",
    sortOrder: 0,
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api("/api/admin/events")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  function open(item?: RecordItem) {
    setEditing(item || {});
    setForm(item ? { ...item } : blank);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing?.id ? `/api/admin/events/${editing.id}` : "/api/admin/events", {
        method: editing?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          seats: Number(form.seats || 0),
          sortOrder: Number(form.sortOrder || 0),
        }),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      await api(`/api/admin/events/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ModuleShell
      title="Events"
      description="Create and manage seminars, launches, business meets and recognition events shown on the public Events page."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Add event
        </button>
      }
    >
      {editing && (
        <Editor title={editing.id ? "Edit event" : "New event"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Event title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <TextField
              label="Date"
              type="date"
              value={form.eventDate}
              onChange={(value) => setForm({ ...form, eventDate: value })}
              required
            />
            <TextField
              label="City"
              value={form.city}
              onChange={(value) => setForm({ ...form, city: value })}
              required
            />
            <TextField
              label="Event type"
              value={form.eventType}
              onChange={(value) => setForm({ ...form, eventType: value })}
              placeholder="Seminar, Launch, Business Meet"
              required
            />
            <TextField
              label="Seats"
              type="number"
              value={form.seats}
              onChange={(value) => setForm({ ...form, seats: Number(value) })}
            />
            <TextField
              label="Registration URL"
              value={form.registrationUrl}
              onChange={(value) => setForm({ ...form, registrationUrl: value })}
              wide
              placeholder="https://..."
            />
            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              wide
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["published", "draft"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <TextField
              label="Display order"
              type="number"
              value={form.sortOrder}
              onChange={(value) => setForm({ ...form, sortOrder: Number(value) })}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save event</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable headers={["Event", "Date / location", "Status", "Actions"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.eventType}</p>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {item.eventDate} • {item.city}
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function BlogView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const blank = {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    featuredImage: "",
    imageAlt: "",
    author: "",
    category: "",
    tagsText: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
    publishedAt: "",
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api("/api/admin/blog-posts")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  function open(item?: RecordItem) {
    setEditing(item || {});
    setForm(item ? { ...item, tagsText: (item.tags || []).join(", ") } : blank);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing?.id ? `/api/admin/blog-posts/${editing.id}` : "/api/admin/blog-posts", {
        method: editing?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: String(form.tagsText || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this article?")) return;
    try {
      await api(`/api/admin/blog-posts/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Blog / insights"
      description="Create, edit and publish articles with SEO metadata."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Add article
        </button>
      }
    >
      {editing && (
        <Editor
          title={editing.id ? "Edit article" : "New article"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <TextField
              label="Author"
              value={form.author}
              onChange={(value) => setForm({ ...form, author: value })}
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
            />
            <TextAreaField
              label="Excerpt"
              value={form.excerpt}
              onChange={(value) => setForm({ ...form, excerpt: value })}
              wide
            />
            <TextAreaField
              label="Body"
              value={form.body}
              onChange={(value) => setForm({ ...form, body: value })}
              wide
              rows={8}
            />
            <ImageUploadField
              label="Featured image"
              value={form.featuredImage}
              onChange={(value) => setForm({ ...form, featuredImage: value })}
              onError={setError}
            />
            <TextField
              label="Image alt text"
              value={form.imageAlt}
              onChange={(value) => setForm({ ...form, imageAlt: value })}
            />
            <TextField
              label="Tags (comma-separated)"
              value={form.tagsText}
              onChange={(value) => setForm({ ...form, tagsText: value })}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["draft", "scheduled", "published"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <TextField
              label="SEO title"
              value={form.seoTitle}
              onChange={(value) => setForm({ ...form, seoTitle: value })}
            />
            <TextField
              label="SEO description"
              value={form.seoDescription}
              onChange={(value) => setForm({ ...form, seoDescription: value })}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save article</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable headers={["Article", "Category", "Status", "Updated", "Actions"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">/{item.slug}</p>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">{item.category || "—"}</td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {new Date(item.updatedAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function DistributorsView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [networkItems, setNetworkItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const blank = {
    distributorCode: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    sponsorCode: "",
    status: "active",
    notes: "",
  };
  const [form, setForm] = useState<RecordItem>(blank);

  const load = () =>
    Promise.all([
      api(`/api/admin/distributors?search=${encodeURIComponent(search)}`),
      api("/api/admin/distributor-network"),
    ])
      .then(([filtered, network]) => {
        setItems(filtered);
        setNetworkItems(network);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [search]);
  function open(item?: RecordItem) {
    setEditing(item || null);
    setEditorOpen(true);
    setForm(
      item
        ? {
            distributorCode: item.distributor_code || item.distributorCode || "",
            name: item.name || "",
            email: item.email || "",
            phone: item.phone || "",
            city: item.city || "",
            sponsorCode: item.sponsor_code || item.sponsorCode || "",
            status: item.status || "active",
            notes: item.notes || "",
          }
        : blank,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/distributors/${editing.id}` : "/api/admin/distributors", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
      setEditorOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this distributor and its transaction history?")) return;
    try {
      await api(`/api/admin/distributors/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function renewMembership(item: RecordItem) {
    if (!confirm(`Record ₹599 annual membership renewal for ${item.name}?`)) return;
    try {
      await api(`/api/admin/distributors/${item.id}/membership/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "admin_recorded" }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const teamMembers = (() => {
    if (!editing || !form.distributorCode) return [];
    const bySponsor = new Map<string, RecordItem[]>();
    networkItems.forEach((item) => {
      const sponsor = String(item.sponsor_code || item.sponsorCode || "").toUpperCase();
      const members = bySponsor.get(sponsor) || [];
      members.push(item);
      bySponsor.set(sponsor, members);
    });
    const result: Array<{ item: RecordItem; level: number }> = [];
    const visited = new Set<number>();
    function collect(sponsorCode: string, level: number) {
      (bySponsor.get(sponsorCode.toUpperCase()) || []).forEach((item) => {
        const id = Number(item.id);
        if (visited.has(id)) return;
        visited.add(id);
        result.push({ item, level });
        collect(String(item.distributor_code || item.distributorCode || ""), level + 1);
      });
    }
    collect(form.distributorCode, 1);
    return result;
  })();
  return (
    <ModuleShell
      title="Distributors & ID accounts"
      description="Maintain distributor IDs, contact details and the live totals calculated from their transaction ledger."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" /> Add distributor
        </button>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative block max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${fieldClass} mt-0 pl-9`}
            placeholder="Search ID, name, phone or email"
          />
        </label>
        <p className="self-center text-sm text-muted-foreground">
          {items.length} distributor{items.length === 1 ? "" : "s"}
        </p>
      </div>
      {editorOpen && (
        <Editor
          title={editing ? "Edit distributor" : "Add distributor"}
          onClose={() => {
            setEditing(null);
            setEditorOpen(false);
          }}
        >
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3.5 py-2.5">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Distributor ID / Sponsor ID
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {editing ? form.distributorCode : "Auto-generated after saving"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this ID when another distributor joins under this account.
              </p>
            </div>
            <TextField
              label="Full name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />
            <TextField
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <TextField
              label="City"
              value={form.city}
              onChange={(value) => setForm({ ...form, city: value })}
            />
            <TextField
              label="Parent Sponsor ID (optional for top-level)"
              value={form.sponsorCode}
              onChange={(value) => setForm({ ...form, sponsorCode: value })}
            />
            <p className="-mt-3 text-xs text-muted-foreground sm:col-span-2">
              Enter the existing distributor ID whose team this distributor should join. Leave blank
              only for a top-level distributor.
            </p>
            {editing && (
              <div className="rounded-xl border border-border bg-surface p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                      All distributors under this ID
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Direct and downstream chain members connected to {form.distributorCode}.
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {teamMembers.length} total
                  </span>
                </div>
                {teamMembers.length ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {teamMembers.map(({ item: member, level }) => (
                      <div
                        key={member.id}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <span className="text-[11px] font-semibold text-primary">
                            Level {level}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {member.distributor_code || member.distributorCode}
                          {member.username ? ` · @${member.username}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-primary">{member.status || "active"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
                    No distributor has joined directly under this ID yet.
                  </p>
                )}
              </div>
            )}
            <SelectField
              label="Account status"
              value={form.status}
              options={["active", "inactive", "blocked"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <TextAreaField
              label="Notes"
              value={form.notes}
              onChange={(value) => setForm({ ...form, notes: value })}
              wide
              rows={3}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => {
                  setEditing(null);
                  setEditorOpen(false);
                }}
              >
                Cancel
              </button>
              <button className={buttonPrimary}>Save distributor</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable
        headers={[
          "Distributor",
          "Sponsor / Team",
          "Contact",
          "IDs purchased",
          "Level",
          "Membership",
          "Paid",
          "Pending",
          "Income",
          "Status",
          "Actions",
        ]}
      >
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.distributor_code}</p>
              <p className="mt-1 text-xs text-primary">@{item.username || "no login yet"}</p>
            </td>
            <td className="px-4 py-4 text-sm">
              <p className="font-semibold text-foreground">
                {item.sponsorName || "Top-level distributor"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.sponsorDistributorCode || "No sponsor ID"}
              </p>
              <p className="mt-1 text-xs text-primary">
                {Number(item.directTeamCount || 0)} direct under this ID
              </p>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              <p>{item.phone || "—"}</p>
              <p>{item.city || item.email || ""}</p>
            </td>
            <td className="px-4 py-4 font-semibold">
              {Number(item.totalIds || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4">
              <p className="font-semibold text-primary">
                {item.completedLevel ? `Level ${item.completedLevel}` : "Not passed"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.remainingIds
                  ? `${Number(item.remainingIds).toLocaleString("en-IN")} IDs to next`
                  : "Top level reached"}
              </p>
            </td>
            <td className="px-4 py-4">
              <p className="font-semibold text-primary">
                ₹{Number(item.membershipAmount || 599).toLocaleString("en-IN")} / year
              </p>
              <div className="mt-1">
                <StatusBadge status={item.membershipCurrentStatus || "not_started"} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.membershipExpiresAt
                  ? `Expires ${new Date(item.membershipExpiresAt).toLocaleDateString("en-IN")}`
                  : "No membership recorded"}
              </p>
              <p className="text-xs text-muted-foreground">
                Payment: {item.membershipPaymentStatus || "pending"}
              </p>
            </td>
            <td className="px-4 py-4 text-sm">
              Rs {Number(item.totalPaid || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4 text-sm text-amber-700">
              Rs {Number(item.totalPending || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4 text-sm">
              Rs {Number(item.totalIncome || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-col items-start gap-2">
                <button
                  onClick={() => void renewMembership(item)}
                  className="rounded-lg border border-secondary/30 px-2.5 py-1.5 text-[11px] font-semibold text-secondary hover:bg-secondary/10"
                >
                  {item.membershipPaymentStatus === "pending" &&
                  item.membershipCurrentStatus === "active"
                    ? "Mark paid ₹599"
                    : "Renew ₹599"}
                </button>
                <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!items.length && (
        <div className="mt-4">
          <EmptyState label="No distributors found. Add the first distributor ID to start tracking accounts." />
        </div>
      )}
      <AdminNetworkTree items={networkItems} />
    </ModuleShell>
  );
}

function AdminNetworkTree({ items }: { items: RecordItem[] }) {
  if (!items.length) return null;
  const bySponsor = new Map<string, RecordItem[]>();
  const knownCodes = new Set(
    items.map((item) => String(item.distributor_code || "").toUpperCase()),
  );
  items.forEach((item) => {
    const sponsor = String(item.sponsor_code || "").toUpperCase();
    const children = bySponsor.get(sponsor) || [];
    children.push(item);
    bySponsor.set(sponsor, children);
  });
  const roots = items.filter((item) => {
    const sponsor = String(item.sponsor_code || "").toUpperCase();
    return !sponsor || !knownCodes.has(sponsor);
  });

  function branch(item: RecordItem, depth: number, visited: Set<number>): ReactNode {
    if (visited.has(Number(item.id)) || depth > 15) return null;
    const nextVisited = new Set(visited).add(Number(item.id));
    const code = String(item.distributor_code || "").toUpperCase();
    const children = bySponsor.get(code) || [];
    return (
      <div key={`${item.id}-${depth}`} className={depth ? "border-l border-primary/20 pl-4" : ""}>
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {item.name}{" "}
              <span className="font-normal text-muted-foreground">({item.distributor_code})</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.username ? `@${item.username}` : "No login account"} •{" "}
              {item.city || "City not added"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              {depth ? `Level ${depth}` : "Top level"}
            </span>
            <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-semibold text-secondary">
              {children.length} direct
            </span>
            <span className="text-muted-foreground">
              {Number(item.totalIds || 0).toLocaleString("en-IN")} IDs
            </span>
          </div>
        </div>
        {children.length ? (
          <div className="mt-2 space-y-2">
            {children.map((child) => branch(child, depth + 1, nextVisited))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Network hierarchy
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold">All distributor chains</h3>
        </div>
        <p className="text-sm text-muted-foreground">{items.length} accounts in the network</p>
      </div>
      <div className="mt-5 space-y-3">
        {roots.map((item) => branch(item, 0, new Set<number>()))}
      </div>
    </div>
  );
}

function TransactionsView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [distributors, setDistributors] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [distributorFilter, setDistributorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const blank = {
    distributorId: "",
    transactionType: "id_purchase",
    referenceNo: "",
    idCount: "0",
    packageLevel: "",
    packageValue: "",
    amount: "0",
    paymentMethod: "cash",
    paymentStatus: "pending",
    transactionDate: new Date().toISOString().slice(0, 10),
    notes: "",
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const loadDistributors = () =>
    api("/api/admin/distributors")
      .then(setDistributors)
      .catch((e) => setError(e.message));
  const load = () => {
    const params = new URLSearchParams();
    if (distributorFilter !== "all") params.set("distributorId", distributorFilter);
    if (typeFilter !== "all") params.set("transactionType", typeFilter);
    if (statusFilter !== "all") params.set("paymentStatus", statusFilter);
    api(`/api/admin/transactions${params.toString() ? `?${params.toString()}` : ""}`)
      .then(setItems)
      .catch((e) => setError(e.message));
  };
  useEffect(() => {
    loadDistributors();
  }, []);
  useEffect(() => {
    load();
  }, [distributorFilter, typeFilter, statusFilter]);
  function open(item?: RecordItem) {
    setEditing(item || null);
    setForm(
      item
        ? {
            distributorId: String(item.distributor_id || item.distributorId || ""),
            transactionType: item.transaction_type || item.transactionType || "id_purchase",
            referenceNo: item.reference_no || item.referenceNo || "",
            idCount: String(item.id_count ?? item.idCount ?? 0),
            packageLevel: item.package_level ?? item.packageLevel ?? "",
            packageValue: item.package_value ?? item.packageValue ?? "",
            amount: item.amount ?? 0,
            paymentMethod: item.payment_method || item.paymentMethod || "cash",
            paymentStatus: item.payment_status || item.paymentStatus || "pending",
            transactionDate: String(item.transaction_date || item.transactionDate || "").slice(
              0,
              10,
            ),
            notes: item.notes || "",
          }
        : { ...blank, distributorId: distributors[0]?.id ? String(distributors[0].id) : "" },
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/transactions/${editing.id}` : "/api/admin/transactions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          distributorId: Number(form.distributorId),
          idCount: Number(form.idCount || 0),
          packageLevel: form.packageLevel === "" ? null : Number(form.packageLevel),
          packageValue: form.packageValue === "" ? null : Number(form.packageValue),
          amount: Number(form.amount || 0),
        }),
      });
      setEditing(null);
      await Promise.all([load(), loadDistributors()]);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this transaction record?")) return;
    try {
      await api(`/api/admin/transactions/${id}`, { method: "DELETE" });
      await Promise.all([load(), loadDistributors()]);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const totalIds = items.reduce((sum, item) => sum + Number(item.id_count || 0), 0);
  const paid = items
    .filter((item) => item.payment_status === "paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = items
    .filter((item) => item.payment_status === "pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <ModuleShell
      title="Transactions & payments"
      description="Record every ID purchase, distributor package payment, income, refund and adjustment. Mark a pending package as paid to activate that distributor account."
      action={
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/transactions/export" className={buttonSecondary}>
            Export CSV <ArrowUpRight className="h-4 w-4" />
          </a>
          <button onClick={() => open()} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Add transaction
          </button>
        </div>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Filtered IDs", totalIds, "text-primary"],
          ["Paid amount", `Rs ${paid.toLocaleString("en-IN")}`, "text-secondary"],
          ["Pending amount", `Rs ${pending.toLocaleString("en-IN")}`, "text-amber-700"],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </p>
            <p className={`mt-2 font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <label className="block text-sm font-semibold">
          Distributor
          <select
            value={distributorFilter}
            onChange={(event) => setDistributorFilter(event.target.value)}
            className={fieldClass}
          >
            <option value="all">All distributors</option>
            {distributors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.distributor_code} — {item.name}
              </option>
            ))}
          </select>
        </label>
        <SelectField
          label="Transaction type"
          value={typeFilter}
          options={["all", "id_purchase", "payment", "income", "refund", "adjustment"]}
          onChange={setTypeFilter}
        />
        <SelectField
          label="Payment status"
          value={statusFilter}
          options={["all", "pending", "paid", "failed", "refunded"]}
          onChange={setStatusFilter}
        />
      </div>
      {editing && (
        <Editor
          title={editing ? "Edit transaction" : "Add transaction"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold sm:col-span-2">
              Distributor
              <select
                value={form.distributorId}
                onChange={(event) => setForm({ ...form, distributorId: event.target.value })}
                className={fieldClass}
                required
              >
                <option value="">Select distributor</option>
                {distributors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.distributor_code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
            <SelectField
              label="Transaction type"
              value={form.transactionType}
              options={["id_purchase", "payment", "income", "refund", "adjustment"]}
              onChange={(value) => setForm({ ...form, transactionType: value })}
            />
            <SelectField
              label="Payment status"
              value={form.paymentStatus}
              options={["pending", "paid", "failed", "refunded"]}
              onChange={(value) => setForm({ ...form, paymentStatus: value })}
            />
            <TextField
              label="Transaction date"
              type="date"
              value={form.transactionDate}
              onChange={(value) => setForm({ ...form, transactionDate: value })}
              required
            />
            <TextField
              label="Reference / receipt no."
              value={form.referenceNo}
              onChange={(value) => setForm({ ...form, referenceNo: value })}
            />
            <TextField
              label="ID count"
              type="number"
              value={form.idCount}
              onChange={(value) => setForm({ ...form, idCount: value })}
            />
            <TextField
              label="Package level"
              type="number"
              value={form.packageLevel}
              onChange={(value) => setForm({ ...form, packageLevel: value })}
            />
            <TextField
              label="Package value"
              type="number"
              value={form.packageValue}
              onChange={(value) => setForm({ ...form, packageValue: value })}
            />
            <TextField
              label="Amount (Rs)"
              type="number"
              value={form.amount}
              onChange={(value) => setForm({ ...form, amount: value })}
              required
            />
            <TextField
              label="Payment method"
              value={form.paymentMethod}
              onChange={(value) => setForm({ ...form, paymentMethod: value })}
            />
            <TextAreaField
              label="Notes"
              value={form.notes}
              onChange={(value) => setForm({ ...form, notes: value })}
              wide
              rows={3}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save transaction</button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable
        headers={[
          "Date",
          "Distributor",
          "Type",
          "IDs / Level",
          "Amount",
          "Status",
          "Method",
          "Actions",
        ]}
      >
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {new Date(item.transaction_date).toLocaleDateString("en-IN")}
            </td>
            <td className="px-4 py-4">
              <p className="font-semibold">{item.distributorName}</p>
              <p className="text-xs text-muted-foreground">{item.distributorCode}</p>
            </td>
            <td className="px-4 py-4 text-sm capitalize">
              {item.transaction_type.replace("_", " ")}
            </td>
            <td className="px-4 py-4 text-sm">
              {item.id_count || 0}
              {item.package_level ? ` / L${item.package_level}` : ""}
            </td>
            <td className="px-4 py-4 text-sm font-semibold">
              Rs {Number(item.amount || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={item.payment_status} />
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {item.payment_method || "—"}
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
      {!items.length && (
        <div className="mt-4">
          <EmptyState label="No transactions found for the selected filters." />
        </div>
      )}
    </ModuleShell>
  );
}

function GalleryView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const blank = {
    title: "",
    tag: "Events",
    imageUrl: "",
    altText: "",
    status: "published",
    sortOrder: 0,
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api("/api/admin/gallery")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  function open(item?: RecordItem) {
    setEditing(item || null);
    setForm(
      item
        ? {
            title: item.title || "",
            tag: item.tag || "General",
            imageUrl: item.imageUrl || "",
            altText: item.altText || "",
            status: item.status || "published",
            sortOrder: item.sortOrder || 0,
          }
        : blank,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder || 0) }),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this gallery item?")) return;
    try {
      await api(`/api/admin/gallery/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Gallery manager"
      description="Manage gallery photos, categories, captions and publishing status. Upload each image directly while creating or editing the item."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" /> Add gallery item
        </button>
      }
    >
      {editing && (
        <Editor
          title={editing ? "Edit gallery item" : "Add gallery item"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Category / tag"
              value={form.tag}
              onChange={(value) => setForm({ ...form, tag: value })}
              required
            />
            <ImageUploadField
              label="Gallery image"
              value={form.imageUrl}
              onChange={(value) => setForm({ ...form, imageUrl: value })}
              onError={setError}
              wide
              required
            />
            <TextField
              label="Alt text"
              value={form.altText}
              onChange={(value) => setForm({ ...form, altText: value })}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["published", "draft"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <TextField
              label="Sort order"
              type="number"
              value={form.sortOrder}
              onChange={(value) => setForm({ ...form, sortOrder: value })}
            />
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={buttonPrimary}>Save gallery item</button>
            </div>
          </form>
        </Editor>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            <img
              src={item.imageUrl}
              alt={item.altText || item.title}
              className="h-44 w-full object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.tag}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => open(item)} className={buttonSecondary}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="rounded-xl border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="mt-4">
          <EmptyState label="No gallery records yet. Add a gallery item after uploading an image." />
        </div>
      )}
    </ModuleShell>
  );
}

function EnquiriesView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [status, setStatus] = useState("all");
  const load = () =>
    api(`/api/admin/enquiries${status === "all" ? "" : `?status=${status}`}`)
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [status]);
  async function update(item: RecordItem, next: string) {
    try {
      await api(`/api/admin/enquiries/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, internalNotes: item.internal_notes || "" }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Contact enquiries"
      description="Review and manage enquiries from contact, distributor and franchise forms."
      action={
        <a href="/api/admin/enquiries/export" className={buttonSecondary}>
          Export CSV <ArrowUpRight className="h-4 w-4" />
        </a>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", "new", "in_progress", "contacted", "closed"].map((value) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${status === value ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground"}`}
          >
            {value.replace("_", " ")}
          </button>
        ))}
      </div>
      <DataTable headers={["Contact", "Type", "Message", "Status", "Received"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.email || item.phone || "No contact details"}
              </p>
            </td>
            <td className="px-4 py-4 text-sm capitalize">
              {item.enquiry_type === "other" &&
              String(item.message || "").startsWith("Event registration:")
                ? "Event registration"
                : item.enquiry_type}
            </td>
            <td className="max-w-sm px-4 py-4 text-sm text-muted-foreground">
              {item.message || "—"}
            </td>
            <td className="px-4 py-4">
              <select
                value={item.status}
                onChange={(e) => update(item, e.target.value)}
                className="rounded-lg border border-border bg-card px-2 py-2 text-xs"
              >
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </td>
            <td className="px-4 py-4 text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function OrdersView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [status, setStatus] = useState("all");
  const load = () =>
    api(`/api/admin/orders${status === "all" ? "" : `?status=${status}`}`)
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [status]);

  async function update(item: RecordItem, next: string) {
    try {
      await api(`/api/admin/orders/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ModuleShell
      title="Customer orders"
      description="Review shipping details, totals and fulfilment status for customer orders."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
          (value) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${status === value ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground"}`}
            >
              {value}
            </button>
          ),
        )}
      </div>
      <DataTable headers={["Order / customer", "Items", "Shipping", "Total", "Status", "Date"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border align-top">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.orderNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.customerName}</p>
              <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
            </td>
            <td className="px-4 py-4 text-sm">{item.itemCount}</td>
            <td className="px-4 py-4 text-sm">
              <p>{item.shippingName}</p>
              <p className="text-xs text-muted-foreground">
                {item.shippingCity}, {item.shippingState} {item.shippingPostalCode}
              </p>
              <p className="text-xs text-muted-foreground">{item.shippingPhone}</p>
            </td>
            <td className="px-4 py-4 text-sm font-bold text-primary">
              ₹{Number(item.total || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-4">
              <select
                value={item.status}
                onChange={(event) => void update(item, event.target.value)}
                className="rounded-lg border border-border bg-card px-2 py-2 text-xs capitalize"
              >
                {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </td>
            <td className="px-4 py-4 text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </DataTable>
      {!items.length && <EmptyState label="No customer orders found." />}
    </ModuleShell>
  );
}

function DownloadsView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const blank = {
    title: "",
    slug: "",
    description: "",
    fileType: "",
    status: "published",
    sortOrder: 0,
  };
  const [form, setForm] = useState<RecordItem>(blank);
  const load = () =>
    api("/api/admin/downloads")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  function open(item?: RecordItem) {
    setEditing(item || {});
    setForm(item ? { ...item, fileType: item.fileType || "" } : blank);
    setFile(null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("slug", form.slug);
      payload.append("description", form.description || "");
      payload.append("fileType", form.fileType || "");
      payload.append("status", form.status);
      payload.append("sortOrder", String(form.sortOrder || 0));
      if (file) payload.append("file", file);
      await api(editing?.id ? `/api/admin/downloads/${editing.id}` : "/api/admin/downloads", {
        method: editing?.id ? "PUT" : "POST",
        body: payload,
      });
      setEditing(null);
      setFile(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this download?")) return;
    try {
      await api(`/api/admin/downloads/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ModuleShell
      title="Downloads"
      description="Add, edit, delete and publish PDFs or other files shown on the public Downloads page."
      action={
        <button onClick={() => open()} className={buttonPrimary}>
          <Plus className="h-4 w-4" />
          Add download
        </button>
      }
    >
      {editing && (
        <Editor
          title={editing.id ? "Edit download" : "New download"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              wide
            />
            <TextField
              label="File type"
              value={form.fileType}
              onChange={(value) => setForm({ ...form, fileType: value.toUpperCase() })}
              placeholder="PDF, XLSX, PPTX"
            />
            <TextField
              label="Display order"
              type="number"
              value={form.sortOrder}
              onChange={(value) => setForm({ ...form, sortOrder: Number(value) })}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["draft", "published"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <label className="text-sm font-semibold sm:col-span-2">
              {editing.id ? "Replace file (optional)" : "File (optional for later upload)"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.7z,.jpg,.jpeg,.png,.webp,.gif"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white`}
              />
              {editing.fileName && (
                <span className="mt-2 block text-xs font-normal text-muted-foreground">
                  Current file: {editing.fileName}
                </span>
              )}
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={buttonSecondary} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button disabled={saving} className={buttonPrimary}>
                <Upload className="h-4 w-4" />
                {saving ? "Saving…" : "Save download"}
              </button>
            </div>
          </form>
        </Editor>
      )}
      <DataTable headers={["Download", "File", "Status", "Actions"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">/{item.slug}</p>
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {item.fileName || "No file uploaded"}
              {item.sizeLabel ? ` • ${item.sizeLabel}` : ""}
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-4">
              <RowActions onEdit={() => open(item)} onDelete={() => remove(item.id)} />
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function MediaView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = () =>
    api("/api/admin/media")
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("altText", altText);
      await api("/api/admin/media", { method: "POST", body: form });
      setFile(null);
      setAltText("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function remove(id: number) {
    if (!confirm("Delete this media asset?")) return;
    try {
      await api(`/api/admin/media/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <ModuleShell
      title="Media library"
      description="Upload and manage reusable images, videos and PDFs used across the website."
    >
      <form
        onSubmit={upload}
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm font-semibold">
          Image, video or PDF
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white`}
            required
          />
        </label>
        <label className="flex-1 text-sm font-semibold">
          Alt text
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className={fieldClass}
            placeholder="Describe the image or video"
          />
        </label>
        <button disabled={uploading} className={buttonPrimary}>
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload asset"}
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            {item.mimeType?.startsWith("image/") ? (
              <img
                src={item.url}
                alt={item.altText || item.originalName}
                className="h-36 w-full object-cover"
              />
            ) : item.mimeType?.startsWith("video/") ? (
              <video
                controls
                preload="metadata"
                className="h-36 w-full bg-primary-dark object-contain"
              >
                <source src={item.url} type={item.mimeType} />
              </video>
            ) : (
              <div className="flex h-36 items-center justify-center bg-surface">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="p-4">
              <p className="truncate text-sm font-semibold">{item.originalName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(item.sizeBytes / 1024)} KB
              </p>
              {item.storedInDatabase && (
                <p className="mt-1 text-xs font-semibold text-secondary">Database copy saved</p>
              )}
              <button
                onClick={() => remove(item.id)}
                className="mt-3 text-xs font-semibold text-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

function SettingsView({ setError }: { setError: (value: string) => void }) {
  const [settings, setSettings] = useState<RecordItem>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api("/api/admin/settings")
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const update = (key: string, value: string) => setSettings({ ...settings, [key]: value });
  return (
    <ModuleShell
      title="Website settings"
      description="Update global brand, hero and SEO defaults used by the public website."
    >
      <form
        onSubmit={save}
        className="max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Company name"
            value={settings.company_name || ""}
            onChange={(value) => update("company_name", value)}
            wide
          />
          <TextField
            label="Hero CTA label"
            value={settings.hero_cta_label || ""}
            onChange={(value) => update("hero_cta_label", value)}
          />
          <TextField
            label="Hero CTA URL"
            value={settings.hero_cta_url || ""}
            onChange={(value) => update("hero_cta_url", value)}
          />
          <TextAreaField
            label="Hero title"
            value={settings.hero_title || ""}
            onChange={(value) => update("hero_title", value)}
            wide
          />
          <TextAreaField
            label="Hero description"
            value={settings.hero_description || ""}
            onChange={(value) => update("hero_description", value)}
            wide
          />
          <TextField
            label="Default SEO title"
            value={settings.default_seo_title || ""}
            onChange={(value) => update("default_seo_title", value)}
            wide
          />
          <TextAreaField
            label="Default SEO description"
            value={settings.default_seo_description || ""}
            onChange={(value) => update("default_seo_description", value)}
            wide
          />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button className={buttonPrimary}>Save settings</button>
          {saved && (
            <span className="flex items-center gap-2 text-sm font-medium text-secondary">
              <CheckCircle2 className="h-4 w-4" />
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </ModuleShell>
  );
}

function ActivityView({ setError }: { setError: (value: string) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  useEffect(() => {
    api("/api/admin/activity-logs")
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <ModuleShell
      title="Activity logs"
      description="An audit trail of administrator actions and content changes."
    >
      <DataTable headers={["Action", "Entity", "User", "Time"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-border">
            <td className="px-4 py-4 font-semibold capitalize">{item.action}</td>
            <td className="px-4 py-4 text-sm">
              {item.entityType.replace("_", " ")} {item.entityId ? `#${item.entityId}` : ""}
            </td>
            <td className="px-4 py-4 text-sm text-muted-foreground">{item.userName || "System"}</td>
            <td className="px-4 py-4 text-sm text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </ModuleShell>
  );
}

function ModuleShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
function Editor({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-card p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-accent"
          aria-label="Close editor"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
  onError,
  wide = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onError: (value: string) => void;
  wide?: boolean;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleChange(file: File | undefined) {
    if (!file) return;
    try {
      setUploading(true);
      onError("");
      const uploaded = await uploadAdminImage(file);
      onChange(uploaded.url);
      setFileName(file.name);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className={`block text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="mt-1.5 rounded-xl border border-dashed border-primary/35 bg-primary/5 p-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => void handleChange(event.target.files?.[0])}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          required={required && !value}
          disabled={uploading}
        />
        <div className="mt-2 flex items-center gap-3">
          {value && (
            <img
              src={value}
              alt="Selected upload preview"
              className="h-12 w-16 rounded-lg object-cover"
            />
          )}
          <p className="text-xs text-muted-foreground">
            {uploading
              ? "Uploading image…"
              : fileName
                ? `${fileName} uploaded`
                : value
                  ? "Current image saved. Choose a new file to replace it."
                  : "Choose an image to upload."}
          </p>
        </div>
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
  required = false,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`block text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
        required={required}
      />
    </label>
  );
}
function TextAreaField({
  label,
  value,
  onChange,
  wide = false,
  rows = 4,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  wide?: boolean;
  rows?: number;
}) {
  return (
    <label className={`block text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={fieldClass}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="rounded-lg p-2 text-primary hover:bg-accent"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-surface text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const positive = ["published", "active", "contacted"].includes(status);
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${positive ? "bg-secondary/10 text-secondary" : status === "new" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
function Loading() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
      Loading data…
    </div>
  );
}
