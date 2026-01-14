import { FormEvent, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../app/api";
import "../styles/Login.css";
import Logo from "../components/Logo";

const storageKey = "cargonaut-token";

type Message = { tone: "info" | "success" | "error" | "warn"; text: string };

function MessageBox({ tone = "info", children }: { tone?: Message["tone"]; children?: ReactNode }) {
  if (!children) return null;
  return <div className={`message message--${tone}`}>{children}</div>;
}

export default function LoginPage() {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
    <Logo alt="Esuap" />
      <div className="login__card">
        <h1 className="login__title koho-bold">LOGIN</h1>
        <div className="login__divider" />

        <form className="login__form" onSubmit={submit}>
          <label className="login__field">
            <span>EMAIL</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@esuap.com"
            />
          </label>

          <label className="login__field">
            <span>PASSWORD</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="************"
            />
          </label>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          <button className="login__button" disabled={busy}>
            {busy ? "..." : "LOGIN"}
          </button>
        </form>
      </div>

      <footer className="login__footer">
        <Link to="/impressum">IMPRESSUM</Link>
      </footer>
    </main>
  );
}
