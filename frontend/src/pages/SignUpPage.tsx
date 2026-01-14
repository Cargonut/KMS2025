import { useState } from "react";
import { Link } from "react-router-dom";
import { calculateAge, signupUser } from "../app/api";
import Logo from "../components/Logo";
import SignupForm, { SignupFormData } from "../features/auth/SignupForm";
import type { Message } from "../features/auth/types";
import "../styles/Signup.css";

export default function SignUpPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();

  const handleSignup = async (form: SignupFormData, reset: () => void) => {
    setMessage(undefined);
    setBusy(true);
    try {
      if (form.email !== form.emailConfirm) {
        throw new Error("E-Mail und Bestätigung stimmen nicht überein.");
      }
      const age = calculateAge(form.birth_date);
      if (age === null || age < 18) {
        throw new Error("Du musst mindestens 18 Jahre alt sein.");
      }

      await signupUser({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        birth_date: new Date(form.birth_date).toISOString(),
        phone: form.phone || null,
        profile_image: form.profile_image || null,
        additional_note: form.additional_note || null,
      });

      setMessage({ tone: "success", text: "Registrierung erfolgreich! Bitte jetzt einloggen." });
      reset();
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: nextMessage });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page signup">
      <header className="page__header signup__header">
        <div>
          <Logo alt="Esuap" className="signup__logo" size={180} />
          <h1>Registrierung</h1>
          <p className="muted">Account anlegen, um Angebote zu erstellen.</p>
        </div>
        <div className="session">
          <Link to="/login" className="btn ghost">
            Login
          </Link>
        </div>
      </header>

      <section className="signup__content">
        <SignupForm onSubmit={handleSignup} busy={busy} message={message} />
      </section>

      <footer className="muted signup__footer">
        <Link to="/impressum">Impressum</Link>
      </footer>
    </main>
  );
}
