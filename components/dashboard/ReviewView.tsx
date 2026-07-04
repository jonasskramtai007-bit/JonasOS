import { review } from "@/lib/placeholder-data";

const SECTIONS = [
  { label: "WINS THIS WEEK", color: "text-accent", placeholder: "what went well…", highlight: false },
  { label: "WHAT SLIPPED", color: "text-warn", placeholder: "what didn't happen…", highlight: false },
  { label: "OPEN LOOPS", color: "text-ink-2", placeholder: "unfinished threads…", highlight: false },
  { label: "NEXT WEEK · TOP 3", color: "text-accent", placeholder: "1.\n2.\n3.", highlight: true },
];

export function ReviewView() {
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 flex items-center gap-[14px]">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
            <span className="text-accent-soft">{"//"}</span>
            <span className="text-ink-1">WEEKLY REVIEW</span>
          </div>
          <div className="font-serif text-[30px] italic text-ink-4">
            Week of {review.weekRange}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-[10px] tracking-[1px] ${
            review.sealed ? "text-accent" : "text-warn"
          }`}
        >
          <span className="h-[6px] w-[6px] rounded-full bg-current" />
          {review.sealed ? "SEALED" : "DRAFT"}
        </div>
        <button className="cursor-pointer rounded-[9px] bg-accent px-[18px] py-[10px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent">
          SEAL WEEK
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        {SECTIONS.map((section) => (
          <div
            key={section.label}
            className={`rounded-[14px] border bg-(--surf-1) p-5 ${
              section.highlight ? "border-(--accent-line)" : "border-(--line)"
            }`}
          >
            <div
              className={`mb-[14px] font-mono text-[10px] tracking-[1.5px] ${section.color}`}
            >
              {section.label}
            </div>
            <textarea
              placeholder={section.placeholder}
              className="h-[150px] w-full bg-transparent text-[14px] leading-[1.6] text-ink-3 outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
