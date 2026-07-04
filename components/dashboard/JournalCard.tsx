import { Panel } from "./Panel";
import { journal } from "@/lib/placeholder-data";

export function JournalCard() {
  return (
    <Panel index="07" title="JOURNAL">
      {journal.todayHasEntry ? (
        <div className="flex items-center gap-[9px] font-mono text-[11px] text-accent">
          <span className="h-[7px] w-[7px] rounded-full bg-accent" />
          TODAY&apos;S ENTRY LOGGED
        </div>
      ) : (
        <div>
          <div className="mb-[14px] flex items-center gap-[9px] font-mono text-[10.5px] tracking-[0.5px] text-ink-2">
            <span className="h-[7px] w-[7px] rounded-full bg-ink-1" />
            NO ENTRY YET TODAY
          </div>
          <div className="mb-[7px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            YESTERDAY
          </div>
          <div className="font-serif text-[16px] italic leading-[1.5] text-ink-2">
            {journal.yesterdayPreview}
          </div>
        </div>
      )}
    </Panel>
  );
}
