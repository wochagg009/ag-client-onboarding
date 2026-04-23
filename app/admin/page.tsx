"use client";

import { useMemo, useState } from "react";
import { defaultQuestions } from "@/lib/questions";

function generateToken(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "client"}-${suffix}`;
}

export default function AdminPage() {
  const [name, setName] = useState("Titanic Hotels – The Main");
  const [introText, setIntroText] = useState(
    "Vielen Dank, dass Sie sich Zeit für das Onboarding nehmen. Ihre Antworten helfen uns, das Projekt fundiert und effizient vorzubereiten."
  );
  const [token, setToken] = useState(generateToken("Titanic Hotels – The Main"));
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    defaultQuestions.map((q) => q.id)
  );
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewLink = useMemo(() => `/start/${token}`, [token]);

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleCreateClient() {
    setLoading(true);
    setMessage(null);
    setCreatedLink(null);

    try {
      const createClientRes = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, token, introText }),
      });

      if (!createClientRes.ok) {
        throw new Error("Client konnte nicht angelegt werden.");
      }

      const clientData = await createClientRes.json();

      const assignRes = await fetch("/api/admin/client-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientData.id,
          questionIds: selectedQuestionIds,
        }),
      });

      if (!assignRes.ok) {
        throw new Error("Fragen konnten nicht zugewiesen werden.");
      }

      setMessage("Kunde angelegt und Fragen zugewiesen.");
      setCreatedLink(`/start/${clientData.token}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 980, margin: "0 auto" }}>
      <h1>Admin</h1>
      <p style={{ color: "#666", lineHeight: 1.6 }}>
        Kunde anlegen, Fragen zuweisen und individuellen Link erzeugen.
      </p>

      <div style={{ marginTop: 24, padding: 24, border: "1px solid #ddd", borderRadius: 16, background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Kunden-Setup</h2>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label>Projekt- / Kundenname</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ccc", marginTop: 8 }}
            />
          </div>

          <div>
            <label>Token</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={() => setToken(generateToken(name))}
                style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #ccc", background: "#fff" }}
              >
                Neu
              </button>
            </div>
          </div>

          <div>
            <label>Einleitungstext</label>
            <textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 12, border: "1px solid #ccc", marginTop: 8 }}
            />
          </div>

          <div>
            <label>Vorschau-Link</label>
            <div style={{ marginTop: 8, padding: 12, borderRadius: 12, border: "1px solid #ddd", background: "#f7f7f7" }}>
              {previewLink}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 24, border: "1px solid #ddd", borderRadius: 16, background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Fragen auswählen</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {defaultQuestions.map((question) => {
            const active = selectedQuestionIds.includes(question.id);

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => toggleQuestion(question.id)}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 14,
                  border: active ? "1px solid #111" : "1px solid #ccc",
                  background: active ? "#111" : "#fff",
                  color: active ? "#fff" : "#111",
                  cursor: "pointer",
                }}
              >
                {question.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          onClick={handleCreateClient}
          disabled={loading}
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? "Speichern..." : "Kunden-Setup speichern"}
        </button>
      </div>

      {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}
      {createdLink ? (
        <p style={{ marginTop: 8 }}>
          Kundenseite: <a href={createdLink}>{createdLink}</a>
        </p>
      ) : null}
    </main>
  );
}
