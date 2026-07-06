"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto mt-20 max-w-100 rounded-[10px] border border-(--line) bg-(--surf-1) p-8 text-center">
      <div className="mb-3 font-mono text-[10px] tracking-[1.5px] text-danger">
        SOMETHING BROKE
      </div>
      <p className="mb-6 text-[13px] leading-relaxed text-ink-2">
        {error.message.includes("SUPABASE")
          ? "Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and restart."
          : error.message}
      </p>
      <button
        onClick={reset}
        className="cursor-pointer rounded-[7px] border border-(--line-strong) px-4 py-2 font-mono text-[10px] tracking-[1.5px] text-ink-3 hover:text-ink-4"
      >
        RETRY
      </button>
    </div>
  );
}
