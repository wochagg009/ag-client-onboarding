export default function AdminPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin</h1>
      <p style={{ color: "#666", lineHeight: 1.6 }}>
        Hier wird später das Kunden-Setup liegen.
      </p>

      <div
        style={{
          marginTop: 24,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Erster Test</h2>
        <p>Wenn du diese Seite siehst, funktioniert die Admin-Route.</p>
      </div>
    </main>
  );
}
