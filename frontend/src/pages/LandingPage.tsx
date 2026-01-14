// Elemente:
// Logo
// Button - Login
// Button - Sign Up
// Schriftzug - Impressum

import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#111214",
        color: "#fff",
        padding: "2rem",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Logo / Titel */}
        <header>
          <h1 style={{ margin: 0 }}>MyCargonaut</h1>
          <p style={{ opacity: 0.8 }}>
            Mitfahrgelegenheiten für Cargo & Menschen
          </p>
        </header>

        {/* Aktionen */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "1rem",
          }}
        >
          <Link to="/auth" className="btn">
            LOGIN
          </Link>

          <Link to="/auth" className="btn secondary">
            SIGN UP
          </Link>
        </nav>

        {/* Footer */}
        <footer style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
          <Link to="/impressum" style={{ opacity: 0.75 }}>
            Impressum
          </Link>
        </footer>
      </section>
    </main>
  );
}

