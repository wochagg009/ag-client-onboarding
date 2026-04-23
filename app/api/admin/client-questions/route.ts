import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientId, questionIds } = body as { clientId: string; questionIds: string[] };

  if (!clientId || !Array.isArray(questionIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("client_questions")
    .delete()
    .eq("client_id", clientId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const rows = questionIds.map((questionId, index) => ({
    client_id: clientId,
    question_id: questionId,
    sort_order: index,
  }));

  const { error: insertError } = await supabaseAdmin
    .from("client_questions")
    .insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
