import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Network,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";
import {
  changeDistributorPassword,
  getDistributorNetwork,
  logoutDistributor,
  type DistributorNetwork,
  type DistributorNetworkMember,
} from "@/lib/distributor-api";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status?: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "expired" || status === "inactive") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

type GenealogyNode = {
  id: string;
  name: string;
  username?: string;
  distributorCode: string;
  networkLevel: number;
  children: GenealogyNode[];
};

function buildGenealogyTree(root: DistributorNetwork["root"], network: DistributorNetworkMember[]) {
  const rootNode: GenealogyNode = {
    id: String(root.id),
    name: root.name,
    username: root.username,
    distributorCode: root.distributorCode,
    networkLevel: 0,
    children: [],
  };
  const nodes = new Map<string, GenealogyNode>([[root.distributorCode.toUpperCase(), rootNode]]);

  network.forEach((member) => {
    nodes.set(member.distributorCode.toUpperCase(), {
      id: String(member.id),
      name: member.name,
      username: member.username,
      distributorCode: member.distributorCode,
      networkLevel: Number(member.networkLevel) || 1,
      children: [],
    });
  });

  network.forEach((member) => {
    const node = nodes.get(member.distributorCode.toUpperCase());
    const parentCode = (member.sponsorCode || root.distributorCode).toUpperCase();
    const parent = nodes.get(parentCode) || rootNode;
    if (node && !parent.children.some((child) => child.id === node.id)) parent.children.push(node);
  });

  return rootNode;
}

function countDownline(node: GenealogyNode): number {
  return node.children.reduce((total, child) => total + 1 + countDownline(child), 0);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function GenealogyNodeView({ node, root = false }: { node: GenealogyNode; root?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const totalDownline = countDownline(node);
  const hasChildren = node.children.length > 0;

  return (
    <div
      className={
        root
          ? ""
          : "relative before:absolute before:top-7 before:-left-4 before:w-4 before:border-t before:border-primary/20"
      }
    >
      <button
        type="button"
        onClick={() => hasChildren && setExpanded((value) => !value)}
        aria-expanded={hasChildren ? expanded : undefined}
        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${root ? "border-primary/25 bg-primary/5" : "border-border bg-card hover:border-primary/30 hover:shadow-soft"}`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${root ? "bg-brand text-primary-foreground" : "bg-primary/10 text-primary"}`}
        >
          {initials(node.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{node.name}</span>
            {root && (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                You
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-primary">
            {node.distributorCode} {node.username ? `• @${node.username}` : ""}
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {node.children.length} direct join{node.children.length === 1 ? "" : "s"} ·{" "}
            {totalDownline} total under
          </span>
        </span>
        {hasChildren && (
          <span className="shrink-0 text-primary">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>
      {hasChildren && expanded && (
        <div className="ml-5 mt-2 space-y-2 border-l border-primary/20 pl-4">
          {node.children.map((child) => (
            <GenealogyNodeView key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function GenealogyTree({ root, network }: Pick<DistributorNetwork, "root" | "network">) {
  const tree = useMemo(() => buildGenealogyTree(root, network), [root, network]);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="p-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Genealogy view
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Your tree structure</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              See who joined under each distributor and how deep your network goes.
            </p>
          </div>
          <Network className="h-8 w-8 shrink-0 text-primary/50" />
        </div>
        <div className="mt-5 max-h-[720px] overflow-auto rounded-2xl bg-surface/70 p-3 sm:p-4">
          <GenealogyNodeView node={tree} root />
          {!network.length && (
            <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No one has joined under your ID yet. Share your sponsor link to start the tree.
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">Direct joins</strong> = immediately under this
            person
          </span>
          <span>
            <strong className="text-foreground">Total under</strong> = complete downline
          </span>
        </div>
      </div>
    </div>
  );
}

function NetworkRow({ member }: { member: DistributorNetworkMember }) {
  return (
    <div className="grid gap-4 border-t border-border px-5 py-5 md:grid-cols-[70px_1.3fr_1.2fr_1fr_0.8fr] md:items-center">
      <div>
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          L{member.networkLevel}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{member.name}</p>
        <p className="truncate text-xs text-primary">
          {member.distributorCode} {member.username ? `• @${member.username}` : ""}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">Chain: {member.networkPath}</p>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>
          Under <span className="font-semibold text-foreground">{member.sponsorCode || "—"}</span>
        </p>
        <p className="mt-1">{member.city || member.phone || "Contact not added"}</p>
      </div>
      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(member.membershipCurrentStatus || member.membershipStatus)}`}
        >
          Membership {member.membershipCurrentStatus || member.membershipStatus || "not_started"}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          Expires {formatDate(member.membershipExpiresAt)}
        </p>
      </div>
      <div className="text-sm">
        <p className="font-semibold text-foreground">
          {Number(member.totalIds || 0).toLocaleString("en-IN")} IDs
        </p>
        <p className="text-xs text-muted-foreground">
          {member.completedLevel ? `Level ${member.completedLevel}` : "Level not passed"}
        </p>
      </div>
    </div>
  );
}

function DistributorDashboard() {
  const [data, setData] = useState<DistributorNetwork | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDistributorNetwork()
      .then(setData)
      .catch(() => {
        setError("Please login again to view your distributor network.");
        window.setTimeout(() => {
          window.location.href = "/distributor/login";
        }, 700);
      });
  }, []);

  async function logout() {
    await logoutDistributor().catch(() => undefined);
    window.location.href = "/distributor/login";
  }

  const sponsorLink = data
    ? `${window.location.origin}/distributor/login?sponsor=${encodeURIComponent(data.root.distributorCode)}`
    : "";

  if (error)
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </section>
    );

  if (!data)
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16">
        <p className="text-sm text-muted-foreground">Loading your distributor network…</p>
      </section>
    );

  const { root, network, summary } = data;
  const levels = Object.entries(summary.byLevel).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Distributor workspace
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-5xl">
              Your distributor network
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              See every distributor connected under your ID, from direct members to the deepest
              generation in your chain.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/become-distributor"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Website
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <Users className="h-6 w-6 text-primary" />
            <p className="mt-5 text-3xl font-bold text-foreground">{summary.totalMembers}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total distributors under you</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <UserPlus className="h-6 w-6 text-secondary" />
            <p className="mt-5 text-3xl font-bold text-foreground">{summary.directMembers}</p>
            <p className="mt-1 text-sm text-muted-foreground">Direct distributors</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <Network className="h-6 w-6 text-primary" />
            <p className="mt-5 text-3xl font-bold text-foreground">{summary.deepestLevel}</p>
            <p className="mt-1 text-sm text-muted-foreground">Deepest generation</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <ShieldCheck className="h-6 w-6 text-gold-foreground" />
            <p className="mt-5 text-lg font-bold text-foreground">{root.distributorCode}</p>
            <p className="mt-1 text-sm text-muted-foreground">Your sponsor ID</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Your account
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">{root.name}</h2>
            <p className="mt-1 text-sm text-primary">@{root.username}</p>
            <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
              <p>
                Distributor access: <strong className="text-foreground">Free</strong>
              </p>
              <p>
                Status:{" "}
                <strong className="text-foreground">
                  {root.membershipStatus || "not_started"}
                </strong>
              </p>
              <p>
                Annual subscription: <strong className="text-foreground">None</strong>
              </p>
              <p>
                Your automatic Sponsor ID:{" "}
                <strong className="text-primary">{root.sponsorId || root.distributorCode}</strong>
              </p>
              <a
                href={sponsorLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Open auto-filled invite link
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  Generation summary
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">Your chain by level</h2>
              </div>
              <Network className="h-8 w-8 text-primary/50" />
            </div>
            {levels.length ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {levels.map(([level, count]) => (
                  <div key={level} className="rounded-2xl bg-surface p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Level {level}</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      distributor{count === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-surface p-5 text-sm text-muted-foreground">
                No distributor has joined under your ID yet. Share your sponsor ID to start your
                chain.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <ChangePasswordForm onSubmit={changeDistributorPassword} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.35fr)] lg:items-start">
          <GenealogyTree root={root} network={network} />
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  Network chain
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  All distributors under your ID
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {network.length} connected account{network.length === 1 ? "" : "s"}
              </p>
            </div>
            {network.length ? (
              <div>
                <div className="hidden grid-cols-[70px_1.3fr_1.2fr_1fr_0.8fr] gap-4 bg-surface px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
                  <span>Level</span>
                  <span>Distributor</span>
                  <span>Sponsor / location</span>
                  <span>Membership</span>
                  <span>ID progress</span>
                </div>
                {network.map((member) => (
                  <NetworkRow key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="border-t border-border p-8 text-sm text-muted-foreground">
                Your distributor chain will appear here after someone joins using your sponsor ID.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DistributorDashboard;
