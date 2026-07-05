import { Panel } from "./Panel";

export function JournalCard({
  todayLogged,
  yesterdayPreview,
}: {
  todayLogged: boolean;
  yesterdayPreview: string | null;
}) {
  return (
    <Panel index="07" title="JOURNAL">
      {todayLogged ? (
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
          {yesterdayPreview ? (
            <>
              <div className="mb-[7px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
                YESTERDAY
              </div>
              <div className="line-clamp-4 font-serif text-[16px] italic leading-[1.5] text-ink-2">
                {yesterdayPreview}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-ink-1">
              Write your first entry in the Journal tab.
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
