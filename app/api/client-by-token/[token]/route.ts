import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("id, name, token, intro_text")
    .eq("token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: mappings, error: mappingError } = await supabaseAdmin
    .from("client_questions")
    .select("sort_order, question:questions(id, label, placeholder)")
    .eq("client_id", client.id)
    .order("sort_order", { ascending: true });

  if (mappingError) {
    return NextResponse.json({ error: mappingError.message }, { status: 500 });
  }

  const questions = (mappings || []).map((item: any) => item.question).filter(Boolean);

  return NextResponse.json({
    ...client,
    questions,
  });
}
