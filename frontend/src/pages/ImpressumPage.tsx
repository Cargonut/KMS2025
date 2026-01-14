//Elemente:
// Logo
// Schriftzug - Impressum


import { Link } from "react-router-dom";

export default function ImpressumPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111214",
        color: "#fff",
        padding: "2rem",
      }}
    >
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <header>
          <h1>Impressum</h1>
        </header>

        <article style={{ lineHeight: 1.6 }}>
          <p>
            <strong>MyCargonaut</strong>
          </p>

          <p>
            Max Mustermann<br />
            Musterstraße 1<br />
            12345 Musterstadt
          </p>

          <p>
            E-Mail: kontakt@mycargonaut.de
          </p>

          <p>
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            <br />
            Max Mustermann
          </p>
        </article>

        <footer style={{ marginTop: "2rem" }}>
          <Link to="/" className="btn ghost">
            ← Zurück zur Startseite
          </Link>
        </footer>
      </section>
    </main>
  );
}

