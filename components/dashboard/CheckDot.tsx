/** Square checkbox visual used by task and goal rows. */
export function CheckDot({ done, size = 18 }: { done: boolean; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-[5px] border ${
        done ? "border-accent bg-accent" : "border-(--line-strong)"
      }`}
    >
      {done && <span className="text-[10px] font-bold text-on-accent">✓</span>}
    </div>
  );
}
