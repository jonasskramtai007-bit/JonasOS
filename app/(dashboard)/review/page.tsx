import { ReviewView } from "@/components/dashboard/ReviewView";
import { getWeeklyReview } from "@/lib/db";
import { weekRangeLabel, weekStartISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const weekStart = weekStartISO();
  const review = await getWeeklyReview(weekStart);
  return (
    <ReviewView
      weekStart={weekStart}
      weekRange={weekRangeLabel(weekStart)}
      review={review}
    />
  );
}
