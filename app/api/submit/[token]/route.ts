import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json();
  const answers = body.answers as Record<string, string>;

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("id, name, token")
    .eq("token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("submissions")
    .insert({ client_id: client.id })
    .select("id")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json({ error: submissionError?.message || "Submission failed" }, { status: 500 });
  }

  const answerRows = Object.entries(answers || {}).map(([questionId, answerText]) => ({
    submission_id: submission.id,
    question_id: questionId,
    answer_text: answerText,
  }));

  if (answerRows.length > 0) {
    const { error: answersError } = await supabaseAdmin
      .from("answers")
      .insert(answerRows);

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, submissionId: submission.id });
}
