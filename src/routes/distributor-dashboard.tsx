import { ArrowLeft, LogOut, Network, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
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
                Membership:{" "}
                <strong className="text-foreground">₹{root.membershipAmount || 599}</strong> / year
              </p>
              <p>
                Status:{" "}
                <strong className="text-foreground">
                  {root.membershipStatus || "not_started"}
                </strong>
              </p>
              <p>
                Valid until:{" "}
                <strong className="text-foreground">{formatDate(root.membershipExpiresAt)}</strong>
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

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
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
    </section>
  );
}

export default DistributorDashboard;
