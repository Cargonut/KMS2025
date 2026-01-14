// Elemente:
// Logo
// Button - Login
// Button - Sign Up
// Schriftzug - Impressum

import { Link } from "react-router-dom";
import "../styles/Landing.css";
import "../styles/Landing.css";
import logo from "../assets/LOGO.png";


export default function LandingPage() {
  return (
    <main className="landing">
      <section className="landing__content">
        <header>
          <div className="landing__logo">
            <img src={logo} alt="Esuap" />
          </div>
          <p className="landing__subtitle">
            Mitfahrgelegenheiten für Cargo & Menschen
          </p>
        </header>

        <nav className="landing__actions">
          <Link to="/auth" className="btn">
            LOGIN
          </Link>

          <Link to="/auth" className="btn secondary">
            SIGN UP
          </Link>
        </nav>

        <footer className="landing__footer">
          <Link to="/impressum" className="landing__impressum">
            Impressum
          </Link>
        </footer>
      </section>
    </main>
  );
}