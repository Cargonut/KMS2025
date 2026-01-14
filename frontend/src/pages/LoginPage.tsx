import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../app/api";
import Field from "../components/ui/Field";
import MessageBox, { MessageTone } from "../components/ui/MessageBox";
import Logo from "../components/Logo";

const storageKey = "cargonaut-token";

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
      setMessage({ tone: "success", text: "Login erfolgreich" });
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/center");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login page-center">
      <Logo alt="Esuap" />
      <div className="login__card">
        <h1 className="login__title koho-bold">LOGIN</h1>
        <div className="login__divider" />

        <form className="login__form" onSubmit={submit}>
          <Field
            className="login__field"
            label="EMAIL"
            name="email"
            type="email"
            required
            value={email}
            onChange={(_name, value) => setEmail(value)}
            placeholder="admin@esuap.com"
          />

          <Field
            className="login__field"
            label="PASSWORD"
            name="password"
            type="password"
            required
            value={password}
            onChange={(_name, value) => setPassword(value)}
            placeholder="************"
          />

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          <button className="login__button" disabled={busy}>
            {busy ? "..." : "LOGIN"}
          </button>
        </form>
      </div>

      <footer className="login__footer page__footer page__footer--xs page__footer--inverse">
        <Link to="/impressum">IMPRESSUM</Link>
      </footer>
    </main>
  );
}
