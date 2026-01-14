import { FormEvent, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProfile, loginUser } from "../app/api";
import "../styles/Login.css";

const storageKey = "cargonaut-token";

type Message = { tone: "info" | "success" | "error" | "warn"; text: string };

function MessageBox({ tone = "info", children }: { tone?: Message["tone"]; children?: ReactNode }) {
  if (!children) return null;
  return <div className={`message message--${tone}`}>{children}</div>;
}

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "date";
  required?: boolean;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
};

function Field({ label, name, type = "text", required, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="loginField">
      <span className="loginLabel">{label}</span>
      <input
        className="loginInput"
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.name, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(undefined);
    setBusy(true);

    try {
      const token = await loginUser(email, password);
      localStorage.setItem(storageKey, token);

      setMessage({ tone: "success", text: "Login erfolgreich. Profil wird geladen..." });

      // Optional: direkt Profil laden (wie in AuthPage)
      // du kannst das Ergebnis später nutzen (Context / State / Redirect)
      await fetchProfile(token);

      // Optional: Weiterleitung nach Login (wenn du schon eine MainPage hast)
      // navigate("/main");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="loginPage">
      <div className="loginTopHint">LOGIN</div>

      <section className="loginPhone">
        {/* diagonaler Hintergrund */}
        <div className="loginBg" />

        {/* Karte */}
        <div className="loginCard">
          <h1 className="loginTitle">LOGIN</h1>
          <div className="loginDivider" />

          <form className="loginForm" onSubmit={submit}>
            <Field
              label="EMAIL"
              name="email"
              type="email"
              required
              value={email}
              onChange={(_, v) => setEmail(v)}
              placeholder="admin@esuap.com"
            />

            <Field
              label="PASSWORD"
              name="password"
              type="password"
              required
              value={password}
              onChange={(_, v) => setPassword(v)}
              placeholder="••••••••••••"
            />

            <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

            <button className="loginBtn" type="submit" disabled={busy}>
              {busy ? "..." : "LOGIN"}
            </button>
          </form>
        </div>

        {/* Impressum */}
        <div className="loginFooter">
          <Link to="/impressum" className="loginImpressum">
            IMPRESSUM
          </Link>
        </div>
      </section>
    </main>
  );
}
