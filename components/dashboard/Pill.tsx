import { ReactNode } from "react";

const tones = {
  accent: "bg-(--accent-dim) text-accent",
  warn: "bg-[color-mix(in_oklab,var(--warn)_12%,transparent)] text-warn",
  danger: "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger",
  muted: "bg-(--wash) text-ink-2",
} as const;

export type PillTone = keyof typeof tones;

export function Pill({
  tone = "muted",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`rounded-[5px] px-[7px] py-[2px] font-mono text-[9px] tracking-[1px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
