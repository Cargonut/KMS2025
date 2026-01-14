import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";

export default function CenterPage() {
  const token = localStorage.getItem("cargonaut-token");
  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <main className="page-center">
      <div className="stack stack--lg">
        <Logo alt="Esuap" size={180} />

        <section className="center__panel stack stack--xxl">
          <ProfileAvatar className="center__avatar" fallbackText="Profilbild" label="Profilbild" />

          <div className="stack stack--md">
            <Link to="/driver-menu" className="btn btn--block">
              Fahrer
            </Link>
            <Link to="/passenger-menu" className="btn btn--ghost btn--block">
              Mitfahrer
            </Link>
          </div>

          <footer className="page__footer page__footer--sm">
            <Link to="/impressum" className="page__footer-link">
              Impressum
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
