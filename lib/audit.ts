import { SupabaseClient } from "@supabase/supabase-js";
import { USER_ID } from "./config";

/** Best-effort audit trail entry; failures never block the mutation. */
export async function audit(
  db: SupabaseClient,
  action: string,
  resourceType: string,
  resourceId: string | null,
  metadata?: Record<string, unknown>,
) {
  try {
    await db.from("audit_log").insert({
      user_id: USER_ID,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: metadata ?? null,
    });
  } catch {
    // audit is advisory only
  }
}
