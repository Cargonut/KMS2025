import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function CenterPage() {
  const token = localStorage.getItem("cargonaut-token");
  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  // Auswahlseite nutzt das Template, Inhalt bleibt gleich.
  return (
    <PageLayout variant="center">
      <div className="stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />

        <section className="center__panel stack stack--xxl">
          <ProfileAvatar className="center__avatar" fallbackText="Profilbild" label="Profilbild" />

          <div className="stack stack--md">
            <Link to="/nearby-drivers" className="btn btn--ghost btn--block">
              Karte: Nächster Fahrer
            </Link>
            <Link to="/driver-menu" className="btn btn--block">
              Fahrer
            </Link>
            <Link to="/passenger-menu" className="btn btn--ghost btn--block">
              Mitfahrer
            </Link>
          </div>

          <PageFooter className="page__footer--sm" />
        </section>
      </div>
    </PageLayout>
  );
}
