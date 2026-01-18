import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../app/api";
import { PageFooter, PageLayout } from "../components/PageLayout";
import SignupForm, {
  SignupFormData,
  getSignupValidationError,
  toSignupInput,
} from "../features/SignupForm";
import type { Message } from "../features/types";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();
  const pendingProfileImageKey = "cargonaut-pending-profile-image";

  const handleSignup = async (form: SignupFormData, reset: () => void) => {
    setMessage(undefined);
    setBusy(true);
    try {
      const validationError = getSignupValidationError(form);
      if (validationError) {
        throw new Error(validationError);
      }

      await signupUser(toSignupInput(form));
      if (form.profile_image) {
        localStorage.setItem(pendingProfileImageKey, form.profile_image);
      } else {
        localStorage.removeItem(pendingProfileImageKey);
      }

      setMessage({ tone: "success", text: "Registrierung erfolgreich! Bitte jetzt anmelden." });
      reset();
      navigate("/login");
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: nextMessage });
    } finally {
      setBusy(false);
    }
  };

  // Registrierung setzt auf das gemeinsame Seiten-Template.
  return (
    <PageLayout
      variant="default"
      className="signup page--contrast"
      header={{
        align: "center",
        logo: { alt: "Esuap", size: 180 },
        title: "Registrierung",
        subtitle: "Konto anlegen, um Angebote zu erstellen.",
        actions: (
          <Link to="/login" className="btn btn--ghost">
            Anmelden
          </Link>
        ),
      }}
      contentWrap
      footer={<PageFooter className="page__footer--sm muted" />}
    >
      <SignupForm onSubmit={handleSignup} busy={busy} message={message} />
    </PageLayout>
  );
}
