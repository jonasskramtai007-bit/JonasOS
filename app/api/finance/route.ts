import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";

function parseAmount(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** Upserts a monthly snapshot. month accepts "YYYY-MM" or "YYYY-MM-DD". */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawMonth = typeof body?.month === "string" ? body.month.trim() : "";
  const month = /^\d{4}-\d{2}$/.test(rawMonth)
    ? `${rawMonth}-01`
    : /^\d{4}-\d{2}-\d{2}$/.test(rawMonth)
      ? rawMonth.slice(0, 8) + "01"
      : null;
  const total = parseAmount(body?.total);
  if (!month || total === null) {
    return NextResponse.json(
      { error: "month (YYYY-MM) and numeric total are required" },
      { status: 400 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("finance_snapshots")
    .upsert(
      {
        user_id: USER_ID,
        month,
        total,
        income: parseAmount(body?.income),
        spend: parseAmount(body?.spend),
      },
      { onConflict: "user_id,month" },
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "finance.snapshot", "finance_snapshot", data.id, { month });
  return NextResponse.json({ snapshot: data });
}
