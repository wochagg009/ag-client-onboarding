import { notFound } from "next/navigation";

async function getClientByToken(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ag-client-onboarding.netlify.app";

  const res = await fetch(`${appUrl}/api/client-by-token/${token}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

function Questionnaire({ client }: { client: any }) {
  return <QuestionnaireClient client={client} />;
}

export default async function StartTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getClientByToken(token);

  if (!client) {
    notFound();
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <Questionnaire client={client} />
    </main>
  );
}

// client component inline
function QuestionnaireClient({ client }: { client: any }) {
  "use client";

  const React = require("react");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalSteps = client.questions.length + 1;
  const currentQuestion = client.questions[step - 1];
  const progress = Math.round((step / totalSteps) * 100);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/submit/${client.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        throw new Error("Antworten konnten nicht gespeichert werden.");
      }

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Absenden.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 16, background: "#fff" }}>
        <h1>Vielen Dank</h1>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          Ihre Antworten wurden gespeichert.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 16, background: "#fff" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#666", marginBottom: 8 }}>
          Schritt {step + 1} von {totalSteps}
        </div>
        <div style={{ width: "100%", height: 8, background: "#ececec", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#111" }} />
        </div>
      </div>

      {step === 0 ? (
        <div>
          <h1>{client.name}</h1>
          <p style={{ color: "#666", fontSize: 18, lineHeight: 1.6 }}>
            {client.intro_text || "Bitte beantworten Sie die folgenden Fragen."}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ color: "#666", marginBottom: 12 }}>Frage {step}</div>
          <h2>{currentQuestion.label}</h2>
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => setAnswers((prev: Record<string, string>) => ({
              ...prev,
              [currentQuestion.id]: e.target.value,
            }))}
            placeholder={currentQuestion.placeholder || "Ihre Antwort..."}
            style={{
              width: "100%",
              minHeight: 180,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ccc",
              marginTop: 16,
            }}
          />
        </div>
      )}

      {error ? <p style={{ color: "#a00000", marginTop: 12 }}>{error}</p> : null}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          type="button"
          onClick={() => setStep((prev: number) => Math.max(0, prev - 1))}
          disabled={step === 0 || submitting}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          Zurück
        </button>

        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev: number) => prev + 1)}
            disabled={submitting}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: "#111",
              color: "#fff",
            }}
          >
            {step === 0 ? "Starten" : "Weiter"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: "#111",
              color: "#fff",
            }}
          >
            {submitting ? "Speichern..." : "Absenden"}
          </button>
        )}
      </div>
    </div>
  );
}
