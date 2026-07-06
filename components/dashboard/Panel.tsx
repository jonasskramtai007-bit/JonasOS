import { ReactNode } from "react";

/**
 * Shared card wrapper: frosted surface, hairline border, optional
 * numbered mono header ("01 // OPERATOR") with a right-hand slot.
 */
export function Panel({
  index,
  title,
  right,
  className = "",
  children,
}: {
  index?: string;
  title?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-[10px] border border-(--line) bg-(--surf-1) p-5 backdrop-blur-[14px] ${className}`}
    >
      {(index || title || right) && (
        <div className="mb-[18px] flex items-center justify-between">
          <div className="flex items-center gap-[7px] font-mono text-[10.5px] tracking-[1.6px]">
            {index && <span className="text-accent-soft">{index}</span>}
            {title && <span className="text-ink-1">{`// ${title}`}</span>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
