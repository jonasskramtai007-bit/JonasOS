import { InboxView } from "@/components/dashboard/InboxView";
import { listInbox } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { pending, filed } = await listInbox();
  return <InboxView pending={pending} filed={filed} />;
}
