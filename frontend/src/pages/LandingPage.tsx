// Elemente:
// Logo
// Button - Login
// Button - Sign Up
// Schriftzug - Impressum

import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function LandingPage() {
  // Startseite nutzt das Template fuer einen schlanken Aufbau.
  return (
    <PageLayout variant="center">
      <section className="landing__content stack stack--xl">
        <header>
          <Logo alt="Esuap" className="page__logo" />
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

        <PageFooter className="page__footer--sm page__footer--spaced" />
      </section>
    </PageLayout>
  );
}
