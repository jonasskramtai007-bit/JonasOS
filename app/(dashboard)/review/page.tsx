import { ReviewView } from "@/components/dashboard/ReviewView";
import { getWeeklyReview } from "@/lib/db";
import { weekRangeLabel, weekStartISO } from "@/lib/dates";
import { generateReviewDraft } from "@/lib/review-draft";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const weekStart = weekStartISO();
  let review = await getWeeklyReview(weekStart);
  // First visit of the week: pre-fill an editable draft from the
  // week's actual data (no-op without data or an API key).
  if (!review) {
    review = await generateReviewDraft(weekStart);
  }
  return (
    <ReviewView
      weekStart={weekStart}
      weekRange={weekRangeLabel(weekStart)}
      review={review}
    />
  );
}
