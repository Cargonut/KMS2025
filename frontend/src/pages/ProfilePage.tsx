import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchProfile, Profile } from "../app/api";
import Logo from "../components/Logo";
import MessageBox from "../components/ui/MessageBox";
import ProfileView from "../features/ProfileView";

const storageKey = "cargonaut-token";

export default function ProfilePage() {
  const token = localStorage.getItem(storageKey);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetchProfile(token);
      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [loadProfile, token]);

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <main className="page profile-page page-stack">
      <header className="page__header page__header--center">
        <div>
          <Logo alt="Esuap" className="page__logo" size={180} />
          <h1 className="heading heading--xl">Profil</h1>
          <p className="muted">Deine hinterlegten Daten.</p>
        </div>
        <div className="session session--center">
          <Link to="/center" className="btn btn--ghost">
            Zur Auswahl
          </Link>
        </div>
      </header>

      <section className="page__content profile-page__content">
        {error && <MessageBox tone="error">{error}</MessageBox>}
        {busy && !profile && <p className="muted">Lade Profil...</p>}
        <ProfileView profile={profile} refresh={loadProfile} />
      </section>

      <footer className="page__footer">
        <Link to="/impressum" className="page__footer-link">
          Impressum
        </Link>
      </footer>
    </main>
  );
}
