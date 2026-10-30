import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/shared/PasswordInput";

export function ChangePasswordForm({
  onSubmit,
}: {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Your password has been changed successfully.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to change your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <KeyRound className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Security</p>
          <h2 className="mt-1 font-display text-2xl font-bold">Change password</h2>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-3">
        <PasswordInput
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          required
        />
        <PasswordInput
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New password (8+ characters)"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <PasswordInput
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
      {message && <p className="mt-3 text-sm font-semibold text-secondary">{message}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}
