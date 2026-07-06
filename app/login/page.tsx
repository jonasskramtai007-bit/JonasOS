"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      router.replace(searchParams.get("from") ?? "/");
      router.refresh();
    } else {
      setError(response.status === 401 ? "WRONG PASSWORD" : "LOGIN FAILED");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-90 rounded-[10px] border border-(--line) bg-(--surf-1) p-8 backdrop-blur-[14px]"
      >
        <div className="mb-8 flex items-center gap-[9px]">
          <div className="h-[9px] w-[9px] rounded-[2px] bg-accent" />
          <span className="font-mono text-[13px] font-semibold tracking-[2.5px]">
            JONAS OS
          </span>
        </div>
        <label
          htmlFor="password"
          className="mb-2 block font-mono text-[9.5px] tracking-[1.4px] text-ink-1"
        >
          PASSWORD
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[11px] text-[14px] text-ink-4 outline-none focus:border-(--accent-line)"
        />
        {error && (
          <p className="mb-4 font-mono text-[10px] tracking-[1.2px] text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="w-full cursor-pointer rounded-[7px] bg-accent py-[11px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
        >
          {busy ? "UNLOCKING…" : "ENTER"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
