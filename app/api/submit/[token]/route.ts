import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateOnboardingPdf } from "@/lib/pdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
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
    .select("id, created_at")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: submissionError?.message || "Submission failed" },
      { status: 500 }
    );
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

  const questionIds = Object.keys(answers || []);

  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("questions")
    .select("id, label")
    .in("id", questionIds);

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  const labelMap = new Map((questions || []).map((q) => [q.id, q.label]));

  const items = questionIds.map((questionId) => ({
    question: labelMap.get(questionId) || questionId,
    answer: answers[questionId] || "",
  }));

  const pdfBuffer = await generateOnboardingPdf({
    clientName: client.name,
    submittedAt: new Date(submission.created_at).toLocaleString("de-DE"),
    items,
  });

  const safeClientName = client.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const filePath = `${safeClientName}/${submission.id}.pdf`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("onboarding-pdfs")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("submissions")
    .update({ pdf_path: filePath })
    .eq("id", submission.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    submissionId: submission.id,
    pdfPath: filePath,
  });
}
