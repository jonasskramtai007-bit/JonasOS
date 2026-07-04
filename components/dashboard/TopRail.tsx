"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { name: "HOME", href: "/" },
  { name: "TASKS", href: "/tasks" },
  { name: "JOURNAL", href: "/journal" },
  { name: "GOALS", href: "/goals" },
  { name: "FINANCE", href: "/finance" },
  { name: "REVIEW", href: "/review" },
];

export function TopRail() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("jonasos-theme", next ? "light" : "dark");
    } catch {}
  }

  const dateStr = now
    ?.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    .toUpperCase();
  const timeStr = now?.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-(--line) bg-(--rail) backdrop-blur-[16px]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-7 py-[15px]">
        <div className="flex flex-1 items-center gap-[9px]">
          <div className="h-[9px] w-[9px] rounded-[2px] bg-accent" />
          <span className="font-mono text-[13px] font-semibold tracking-[2.5px]">
            JONAS OS
          </span>
        </div>
        <nav className="flex gap-[2px]">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-[7px] border px-[13px] py-[7px] font-mono text-[10.5px] tracking-[1.5px] ${
                  active
                    ? "border-(--accent-line) bg-(--accent-dim) text-accent"
                    : "border-transparent text-ink-2 hover:bg-(--wash) hover:text-ink-3"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-[14px] font-mono">
          <button
            onClick={toggleTheme}
            className="cursor-pointer rounded-[7px] border border-(--line-strong) px-[11px] py-[5px] font-mono text-[9px] tracking-[1.4px] text-ink-1 hover:text-ink-3"
          >
            {light ? "DARK" : "LIGHT"}
          </button>
          <span className="text-[11px] tracking-[1px] text-ink-2">
            {dateStr ?? ""}
          </span>
          <div className="flex items-center gap-[6px]">
            <span className="h-[6px] w-[6px] animate-[livepulse_2s_ease-in-out_infinite] rounded-full bg-accent" />
            <span className="text-[12.5px] font-medium tracking-[1px] tabular-nums text-ink-4">
              {timeStr ?? "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
