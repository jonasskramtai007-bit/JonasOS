// Shown instantly while a tab's server data is fetched, so navigation
// feels responsive instead of freezing on the previous page.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-[22px] h-[14px] w-[120px] rounded bg-(--wash)" />
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[300px_1fr_322px]">
        <div className="flex flex-col gap-[18px]">
          <div className="h-[220px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
          <div className="h-[180px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
        </div>
        <div className="flex flex-col gap-[18px]">
          <div className="h-[280px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
          <div className="h-[140px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
        </div>
        <div className="hidden flex-col gap-[18px] lg:flex">
          <div className="h-[240px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
          <div className="h-[120px] rounded-[10px] border border-(--line-soft) bg-(--surf-1)" />
        </div>
      </div>
    </div>
  );
}
