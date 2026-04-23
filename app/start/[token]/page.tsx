import { notFound } from "next/navigation";
import QuestionnaireClient from "./questionnaire-client";

async function getClientByToken(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ag-client-onboarding.netlify.app";

  const res = await fetch(`${appUrl}/api/client-by-token/${token}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function StartTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await getClientByToken(token);

  if (!client) {
    notFound();
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <QuestionnaireClient client={client} />
    </main>
  );
}
