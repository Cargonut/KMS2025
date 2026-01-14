// Elemente:
// Logo
// Button - Login
// Button - Sign Up
// Schriftzug - Impressum

import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function LandingPage() {
  return (
    <main className="page-center">
      <section className="landing__content stack stack--xl">
        <header>
          <Logo alt="Esuap" />
          <p className="landing__subtitle">
            Mitfahrgelegenheiten für Cargo & Menschen
          </p>
        </header>

        <nav className="landing__actions stack stack--md">
          <Link to="/login" className="btn">
            LOGIN
          </Link>

          <Link to="/signup" className="btn">
            SIGN UP
          </Link>
        </nav>

        <footer className="page__footer page__footer--sm page__footer--spaced">
          <Link to="/impressum" className="page__footer-link">
            Impressum
          </Link>
        </footer>
      </section>
    </main>
  );
}
