"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

function GoogleGlyph() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className="shrink-0"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.84h5.34c-.24 1.42-1.7 4.16-5.34 4.16-3.22 0-5.84-2.66-5.84-5.94S8.78 6.32 12 6.32c1.82 0 3.04.78 3.74 1.44l2.56-2.48C16.74 3.86 14.6 3 12 3 6.94 3 2.84 7.1 2.84 12.16S6.94 21.32 12 21.32c6.92 0 9.16-4.86 9.16-7.32 0-.5-.06-.88-.14-1.26H12Z"
      />
    </svg>
  );
}

export function AuthChip() {
  const { data: session, status } = useSession();
  const [busy, setBusy] = useState(false);

  if (status === "loading") {
    return (
      <div
        className="h-9 w-36 rounded-full border border-line/80 bg-white/40 animate-pulse-soft"
        aria-hidden
      />
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await signIn("google", { callbackUrl: "/" });
        }}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-ink text-paper text-xs font-medium tracking-tight hover:bg-ink-soft transition disabled:opacity-60"
      >
        <GoogleGlyph />
        Connect Gmail
      </button>
    );
  }

  const name = session.user.name ?? session.user.email ?? "Signed in";
  const initial = (name[0] ?? "?").toUpperCase();
  const refreshError = session.error;

  return (
    <div className="flex items-center gap-2">
      {refreshError && (
        <span
          title={refreshError}
          className="text-[10px] uppercase tracking-eyebrow text-accent"
        >
          re-auth
        </span>
      )}
      <div className="inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-line bg-white/70 shadow-ring">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-medium">
            {initial}
          </span>
        )}
        <span className="text-xs text-ink-soft max-w-[160px] truncate">
          {session.user.email ?? name}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="ml-1 text-[11px] uppercase tracking-eyebrow text-muted hover:text-ink transition"
        >
          sign out
        </button>
      </div>
    </div>
  );
}
