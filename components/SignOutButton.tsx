"use client";
import { useState } from "react";
import { Icon } from "./icons";

export function SignOutButton({ variant = "sidebar", onSignedOut }: { variant?: "sidebar" | "mobile"; onSignedOut?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      onSignedOut?.();
      window.location.assign("/login");
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <button type="button" className={variant === "sidebar" ? "nav signout" : "tab signout-mobile"} onClick={signOut} disabled={busy} aria-label={failed ? "Sign out failed; try again" : "Sign out"}>
      <Icon name="logout" />{busy ? "Signing out…" : failed ? "Try again" : "Sign out"}
    </button>
  );
}
