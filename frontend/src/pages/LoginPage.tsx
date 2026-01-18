import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile, loginUser, updateProfile } from "../app/api";
import Field from "../components/ui/Field";
import MessageBox, { MessageTone } from "../components/ui/MessageBox";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";

const storageKey = "cargonaut-token";
const pendingProfileImageKey = "cargonaut-pending-profile-image";

type Message = { tone: MessageTone; text: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMessage(undefined);

    try {
      const token = await loginUser(email, password);
      localStorage.setItem(storageKey, token);
      const pendingProfileImage = localStorage.getItem(pendingProfileImageKey);
      if (pendingProfileImage) {
        try {
          const profile = await fetchProfile(token);
          if (!profile.profile_image) {
            await updateProfile({ profile_image: pendingProfileImage }, token);
            window.dispatchEvent(new Event("profile-updated"));
          }
        } finally {
          localStorage.removeItem(pendingProfileImageKey);
        }
      }
      setMessage({ tone: "success", text: "Anmeldung erfolgreich." });
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/center");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  // Login-Seite bleibt optisch gleich, nutzt aber das gemeinsame Layout.
  return (
    <PageLayout variant="center" className="login">
      <Logo alt="Esuap" className="page__logo" />
      <div className="login__card">
        <h1 className="login__title koho-bold">Anmelden</h1>
        <div className="login__divider" />

        <form className="stack stack--lg" onSubmit={submit}>
          <Field
            className="login__field field--tight"
            inputClassName="login__control"
            label="E-Mail"
            name="email"
            type="email"
            required
            value={email}
            onChange={(_name, value) => setEmail(value)}
            placeholder="admin@esuap.com"
          />

          <Field
            className="login__field field--tight"
            inputClassName="login__control"
            label="Passwort"
            name="password"
            type="password"
            required
            value={password}
            onChange={(_name, value) => setPassword(value)}
            placeholder="************"
          />

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          <button className="login__button" disabled={busy}>
            {busy ? "..." : "Anmelden"}
          </button>
        </form>
      </div>

      <PageFooter className="login__footer page__footer--sm page__footer--inverse" />
    </PageLayout>
  );
}
