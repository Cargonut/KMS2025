import { useState } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../app/api";
import Logo from "../components/Logo";
import SignupForm, { SignupFormData, getSignupValidationError, toSignupInput } from "../features/SignupForm";
import type { Message } from "../features/types";

export default function SignUpPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();

  const handleSignup = async (form: SignupFormData, reset: () => void) => {
    setMessage(undefined);
    setBusy(true);
    try {
      const validationError = getSignupValidationError(form);
      if (validationError) {
        throw new Error(validationError);
      }

      await signupUser(toSignupInput(form));

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
      <header className="page__header page__header--center">
        <div>
          <Logo alt="Esuap" className="page__logo" size={180} />
          <h1 className="heading heading--xl">Registrierung</h1>
          <p className="muted">Account anlegen, um Angebote zu erstellen.</p>
        </div>
        <div className="session session--center">
          <Link to="/login" className="btn btn--ghost">
            Login
          </Link>
        </div>
      </header>

      <section className="page__content">
        <SignupForm onSubmit={handleSignup} busy={busy} message={message} />
      </section>

      <footer className="muted page__footer">
        <Link to="/impressum" className="page__footer-link">
          Impressum
        </Link>
      </footer>
    </main>
  );
}
